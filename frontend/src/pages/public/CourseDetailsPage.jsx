import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Check, RotateCcw, SearchX, TriangleAlert, Users } from "lucide-react";
import { getCourse, getCurriculum } from "../../api/courseApi.js";
import StarRating from "../../components/common/StarRating.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import CurriculumAccordion from "../../components/course/CurriculumAccordion.jsx";
import EnrollCard from "../../components/course/EnrollCard.jsx";
import ReviewsSection from "../../components/course/ReviewsSection.jsx";
import ReviewForm from "../../components/course/ReviewForm.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const LEVELS = {
     beginner: "Beginner",
     intermediate: "Intermediate",
     advanced: "Advanced",
};

function PageSkeleton() {
     return (
          <div
               role="status"
               aria-label="Loading course"
               className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6"
          >
               <div className="mb-4 h-4 w-48 rounded bg-surface-high" />
               <div className="mb-3 h-10 w-3/4 rounded bg-surface-high" />
               <div className="mb-8 h-5 w-1/2 rounded bg-surface-container" />
               <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-4">
                         <div className="h-40 rounded-xl bg-surface-low" />
                         <div className="h-64 rounded-xl bg-surface-low" />
                    </div>
                    <div className="h-96 rounded-xl bg-surface-low" />
               </div>
          </div>
     );
}

export default function CourseDetailsPage() {
     const { courseId } = useParams();
     const [data, setData] = useState(null);
     const [curriculum, setCurriculum] = useState(null);
     const [status, setStatus] = useState("loading"); // loading | success | notfound | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);
     const [reviewsVersion, setReviewsVersion] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          Promise.all([
               getCourse(courseId, controller.signal),
               getCurriculum(courseId, controller.signal),
          ])
               .then(([courseRes, curriculumRes]) => {
                    setData(courseRes.data);
                    setCurriculum(curriculumRes.data);
                    setStatus("success");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    const code = error.response?.status;
                    if (code === 404 || code === 400) {
                         setStatus("notfound");
                    } else {
                         setErrorMessage(getErrorMessage(error));
                         setStatus("error");
                    }
               });

          return () => controller.abort();
     }, [courseId, reloadKey]);

     // Browser tab title
     const title = data?.course.title;
     useEffect(() => {
          if (!title) return;
          const previous = document.title;
          document.title = `${title} | LearnHub`;
          return () => {
               document.title = previous;
          };
     }, [title]);

     const handleEnrolled = () => {
          setData((current) => ({
               ...current,
               viewer: { ...current.viewer, isEnrolled: true },
               stats: {
                    ...current.stats,
                    enrollmentCount: current.stats.enrollmentCount + 1,
               },
          }));
     };

     // After a review is added, edited or deleted: refresh the average and the review list
     const handleReviewChanged = async () => {
          try {
               const res = await getCourse(courseId);
               setData((current) => ({
                    ...current,
                    course: res.data.course,
                    stats: res.data.stats,
               }));
          } catch {
               // If this fails, the old numbers stay until the next page load
          }
          setReviewsVersion((version) => version + 1);
     };

     if (status === "loading") return <PageSkeleton />;

     if (status === "notfound") {
          return (
               <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <EmptyState
                         icon={SearchX}
                         title="Course not found"
                         text="This course doesn't exist, or it hasn't been published yet."
                         action={
                              <Link
                                   to="/courses"
                                   className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
                              >
                                   Browse courses
                              </Link>
                         }
                    />
               </div>
          );
     }

     if (status === "error") {
          return (
               <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load this course"
                         text={errorMessage}
                         action={
                              <Button
                                   onClick={() =>
                                        setReloadKey((key) => key + 1)
                                   }
                              >
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               </div>
          );
     }

     const { course, stats, viewer } = data;
     const instructor = course.instructorId;
     const hasAccess = viewer.isEnrolled || viewer.canManage;
     const hasRating = course.ratingCount > 0;

     return (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
               {/* Header */}
               <header className="mb-8">
                    <nav
                         aria-label="Breadcrumb"
                         className="mb-4 text-sm text-on-surface-variant"
                    >
                         <Link to="/courses" className="hover:text-on-surface">
                              Courses
                         </Link>
                         <span className="mx-2">/</span>
                         <span className="text-on-surface">{course.title}</span>
                    </nav>

                    <div className="mb-3 flex flex-wrap gap-2">
                         <span className="rounded-md bg-surface-high px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                              {LEVELS[course.level] || course.level}
                         </span>
                         {course.categoryId?.name && (
                              <span className="rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                   {course.categoryId.name}
                              </span>
                         )}
                         {course.status !== "published" && (
                              <span className="rounded-md bg-secondary/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                                   {course.status} (only you can see this)
                              </span>
                         )}
                    </div>

                    <h1 className="mb-3 text-4xl font-bold leading-tight">
                         {course.title}
                    </h1>
                    <p className="mb-5 max-w-3xl text-lg text-on-surface-variant">
                         {course.shortDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-on-surface-variant">
                         <span>
                              Created by{" "}
                              <span className="font-semibold text-primary">
                                   {instructor?.name}
                              </span>
                         </span>
                         <span className="flex items-center gap-2">
                              {hasRating ? (
                                   <>
                                        <span className="font-semibold text-on-surface">
                                             {course.ratingAverage.toFixed(1)}
                                        </span>
                                        <StarRating
                                             value={course.ratingAverage}
                                        />
                                        <span>
                                             ({course.ratingCount} ratings)
                                        </span>
                                   </>
                              ) : (
                                   <span>No ratings yet</span>
                              )}
                         </span>
                         <span className="flex items-center gap-1.5">
                              <Users size={16} />
                              {stats.enrollmentCount}{" "}
                              {stats.enrollmentCount === 1
                                   ? "learner"
                                   : "learners"}{" "}
                              enrolled
                         </span>
                    </div>
               </header>

               <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    {/* The enroll card comes first on phones, and on the right on desktop */}
                    <aside className="order-first lg:order-none lg:col-start-2 lg:row-start-1">
                         <div className="lg:sticky lg:top-24">
                              <EnrollCard
                                   course={course}
                                   totalLessons={curriculum.totalLessons}
                                   totalDuration={curriculum.totalDuration}
                                   viewer={viewer}
                                   onEnrolled={handleEnrolled}
                              />
                         </div>
                    </aside>

                    <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-1">
                         <section aria-labelledby="about-heading">
                              <h2
                                   id="about-heading"
                                   className="mb-3 text-2xl font-semibold"
                              >
                                   About this course
                              </h2>
                              <p className="whitespace-pre-line text-on-surface-variant">
                                   {course.description}
                              </p>
                         </section>

                         {course.learningObjectives.length > 0 && (
                              <section
                                   aria-labelledby="learn-heading"
                                   className="rounded-xl border border-outline-variant bg-surface-low p-6"
                              >
                                   <h2
                                        id="learn-heading"
                                        className="mb-4 text-2xl font-semibold"
                                   >
                                        What you will learn
                                   </h2>
                                   <ul className="grid gap-3 sm:grid-cols-2">
                                        {course.learningObjectives.map(
                                             (item) => (
                                                  <li
                                                       key={item}
                                                       className="flex gap-3 text-on-surface-variant"
                                                  >
                                                       <Check
                                                            size={18}
                                                            className="mt-0.5 shrink-0 text-primary"
                                                       />
                                                       {item}
                                                  </li>
                                             ),
                                        )}
                                   </ul>
                              </section>
                         )}

                         {course.prerequisites.length > 0 && (
                              <section aria-labelledby="prereq-heading">
                                   <h2
                                        id="prereq-heading"
                                        className="mb-3 text-2xl font-semibold"
                                   >
                                        Prerequisites
                                   </h2>
                                   <ul className="list-inside list-disc space-y-1 text-on-surface-variant">
                                        {course.prerequisites.map((item) => (
                                             <li key={item}>{item}</li>
                                        ))}
                                   </ul>
                              </section>
                         )}

                         <section aria-labelledby="curriculum-heading">
                              <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
                                   <h2
                                        id="curriculum-heading"
                                        className="text-2xl font-semibold"
                                   >
                                        Curriculum
                                   </h2>
                                   <p className="text-sm text-on-surface-variant">
                                        {curriculum.sections.length}{" "}
                                        {curriculum.sections.length === 1
                                             ? "section"
                                             : "sections"}{" "}
                                        · {curriculum.totalLessons}{" "}
                                        {curriculum.totalLessons === 1
                                             ? "lesson"
                                             : "lessons"}
                                   </p>
                              </div>
                              {curriculum.sections.length === 0 ? (
                                   <p className="mt-3 text-on-surface-variant">
                                        The curriculum hasn&apos;t been added
                                        yet.
                                   </p>
                              ) : (
                                   <CurriculumAccordion
                                        sections={curriculum.sections}
                                        hasAccess={hasAccess}
                                   />
                              )}
                         </section>

                         <section
                              aria-labelledby="instructor-heading"
                              className="rounded-xl border border-outline-variant bg-surface-low p-6"
                         >
                              <h2
                                   id="instructor-heading"
                                   className="mb-4 text-2xl font-semibold"
                              >
                                   Your instructor
                              </h2>
                              <div className="flex items-start gap-4">
                                   <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-highest text-2xl font-bold">
                                        {instructor?.profileImage ? (
                                             <img
                                                  src={instructor.profileImage}
                                                  alt=""
                                                  className="h-full w-full object-cover"
                                             />
                                        ) : (
                                             (instructor?.name || "?")
                                                  .charAt(0)
                                                  .toUpperCase()
                                        )}
                                   </span>
                                   <div>
                                        <p className="text-lg font-semibold">
                                             {instructor?.name}
                                        </p>
                                        <p className="mt-1 text-on-surface-variant">
                                             {instructor?.bio ||
                                                  "This instructor hasn't added a bio yet."}
                                        </p>
                                   </div>
                              </div>
                         </section>

                         {viewer.isEnrolled && (
                              <ReviewForm
                                   courseId={course._id}
                                   onChanged={handleReviewChanged}
                              />
                         )}

                         <ReviewsSection
                              courseId={course._id}
                              ratingAverage={course.ratingAverage}
                              ratingCount={course.ratingCount}
                              breakdown={stats.ratingBreakdown}
                              refreshKey={reviewsVersion}
                         />
                    </div>
               </div>
          </div>
     );
}
