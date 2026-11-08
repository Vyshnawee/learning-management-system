import { useEffect, useState } from "react";
import axios from "axios";
import {
     BookOpen,
     CheckCircle2,
     RotateCcw,
     TrendingUp,
     TriangleAlert,
     Users,
} from "lucide-react";
import { useCoursePicker } from "../../hooks/useCoursePicker.js";
import { getCourseAnalytics } from "../../api/analyticsApi.js";
import CourseScreen from "../../components/instructor/CourseScreen.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import StarRating from "../../components/common/StarRating.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

function AnalyticsPanel({ course }) {
     const [state, setState] = useState({
          status: "loading",
          data: null,
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({ ...current, status: "loading" }));

          getCourseAnalytics(course.courseId, controller.signal)
               .then((res) =>
                    setState({
                         status: "success",
                         data: res.data,
                         errorMessage: "",
                    }),
               )
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    setState((current) => ({
                         ...current,
                         status: "error",
                         errorMessage: getErrorMessage(error),
                    }));
               });

          return () => controller.abort();
     }, [course.courseId, reloadKey]);

     if (state.status === "loading") {
          return (
               <div
                    role="status"
                    aria-label="Loading analytics"
                    className="h-80 animate-pulse rounded-xl bg-surface-low"
               />
          );
     }

     if (state.status === "error") {
          return (
               <EmptyState
                    icon={TriangleAlert}
                    title="Could not load the analytics"
                    text={state.errorMessage}
                    action={
                         <Button onClick={() => setReloadKey((key) => key + 1)}>
                              <RotateCcw size={16} />
                              Try again
                         </Button>
                    }
               />
          );
     }

     const d = state.data;

     return (
          <div className="space-y-8">
               <section
                    aria-label="Course numbers"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
               >
                    <StatCard
                         icon={Users}
                         label="Students enrolled"
                         value={d.enrollments}
                         hint={
                              d.enrollments === 0
                                   ? "No students yet"
                                   : undefined
                         }
                    />
                    <StatCard
                         icon={CheckCircle2}
                         label="Finished the course"
                         value={d.completed}
                         hint={`${d.completionRate}% completion rate`}
                    />
                    <StatCard
                         icon={TrendingUp}
                         label="Average progress"
                         value={`${d.averageProgress}%`}
                         hint="Across all enrolled students"
                    />
                    <StatCard
                         icon={BookOpen}
                         label="Lessons"
                         value={d.lessonCount}
                         hint={
                              d.lessonCount === 0
                                   ? "Add lessons to your course"
                                   : undefined
                         }
                    />
               </section>

               <section
                    aria-labelledby="ratings-heading"
                    className="rounded-xl border border-outline-variant bg-surface-low p-6"
               >
                    <h2
                         id="ratings-heading"
                         className="mb-4 text-xl font-semibold"
                    >
                         Ratings
                    </h2>
                    {d.ratingCount === 0 ? (
                         <p className="text-on-surface-variant">
                              This course has no reviews yet.
                         </p>
                    ) : (
                         <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
                              <div className="flex flex-col items-center justify-center sm:px-6">
                                   <p className="font-heading text-5xl font-bold">
                                        {d.ratingAverage.toFixed(1)}
                                   </p>
                                   <StarRating
                                        value={d.ratingAverage}
                                        size={18}
                                   />
                                   <p className="mt-1 text-sm text-on-surface-variant">
                                        {d.ratingCount}{" "}
                                        {d.ratingCount === 1
                                             ? "review"
                                             : "reviews"}
                                   </p>
                              </div>
                              <div className="space-y-2">
                                   {[5, 4, 3, 2, 1].map((star) => {
                                        const count =
                                             d.ratingBreakdown[star] || 0;
                                        const percent = Math.round(
                                             (count / d.ratingCount) * 100,
                                        );
                                        return (
                                             <div
                                                  key={star}
                                                  className="flex items-center gap-3 text-sm"
                                             >
                                                  <span className="w-12 shrink-0 text-on-surface-variant">
                                                       {star} star
                                                  </span>
                                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-highest">
                                                       <div
                                                            className="h-full rounded-full bg-primary"
                                                            style={{
                                                                 width: `${percent}%`,
                                                            }}
                                                       />
                                                  </div>
                                                  <span className="w-16 shrink-0 text-right text-on-surface-variant">
                                                       {count} ({percent}%)
                                                  </span>
                                             </div>
                                        );
                                   })}
                              </div>
                         </div>
                    )}
               </section>

               <section aria-labelledby="quiz-results-heading">
                    <h2
                         id="quiz-results-heading"
                         className="mb-1 text-xl font-semibold"
                    >
                         Quiz results
                    </h2>
                    <p className="mb-4 text-sm text-on-surface-variant">
                         The pass rate and average score are worked out from all
                         attempts, including repeats.
                    </p>
                    {d.quizzes.length === 0 ? (
                         <p className="rounded-xl border border-dashed border-outline-variant bg-surface-low p-6 text-on-surface-variant">
                              This course has no quizzes yet.
                         </p>
                    ) : (
                         <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-low">
                              <table className="w-full min-w-[640px] text-left text-sm">
                                   <caption className="sr-only">
                                        Quiz results for {course.title}
                                   </caption>
                                   <thead className="border-b border-outline-variant bg-surface-container text-xs uppercase tracking-wide text-on-surface-variant">
                                        <tr>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  Quiz
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 text-right font-semibold"
                                             >
                                                  Pass mark
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 text-right font-semibold"
                                             >
                                                  Attempts
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 text-right font-semibold"
                                             >
                                                  Students
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 text-right font-semibold"
                                             >
                                                  Pass rate
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 text-right font-semibold"
                                             >
                                                  Average score
                                             </th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {d.quizzes.map((quiz) => (
                                             <tr
                                                  key={quiz.quizId}
                                                  className="border-b border-outline-variant/60 last:border-b-0"
                                             >
                                                  <td className="px-4 py-3 font-semibold">
                                                       {quiz.title}
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                       {quiz.passingScore}%
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                       {quiz.attempts}
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                       {quiz.studentsAttempted}
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                       {quiz.attempts
                                                            ? `${quiz.passRate}%`
                                                            : "–"}
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                       {quiz.attempts
                                                            ? `${quiz.averagePercentage}%`
                                                            : "–"}
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </section>
          </div>
     );
}

export default function InstructorAnalyticsPage() {
     const picker = useCoursePicker();

     return (
          <CourseScreen
               title="Course analytics"
               subtitle="Enrollments, completion, ratings and quiz results for one course."
               picker={picker}
          >
               {(course) => (
                    <AnalyticsPanel key={course.courseId} course={course} />
               )}
          </CourseScreen>
     );
}
