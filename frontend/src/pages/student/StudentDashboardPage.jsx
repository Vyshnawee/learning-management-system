import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
     Award,
     BookOpen,
     CheckCircle2,
     Compass,
     PlayCircle,
     RotateCcw,
     TriangleAlert,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useMyEnrollments } from "../../hooks/useMyEnrollments.js";
import { getMyCertificates } from "../../api/certificateApi.js";
import StatCard from "../../components/common/StatCard.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import EnrolledCourseCard from "../../components/course/EnrolledCourseCard.jsx";
import CourseCardSkeleton from "../../components/course/CourseCardSkeleton.jsx";
import { getProgress } from "../../utils/progress.js";

const LEVELS = {
     beginner: "Beginner",
     intermediate: "Intermediate",
     advanced: "Advanced",
};
const linkPrimary =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";

export default function StudentDashboardPage() {
     const { user } = useAuth();
     const { status, enrollments, total, errorMessage, reload } =
          useMyEnrollments();
     const [certificateCount, setCertificateCount] = useState(null);

     useEffect(() => {
          const controller = new AbortController();
          getMyCertificates(controller.signal)
               .then((res) => setCertificateCount(res.data.certificates.length))
               .catch((error) => {
                    if (!axios.isCancel(error)) setCertificateCount(null);
               });
          return () => controller.abort();
     }, []);

     const firstName = user.name.split(" ")[0];

     const { lessonsCompleted, continueCourse } = useMemo(() => {
          const completed = enrollments.reduce(
               (sum, e) => sum + getProgress(e).done,
               0,
          );
          // The list is sorted by last activity, so the first unfinished course is the one to resume
          const resume = enrollments.find(
               (e) => e.courseId && !getProgress(e).isComplete,
          );
          return { lessonsCompleted: completed, continueCourse: resume };
     }, [enrollments]);

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         Welcome back, {firstName}
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         Track your progress and keep learning.
                    </p>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading your dashboard"
                         className="animate-pulse space-y-8"
                    >
                         <div className="grid gap-4 sm:grid-cols-3">
                              {[0, 1, 2].map((i) => (
                                   <div
                                        key={i}
                                        className="h-32 rounded-xl bg-surface-low"
                                   />
                              ))}
                         </div>
                         <div className="h-48 rounded-xl bg-surface-low" />
                         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              {[0, 1, 2].map((i) => (
                                   <CourseCardSkeleton key={i} />
                              ))}
                         </div>
                    </div>
               )}

               {status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load your dashboard"
                         text={errorMessage}
                         action={
                              <Button onClick={reload}>
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               )}

               {status === "success" && total === 0 && (
                    <EmptyState
                         icon={BookOpen}
                         title="You haven't enrolled in any courses yet"
                         text="Browse the catalog and enroll in a free course to start learning."
                         action={
                              <Link to="/courses" className={linkPrimary}>
                                   <Compass size={18} />
                                   Browse courses
                              </Link>
                         }
                    />
               )}

               {status === "success" && total > 0 && (
                    <div className="space-y-10">
                         <section
                              aria-label="Your stats"
                              className="grid gap-4 sm:grid-cols-3"
                         >
                              <StatCard
                                   icon={BookOpen}
                                   label="Courses enrolled"
                                   value={total}
                                   hint={`${enrollments.filter((e) => !getProgress(e).isComplete).length} in progress`}
                              />
                              <StatCard
                                   icon={CheckCircle2}
                                   label="Lessons completed"
                                   value={lessonsCompleted}
                              />
                              <StatCard
                                   icon={Award}
                                   label="Certificates earned"
                                   value={certificateCount ?? "–"}
                                   hint={
                                        certificateCount === 1
                                             ? "1 certificate"
                                             : undefined
                                   }
                              />
                         </section>

                         <section aria-labelledby="continue-heading">
                              <h2
                                   id="continue-heading"
                                   className="mb-4 text-2xl font-semibold"
                              >
                                   Continue learning
                              </h2>
                              {continueCourse ? (
                                   (() => {
                                        const {
                                             total: lessonTotal,
                                             done,
                                             percent,
                                        } = getProgress(continueCourse);
                                        const course = continueCourse.courseId;
                                        const lastLesson =
                                             continueCourse.lastAccessedLessonId
                                                  ?.title;
                                        return (
                                             <div className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-low p-6 md:flex-row md:items-center md:justify-between">
                                                  <div className="min-w-0 flex-1">
                                                       <div className="mb-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                                                            <span className="rounded bg-primary/15 px-2 py-0.5 text-primary">
                                                                 In progress
                                                            </span>
                                                            <span className="rounded bg-surface-high px-2 py-0.5">
                                                                 {LEVELS[
                                                                      course
                                                                           .level
                                                                 ] ||
                                                                      course.level}
                                                            </span>
                                                       </div>
                                                       <h3 className="text-2xl font-semibold">
                                                            {course.title}
                                                       </h3>
                                                       <p className="mt-1 text-sm text-on-surface-variant">
                                                            by{" "}
                                                            {course.instructorId
                                                                 ?.name ||
                                                                 "Instructor"}
                                                       </p>
                                                       <div className="mt-4 max-w-xl">
                                                            <div className="mb-2 flex justify-between text-sm">
                                                                 <span className="text-on-surface-variant">
                                                                      {done} of{" "}
                                                                      {
                                                                           lessonTotal
                                                                      }{" "}
                                                                      lessons
                                                                      completed
                                                                 </span>
                                                                 <span className="font-semibold text-primary">
                                                                      {percent}%
                                                                 </span>
                                                            </div>
                                                            <ProgressBar
                                                                 value={percent}
                                                                 label={`Progress in ${course.title}`}
                                                            />
                                                       </div>
                                                       {lastLesson && (
                                                            <p className="mt-3 text-sm text-on-surface-variant">
                                                                 Last lesson:{" "}
                                                                 <span className="text-on-surface">
                                                                      {
                                                                           lastLesson
                                                                      }
                                                                 </span>
                                                            </p>
                                                       )}
                                                  </div>
                                                  <Link
                                                       to={`/student/learn/${course._id}`}
                                                       className={`${linkPrimary} md:shrink-0`}
                                                  >
                                                       <PlayCircle size={18} />
                                                       {done === 0
                                                            ? "Start course"
                                                            : "Continue lesson"}
                                                  </Link>
                                             </div>
                                        );
                                   })()
                              ) : (
                                   <EmptyState
                                        icon={Award}
                                        title="You're all caught up"
                                        text="You've finished every course you enrolled in. Find your next one in the catalog."
                                        action={
                                             <Link
                                                  to="/courses"
                                                  className={linkPrimary}
                                             >
                                                  Browse courses
                                             </Link>
                                        }
                                   />
                              )}
                         </section>

                         <section aria-labelledby="enrolled-heading">
                              <div className="mb-4 flex items-end justify-between gap-3">
                                   <h2
                                        id="enrolled-heading"
                                        className="text-2xl font-semibold"
                                   >
                                        My enrolled courses
                                   </h2>
                                   {total > 3 && (
                                        <Link
                                             to="/student/courses"
                                             className="text-sm font-semibold text-primary hover:underline"
                                        >
                                             View all {total}
                                        </Link>
                                   )}
                              </div>
                              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                   {enrollments
                                        .slice(0, 3)
                                        .map((enrollment) => (
                                             <EnrolledCourseCard
                                                  key={enrollment._id}
                                                  enrollment={enrollment}
                                             />
                                        ))}
                              </div>
                         </section>
                    </div>
               )}
          </div>
     );
}
