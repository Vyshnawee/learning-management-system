import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
     ArrowLeft,
     ArrowRight,
     CheckCircle2,
     ExternalLink,
     FileText,
     RotateCcw,
     SearchX,
     TriangleAlert,
} from "lucide-react";
import { getCourse, getCurriculum } from "../../api/courseApi.js";
import {
     getEnrollment,
     setLastLesson,
     updateProgress,
} from "../../api/enrollmentApi.js";
import { getCourseQuizzes } from "../../api/quizApi.js";
import PageLoader from "../../components/common/PageLoader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import VideoPlayer from "../../components/course/VideoPlayer.jsx";
import LessonSidebar from "../../components/course/LessonSidebar.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDuration } from "../../utils/format.js";

const primaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";

export default function LearningPage() {
     const { courseId, lessonId } = useParams();
     const navigate = useNavigate();

     const [data, setData] = useState(null); // { course, sections, quizzes, enrollmentId }
     const [completedIds, setCompletedIds] = useState([]);
     const [resumeId, setResumeId] = useState(null);
     const [status, setStatus] = useState("loading"); // loading | ready | notenrolled | notfound | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);

     const [tab, setTab] = useState("overview"); // overview | resources
     const [marking, setMarking] = useState(false);
     const [markError, setMarkError] = useState("");
     const savedLessonRef = useRef(null);

     // Load the course, its curriculum, and this student's progress
     useEffect(() => {
          const controller = new AbortController();
          const { signal } = controller;
          setStatus("loading");

          const load = async () => {
               try {
                    const [courseRes, curriculumRes] = await Promise.all([
                         getCourse(courseId, signal),
                         getCurriculum(courseId, signal),
                    ]);
                    const { course, viewer } = courseRes.data;

                    if (!viewer.isEnrolled) {
                         setData({ course });
                         setStatus("notenrolled");
                         return;
                    }

                    const [enrollmentRes, quizzes] = await Promise.all([
                         getEnrollment(viewer.enrollmentId, signal),
                         // A failed quiz list must not break the whole page
                         getCourseQuizzes(courseId, signal)
                              .then((res) => res.data.quizzes)
                              .catch(() => []),
                    ]);
                    if (signal.aborted) return;

                    const enrollment = enrollmentRes.data.enrollment;
                    setData({
                         course,
                         sections: curriculumRes.data.sections,
                         quizzes,
                         enrollmentId: viewer.enrollmentId,
                    });
                    setCompletedIds(enrollment.completedLessonIds);
                    setResumeId(enrollment.lastAccessedLessonId);
                    setStatus("ready");
               } catch (error) {
                    if (axios.isCancel(error)) return;
                    const code = error.response?.status;
                    if (code === 404 || code === 400) {
                         setStatus("notfound");
                    } else {
                         setErrorMessage(getErrorMessage(error));
                         setStatus("error");
                    }
               }
          };

          load();
          return () => controller.abort();
     }, [courseId, reloadKey]);

     // All lessons in order, as one flat list
     const lessons = useMemo(
          () =>
               data?.sections
                    ? data.sections.flatMap((section) => section.lessons)
                    : [],
          [data],
     );
     const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
     const currentIndex = lessons.findIndex(
          (lesson) => lesson._id === lessonId,
     );
     const current = currentIndex >= 0 ? lessons[currentIndex] : null;

     // No lesson in the URL (or a wrong one): resume where the student left off
     useEffect(() => {
          if (status !== "ready" || lessons.length === 0) return;
          if (current) return;

          const target =
               lessons.find((lesson) => lesson._id === resumeId) ||
               lessons.find((lesson) => !completedSet.has(lesson._id)) ||
               lessons[0];
          navigate(`/student/learn/${courseId}/${target._id}`, {
               replace: true,
          });
     }, [status, lessons, current, resumeId, completedSet, courseId, navigate]);

     // Remember the lesson that was opened, so "Continue learning" returns here
     useEffect(() => {
          if (status !== "ready" || !current) return;
          if (savedLessonRef.current === current._id) return;
          savedLessonRef.current = current._id;
          setLastLesson(data.enrollmentId, current._id).catch(() => {});
     }, [status, current, data]);

     // Show the lesson name in the browser tab
     const pageTitle = data?.course?.title;
     useEffect(() => {
          if (!pageTitle) return;
          const previous = document.title;
          document.title = current
               ? `${current.title} | ${pageTitle}`
               : pageTitle;
          return () => {
               document.title = previous;
          };
     }, [pageTitle, current]);

     // Start on the Overview tab for each lesson
     useEffect(() => {
          setTab("overview");
          setMarkError("");
     }, [lessonId]);

     const progress = useMemo(() => {
          const total = lessons.length;
          const done = lessons.filter((lesson) =>
               completedSet.has(lesson._id),
          ).length;
          return {
               total,
               done,
               percent: total ? Math.floor((done / total) * 100) : 0,
          };
     }, [lessons, completedSet]);

     const isDone = current ? completedSet.has(current._id) : false;

     const toggleComplete = async () => {
          setMarking(true);
          setMarkError("");
          try {
               const res = await updateProgress(data.enrollmentId, {
                    lessonId: current._id,
                    completed: !isDone,
               });
               setCompletedIds(res.data.completedLessonIds);
          } catch (error) {
               setMarkError(getErrorMessage(error));
          } finally {
               setMarking(false);
          }
     };

     if (status === "loading")
          return <PageLoader label="Loading your course..." />;

     if (
          status === "notfound" ||
          status === "error" ||
          status === "notenrolled"
     ) {
          const states = {
               notfound: {
                    icon: SearchX,
                    title: "Course not found",
                    text: "This course doesn't exist or isn't available right now.",
                    action: (
                         <Link to="/student/courses" className={primaryLink}>
                              Back to my courses
                         </Link>
                    ),
               },
               error: {
                    icon: TriangleAlert,
                    title: "Could not load this course",
                    text: errorMessage,
                    action: (
                         <Button onClick={() => setReloadKey((key) => key + 1)}>
                              <RotateCcw size={16} />
                              Try again
                         </Button>
                    ),
               },
               notenrolled: {
                    icon: SearchX,
                    title: "You are not enrolled in this course",
                    text: "Enroll first to watch the lessons and track your progress.",
                    action: (
                         <Link
                              to={`/courses/${courseId}`}
                              className={primaryLink}
                         >
                              View course
                         </Link>
                    ),
               },
          };
          const state = states[status];
          return (
               <div className="mx-auto max-w-3xl px-4 py-16">
                    <EmptyState
                         icon={state.icon}
                         title={state.title}
                         text={state.text}
                         action={state.action}
                    />
               </div>
          );
     }

     const { course, sections, quizzes } = data;

     if (lessons.length === 0) {
          return (
               <div className="mx-auto max-w-3xl px-4 py-16">
                    <EmptyState
                         icon={FileText}
                         title="No lessons yet"
                         text="The instructor hasn't added any lessons to this course yet. Please check back soon."
                         action={
                              <Link
                                   to="/student/courses"
                                   className={primaryLink}
                              >
                                   Back to my courses
                              </Link>
                         }
                    />
               </div>
          );
     }

     // The redirect effect is about to run
     if (!current) return <PageLoader label="Opening your lesson..." />;

     const previous = lessons[currentIndex - 1];
     const next = lessons[currentIndex + 1];
     const resources = current.resources || [];
     const allDone = progress.total > 0 && progress.done === progress.total;

     const tabClass = (id) =>
          `min-h-11 border-b-2 px-4 text-sm font-semibold transition ${
               tab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`;

     return (
          <div className="min-h-screen">
               {/* Top bar */}
               <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur">
                    <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
                         <Link
                              to="/student/courses"
                              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg pr-2 text-sm text-on-surface-variant hover:text-on-surface"
                         >
                              <ArrowLeft size={18} />
                              <span className="hidden sm:inline">
                                   My courses
                              </span>
                         </Link>
                         <span className="hidden h-5 w-px bg-outline-variant sm:block" />
                         <Link
                              to={`/courses/${course._id}`}
                              className="min-w-0 flex-1 truncate font-heading font-semibold hover:text-primary"
                         >
                              {course.title}
                         </Link>
                         <span className="shrink-0 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold">
                              {progress.percent}% complete
                         </span>
                    </div>
               </header>

               <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px]">
                    {/* 1. Video and lesson controls */}
                    <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                         <VideoPlayer
                              key={current._id}
                              url={current.videoUrl}
                              title={current.title}
                         />

                         <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0">
                                   <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                        Lesson {currentIndex + 1} of{" "}
                                        {lessons.length} ·{" "}
                                        {formatDuration(current.duration)}
                                   </p>
                                   <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                        {current.title}
                                   </h1>
                              </div>

                              <div className="flex shrink-0 flex-wrap gap-2">
                                   <Button
                                        variant={
                                             isDone ? "secondary" : "primary"
                                        }
                                        loading={marking}
                                        onClick={toggleComplete}
                                        aria-pressed={isDone}
                                   >
                                        <CheckCircle2
                                             size={18}
                                             className={
                                                  isDone ? "text-primary" : ""
                                             }
                                        />
                                        {isDone
                                             ? "Completed (undo)"
                                             : "Mark as completed"}
                                   </Button>
                                   {previous && (
                                        <Link
                                             to={`/student/learn/${courseId}/${previous._id}`}
                                             aria-label="Previous lesson"
                                             className="inline-flex min-h-11 items-center justify-center rounded-lg border border-outline-variant px-3 hover:bg-surface-high"
                                        >
                                             <ArrowLeft size={18} />
                                        </Link>
                                   )}
                                   {next ? (
                                        <Link
                                             to={`/student/learn/${courseId}/${next._id}`}
                                             className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 font-semibold hover:bg-surface-high"
                                        >
                                             Next lesson
                                             <ArrowRight size={18} />
                                        </Link>
                                   ) : (
                                        <span className="inline-flex min-h-11 items-center rounded-lg border border-outline-variant px-4 text-sm text-outline">
                                             Last lesson
                                        </span>
                                   )}
                              </div>
                         </div>

                         {markError && (
                              <div className="mt-4">
                                   <Alert>{markError}</Alert>
                              </div>
                         )}

                         {allDone && (
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/40 bg-secondary/10 p-4">
                                   <p className="font-semibold text-secondary">
                                        You&apos;ve completed every lesson in
                                        this course. Great work!
                                   </p>
                                   <Link
                                        to="/student/courses"
                                        className="text-sm font-semibold text-primary hover:underline"
                                   >
                                        Back to my courses
                                   </Link>
                              </div>
                         )}
                    </div>

                    {/* 2. Course content. On phones it sits right under the video. */}
                    <aside className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
                         <LessonSidebar
                              courseId={courseId}
                              sections={sections}
                              quizzes={quizzes}
                              completedSet={completedSet}
                              currentLessonId={current._id}
                              progress={progress}
                         />
                    </aside>

                    {/* 3. Overview and resources */}
                    <section
                         aria-label="Lesson details"
                         className="min-w-0 rounded-xl border border-outline-variant bg-surface-low lg:col-start-1 lg:row-start-2"
                    >
                         <div
                              role="tablist"
                              className="flex border-b border-outline-variant px-2"
                         >
                              <button
                                   role="tab"
                                   aria-selected={tab === "overview"}
                                   onClick={() => setTab("overview")}
                                   className={tabClass("overview")}
                              >
                                   Overview
                              </button>
                              <button
                                   role="tab"
                                   aria-selected={tab === "resources"}
                                   onClick={() => setTab("resources")}
                                   className={tabClass("resources")}
                              >
                                   Resources ({resources.length})
                              </button>
                         </div>

                         <div className="p-5">
                              {tab === "overview" ? (
                                   <div>
                                        <h2 className="mb-2 text-lg font-semibold">
                                             About this lesson
                                        </h2>
                                        <p className="whitespace-pre-line text-on-surface-variant">
                                             {current.description ||
                                                  "The instructor hasn't added a description for this lesson."}
                                        </p>
                                   </div>
                              ) : resources.length === 0 ? (
                                   <p className="text-on-surface-variant">
                                        This lesson has no extra resources.
                                   </p>
                              ) : (
                                   <ul className="space-y-2">
                                        {resources.map((resource) => (
                                             <li key={resource.url}>
                                                  <a
                                                       href={resource.url}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-outline-variant px-4 py-3 hover:bg-surface-container"
                                                  >
                                                       <span className="flex min-w-0 items-center gap-3">
                                                            <FileText
                                                                 size={18}
                                                                 className="shrink-0 text-primary"
                                                            />
                                                            <span className="truncate">
                                                                 {
                                                                      resource.title
                                                                 }
                                                            </span>
                                                       </span>
                                                       <ExternalLink
                                                            size={16}
                                                            className="shrink-0 text-outline"
                                                       />
                                                  </a>
                                             </li>
                                        ))}
                                   </ul>
                              )}
                         </div>
                    </section>
               </div>
          </div>
     );
}
