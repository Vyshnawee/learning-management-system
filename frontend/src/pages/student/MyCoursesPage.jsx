import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
     BookOpen,
     Compass,
     RotateCcw,
     Search,
     SearchX,
     TriangleAlert,
} from "lucide-react";
import { useMyEnrollments } from "../../hooks/useMyEnrollments.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import EnrolledCourseCard from "../../components/course/EnrolledCourseCard.jsx";
import CourseCardSkeleton from "../../components/course/CourseCardSkeleton.jsx";
import { getProgress } from "../../utils/progress.js";

const LIMIT = 50;

export default function MyCoursesPage() {
     const { status, enrollments, total, errorMessage, reload } =
          useMyEnrollments(LIMIT);
     const [tab, setTab] = useState("all"); // all | progress | completed
     const [query, setQuery] = useState("");

     const counts = useMemo(() => {
          const completed = enrollments.filter(
               (e) => getProgress(e).isComplete,
          ).length;
          return {
               all: enrollments.length,
               completed,
               progress: enrollments.length - completed,
          };
     }, [enrollments]);

     const visible = useMemo(() => {
          const text = query.trim().toLowerCase();
          return enrollments.filter((e) => {
               if (!e.courseId) return false;
               const { isComplete } = getProgress(e);
               if (tab === "progress" && isComplete) return false;
               if (tab === "completed" && !isComplete) return false;
               return !text || e.courseId.title.toLowerCase().includes(text);
          });
     }, [enrollments, tab, query]);

     const tabs = [
          { id: "all", label: "All", count: counts.all },
          { id: "progress", label: "In progress", count: counts.progress },
          { id: "completed", label: "Completed", count: counts.completed },
     ];

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         My courses
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         Track your learning progress and continue your enrolled
                         courses.
                    </p>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading your courses"
                         className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                         {[0, 1, 2].map((i) => (
                              <CourseCardSkeleton key={i} />
                         ))}
                    </div>
               )}

               {status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load your courses"
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
                         title="No courses yet"
                         text="When you enroll in a course, it will show up here."
                         action={
                              <Link
                                   to="/courses"
                                   className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
                              >
                                   <Compass size={18} />
                                   Browse courses
                              </Link>
                         }
                    />
               )}

               {status === "success" && total > 0 && (
                    <>
                         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div
                                   role="tablist"
                                   aria-label="Filter courses"
                                   className="flex flex-wrap gap-2"
                              >
                                   {tabs.map((item) => (
                                        <button
                                             key={item.id}
                                             role="tab"
                                             aria-selected={tab === item.id}
                                             onClick={() => setTab(item.id)}
                                             className={`min-h-11 rounded-full border px-4 text-sm font-medium transition ${
                                                  tab === item.id
                                                       ? "border-primary bg-primary text-on-primary"
                                                       : "border-outline-variant hover:bg-surface-high"
                                             }`}
                                        >
                                             {item.label} ({item.count})
                                        </button>
                                   ))}
                              </div>

                              <div className="relative w-full sm:w-72">
                                   <label
                                        htmlFor="my-courses-search"
                                        className="sr-only"
                                   >
                                        Search your courses
                                   </label>
                                   <Search
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
                                   />
                                   <input
                                        id="my-courses-search"
                                        type="search"
                                        value={query}
                                        onChange={(event) =>
                                             setQuery(event.target.value)
                                        }
                                        placeholder="Search your courses..."
                                        className="min-h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest py-2.5 pl-10 pr-3 outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                                   />
                              </div>
                         </div>

                         {visible.length === 0 ? (
                              <EmptyState
                                   icon={SearchX}
                                   title="No matching courses"
                                   text="Try a different tab or search word."
                                   action={
                                        <Button
                                             variant="secondary"
                                             onClick={() => {
                                                  setTab("all");
                                                  setQuery("");
                                             }}
                                        >
                                             Clear filters
                                        </Button>
                                   }
                              />
                         ) : (
                              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                   {visible.map((enrollment) => (
                                        <EnrolledCourseCard
                                             key={enrollment._id}
                                             enrollment={enrollment}
                                        />
                                   ))}
                              </div>
                         )}

                         {total > LIMIT && (
                              <p className="mt-6 text-center text-sm text-on-surface-variant">
                                   Showing your {LIMIT} most recently studied
                                   courses of {total}.
                              </p>
                         )}
                    </>
               )}
          </div>
     );
}
