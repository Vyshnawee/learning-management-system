import { useEffect, useState } from "react";
import axios from "axios";
import { RotateCcw, TriangleAlert, Users } from "lucide-react";
import { useCoursePicker } from "../../hooks/useCoursePicker.js";
import { getCourseEnrollments } from "../../api/enrollmentApi.js";
import CourseScreen from "../../components/instructor/CourseScreen.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDate } from "../../utils/format.js";

const LIMIT = 10;

const STATUS_STYLES = {
     Completed: "bg-secondary/20 text-secondary",
     "In progress": "bg-primary/15 text-primary",
     "Not started": "bg-surface-highest text-on-surface-variant",
};

function StudentsPanel({ course }) {
     const [page, setPage] = useState(1);
     const [reloadKey, setReloadKey] = useState(0);
     const [state, setState] = useState({
          status: "loading",
          enrollments: [],
          pagination: null,
          finished: 0,
          errorMessage: "",
     });

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({ ...current, status: "loading" }));

          getCourseEnrollments(
               course.courseId,
               { page, limit: LIMIT },
               controller.signal,
          )
               .then((res) =>
                    setState({
                         status: "success",
                         enrollments: res.data.enrollments,
                         pagination: res.pagination,
                         finished: res.data.completedCount,
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
     }, [course.courseId, page, reloadKey]);

     if (state.status === "loading") {
          return (
               <div
                    role="status"
                    aria-label="Loading students"
                    className="h-64 animate-pulse rounded-xl bg-surface-low"
               />
          );
     }

     if (state.status === "error") {
          return (
               <EmptyState
                    icon={TriangleAlert}
                    title="Could not load the students"
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

     if (state.pagination.total === 0) {
          return (
               <EmptyState
                    icon={Users}
                    title="No students yet"
                    text={
                         course.status === "published"
                              ? "Nobody has enrolled in this course yet."
                              : "Publish this course so students can find and enroll in it."
                    }
               />
          );
     }

     return (
          <div className="space-y-4">
               <p className="text-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface">
                         {state.pagination.total}
                    </span>{" "}
                    {state.pagination.total === 1 ? "student" : "students"}{" "}
                    enrolled ·{" "}
                    <span className="font-semibold text-on-surface">
                         {state.finished}
                    </span>{" "}
                    finished the course
               </p>

               <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-low">
                    <table className="w-full min-w-[640px] text-left text-sm">
                         <caption className="sr-only">
                              Students enrolled in {course.title}
                         </caption>
                         <thead className="border-b border-outline-variant bg-surface-container text-xs uppercase tracking-wide text-on-surface-variant">
                              <tr>
                                   <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                   >
                                        Student
                                   </th>
                                   <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                   >
                                        Enrolled
                                   </th>
                                   <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                   >
                                        Progress
                                   </th>
                                   <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                   >
                                        Status
                                   </th>
                              </tr>
                         </thead>
                         <tbody>
                              {state.enrollments.map((enrollment) => {
                                   const student = enrollment.studentId;
                                   const total = enrollment.lessonCount;
                                   const done = Math.min(
                                        enrollment.lessonsDone,
                                        total,
                                   );
                                   const percent = total
                                        ? Math.floor((done / total) * 100)
                                        : 0;
                                   const label =
                                        total > 0 && done === total
                                             ? "Completed"
                                             : done > 0
                                               ? "In progress"
                                               : "Not started";

                                   return (
                                        <tr
                                             key={enrollment._id}
                                             className="border-b border-outline-variant/60 last:border-b-0"
                                        >
                                             <td className="px-4 py-3">
                                                  <div className="flex items-center gap-3">
                                                       <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-highest text-sm font-bold">
                                                            {(
                                                                 student?.name ||
                                                                 "?"
                                                            )
                                                                 .charAt(0)
                                                                 .toUpperCase()}
                                                       </span>
                                                       <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                 {student?.name ||
                                                                      "Deleted user"}
                                                            </p>
                                                            <p className="truncate text-xs text-on-surface-variant">
                                                                 {student?.email ||
                                                                      ""}
                                                            </p>
                                                       </div>
                                                  </div>
                                             </td>
                                             <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                                                  {formatDate(
                                                       enrollment.enrolledAt,
                                                  )}
                                             </td>
                                             <td className="w-56 px-4 py-3">
                                                  <p className="mb-1 text-xs text-on-surface-variant">
                                                       {done} of {total}{" "}
                                                       {total === 1
                                                            ? "lesson"
                                                            : "lessons"}{" "}
                                                       · {percent}%
                                                  </p>
                                                  <ProgressBar
                                                       value={percent}
                                                       label={`Progress of ${student?.name || "student"}`}
                                                  />
                                             </td>
                                             <td className="px-4 py-3">
                                                  <span
                                                       className={`rounded-md px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[label]}`}
                                                  >
                                                       {label}
                                                  </span>
                                             </td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>

               <Pagination
                    pagination={state.pagination}
                    noun="students"
                    onChange={setPage}
               />
          </div>
     );
}

export default function InstructorStudentsPage() {
     const picker = useCoursePicker();

     return (
          <CourseScreen
               title="Students"
               subtitle="See who is enrolled in your courses and how far they have got."
               picker={picker}
          >
               {(course) => (
                    <StudentsPanel key={course.courseId} course={course} />
               )}
          </CourseScreen>
     );
}
