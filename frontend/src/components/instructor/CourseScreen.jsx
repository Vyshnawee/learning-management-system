import { Link } from "react-router-dom";
import { BookOpen, PlusCircle, RotateCcw, TriangleAlert } from "lucide-react";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import Select from "../common/Select.jsx";

// picker = the result of useCoursePicker(). children is a function that receives the chosen course.
// actions (optional) is a function that returns buttons for the top right.
export default function CourseScreen({
     title,
     subtitle,
     picker,
     actions,
     children,
}) {
     const { status, courses, selected, selectCourse, errorMessage, reload } =
          picker;

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                         <h1 className="text-3xl font-bold sm:text-4xl">
                              {title}
                         </h1>
                         <p className="mt-2 text-on-surface-variant">
                              {subtitle}
                         </p>
                    </div>
                    {status === "success" && selected && actions
                         ? actions(selected)
                         : null}
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading"
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
                         title="Create a course first"
                         text="This page shows information about your courses. You don't have any yet."
                         action={
                              <Link
                                   to="/instructor/courses/new"
                                   className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
                              >
                                   <PlusCircle size={18} />
                                   Create a course
                              </Link>
                         }
                    />
               )}

               {status === "success" && selected && (
                    <>
                         <Select
                              label="Course"
                              value={selected.courseId}
                              onChange={(event) =>
                                   selectCourse(event.target.value)
                              }
                              className="mb-6 max-w-md"
                         >
                              {courses.map((course) => (
                                   <option
                                        key={course.courseId}
                                        value={course.courseId}
                                   >
                                        {course.title}
                                        {course.status !== "published"
                                             ? ` (${course.status})`
                                             : ""}
                                   </option>
                              ))}
                         </Select>
                         {children(selected)}
                    </>
               )}
          </div>
     );
}
