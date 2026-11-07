import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
     BookOpen,
     PlusCircle,
     RotateCcw,
     Search,
     SearchX,
     TriangleAlert,
} from "lucide-react";
import { useInstructorDashboard } from "../../hooks/useInstructorDashboard.js";
import { deleteCourse, publishCourse } from "../../api/courseApi.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import CourseTable from "../../components/instructor/CourseTable.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const createLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";

const TABS = [
     { id: "all", label: "All" },
     { id: "published", label: "Published" },
     { id: "draft", label: "Drafts" },
     { id: "archived", label: "Archived" },
];

export default function InstructorCoursesPage() {
     const { status, data, errorMessage, reload, refresh } =
          useInstructorDashboard();
     const [tab, setTab] = useState("all");
     const [query, setQuery] = useState("");
     const [busyId, setBusyId] = useState(null);
     const [actionError, setActionError] = useState("");

     const courses = useMemo(() => data?.perCourse ?? [], [data]);

     const counts = useMemo(
          () => ({
               all: courses.length,
               published: courses.filter((c) => c.status === "published")
                    .length,
               draft: courses.filter((c) => c.status === "draft").length,
               archived: courses.filter((c) => c.status === "archived").length,
          }),
          [courses],
     );

     const visible = useMemo(() => {
          const text = query.trim().toLowerCase();
          return courses.filter(
               (c) =>
                    (tab === "all" || c.status === tab) &&
                    (!text || c.title.toLowerCase().includes(text)),
          );
     }, [courses, tab, query]);

     const handleTogglePublish = async (course) => {
          setBusyId(course.courseId);
          setActionError("");
          try {
               await publishCourse(
                    course.courseId,
                    course.status !== "published",
               );
               refresh();
          } catch (error) {
               // For example: "Add at least one lesson before publishing"
               setActionError(`${course.title}: ${getErrorMessage(error)}`);
          } finally {
               setBusyId(null);
          }
     };

     const handleDelete = async (course) => {
          setBusyId(course.courseId);
          setActionError("");
          try {
               await deleteCourse(course.courseId);
               refresh();
          } catch (error) {
               setActionError(`${course.title}: ${getErrorMessage(error)}`);
          } finally {
               setBusyId(null);
          }
     };

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                         <h1 className="text-3xl font-bold sm:text-4xl">
                              My courses
                         </h1>
                         <p className="mt-2 text-on-surface-variant">
                              Create, publish and manage the courses you teach.
                         </p>
                    </div>
                    <Link to="/instructor/courses/new" className={createLink}>
                         <PlusCircle size={18} />
                         Create course
                    </Link>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading your courses"
                         className="h-72 animate-pulse rounded-xl bg-surface-low"
                    />
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

               {status === "success" && courses.length === 0 && (
                    <EmptyState
                         icon={BookOpen}
                         title="No courses yet"
                         text="Your courses will show up here after you create them."
                         action={
                              <Link
                                   to="/instructor/courses/new"
                                   className={createLink}
                              >
                                   <PlusCircle size={18} />
                                   Create your first course
                              </Link>
                         }
                    />
               )}

               {status === "success" && courses.length > 0 && (
                    <>
                         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div
                                   role="tablist"
                                   aria-label="Filter courses"
                                   className="flex flex-wrap gap-2"
                              >
                                   {TABS.map((item) => (
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
                                             {item.label} ({counts[item.id]})
                                        </button>
                                   ))}
                              </div>

                              <div className="relative w-full sm:w-72">
                                   <label
                                        htmlFor="instructor-course-search"
                                        className="sr-only"
                                   >
                                        Search your courses
                                   </label>
                                   <Search
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
                                   />
                                   <input
                                        id="instructor-course-search"
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

                         {actionError && (
                              <div className="mb-4">
                                   <Alert>{actionError}</Alert>
                              </div>
                         )}

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
                              <CourseTable
                                   courses={visible}
                                   manage
                                   busyId={busyId}
                                   onTogglePublish={handleTogglePublish}
                                   onDelete={handleDelete}
                              />
                         )}
                    </>
               )}
          </div>
     );
}
