import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Star, Trash2 } from "lucide-react";
import CourseStatusBadge from "./CourseStatusBadge.jsx";
import ProgressBar from "../common/ProgressBar.jsx";
import Button from "../common/Button.jsx";
import { formatDate } from "../../utils/format.js";

const LEVELS = {
     beginner: "Beginner",
     intermediate: "Intermediate",
     advanced: "Advanced",
};

const actionLink =
     "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-sm font-medium transition hover:bg-surface-high";

// manage = true adds the Publish / Unpublish and Delete buttons (used on the My courses page)
export default function CourseTable({
     courses,
     manage = false,
     busyId = null,
     onTogglePublish,
     onDelete,
}) {
     const [confirmId, setConfirmId] = useState(null);

     return (
          <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-low">
               <table className="w-full min-w-[760px] text-left text-sm">
                    <caption className="sr-only">Your courses</caption>
                    <thead className="border-b border-outline-variant bg-surface-container text-xs uppercase tracking-wide text-on-surface-variant">
                         <tr>
                              <th
                                   scope="col"
                                   className="px-4 py-3 font-semibold"
                              >
                                   Course
                              </th>
                              <th
                                   scope="col"
                                   className="px-4 py-3 font-semibold"
                              >
                                   Status
                              </th>
                              <th
                                   scope="col"
                                   className="px-4 py-3 text-right font-semibold"
                              >
                                   Enrollments
                              </th>
                              <th
                                   scope="col"
                                   className="px-4 py-3 font-semibold"
                              >
                                   Completion
                              </th>
                              <th
                                   scope="col"
                                   className="px-4 py-3 font-semibold"
                              >
                                   Rating
                              </th>
                              <th
                                   scope="col"
                                   className="px-4 py-3 font-semibold"
                              >
                                   Actions
                              </th>
                         </tr>
                    </thead>
                    <tbody>
                         {courses.map((course) => {
                              const confirming = confirmId === course.courseId;
                              const busy = busyId === course.courseId;

                              return (
                                   <tr
                                        key={course.courseId}
                                        className="border-b border-outline-variant/60 last:border-b-0"
                                   >
                                        <td className="max-w-xs px-4 py-4">
                                             <p className="truncate font-semibold">
                                                  {course.title}
                                             </p>
                                             <p className="text-xs text-on-surface-variant">
                                                  {LEVELS[course.level] ||
                                                       course.level}{" "}
                                                  · {course.lessonCount}{" "}
                                                  {course.lessonCount === 1
                                                       ? "lesson"
                                                       : "lessons"}{" "}
                                                  · Updated{" "}
                                                  {formatDate(course.updatedAt)}
                                             </p>
                                        </td>
                                        <td className="px-4 py-4">
                                             <CourseStatusBadge
                                                  status={course.status}
                                             />
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold">
                                             {course.enrollments}
                                        </td>
                                        <td className="w-44 px-4 py-4">
                                             {course.completionRate === null ? (
                                                  <span className="text-on-surface-variant">
                                                       No students yet
                                                  </span>
                                             ) : (
                                                  <div>
                                                       <p className="mb-1 text-xs text-on-surface-variant">
                                                            {course.completed}{" "}
                                                            of{" "}
                                                            {course.enrollments}{" "}
                                                            ·{" "}
                                                            {
                                                                 course.completionRate
                                                            }
                                                            %
                                                       </p>
                                                       <ProgressBar
                                                            value={
                                                                 course.completionRate
                                                            }
                                                            label={`Completion of ${course.title}`}
                                                       />
                                                  </div>
                                             )}
                                        </td>
                                        <td className="px-4 py-4">
                                             {course.ratingCount > 0 ? (
                                                  <span className="inline-flex items-center gap-1 font-semibold">
                                                       <Star
                                                            size={14}
                                                            className="fill-secondary text-secondary"
                                                       />
                                                       {course.ratingAverage.toFixed(
                                                            1,
                                                       )}
                                                       <span className="font-normal text-on-surface-variant">
                                                            (
                                                            {course.ratingCount}
                                                            )
                                                       </span>
                                                  </span>
                                             ) : (
                                                  <span className="text-on-surface-variant">
                                                       No ratings
                                                  </span>
                                             )}
                                        </td>
                                        <td className="px-4 py-4">
                                             {confirming ? (
                                                  <div className="flex flex-col gap-2">
                                                       <p className="max-w-56 text-xs text-on-surface-variant">
                                                            Delete this course
                                                            with all its
                                                            lessons, quizzes and
                                                            enrollments? This
                                                            can&apos;t be
                                                            undone.
                                                       </p>
                                                       <div className="flex gap-2">
                                                            <Button
                                                                 loading={busy}
                                                                 onClick={async () => {
                                                                      await onDelete(
                                                                           course,
                                                                      );
                                                                      setConfirmId(
                                                                           null,
                                                                      );
                                                                 }}
                                                            >
                                                                 Yes, delete
                                                            </Button>
                                                            <Button
                                                                 variant="secondary"
                                                                 disabled={busy}
                                                                 onClick={() =>
                                                                      setConfirmId(
                                                                           null,
                                                                      )
                                                                 }
                                                            >
                                                                 Cancel
                                                            </Button>
                                                       </div>
                                                  </div>
                                             ) : (
                                                  <div className="flex flex-wrap gap-2">
                                                       <Link
                                                            to={`/instructor/courses/${course.courseId}/edit`}
                                                            className={
                                                                 actionLink
                                                            }
                                                       >
                                                            <Pencil size={15} />
                                                            Edit
                                                       </Link>
                                                       {manage && (
                                                            <>
                                                                 {course.status !==
                                                                      "archived" && (
                                                                      <Button
                                                                           variant="secondary"
                                                                           loading={
                                                                                busy
                                                                           }
                                                                           onClick={() =>
                                                                                onTogglePublish(
                                                                                     course,
                                                                                )
                                                                           }
                                                                           className="!px-3 !text-sm !font-medium"
                                                                      >
                                                                           {course.status ===
                                                                           "published"
                                                                                ? "Unpublish"
                                                                                : "Publish"}
                                                                      </Button>
                                                                 )}
                                                                 {course.status ===
                                                                      "published" && (
                                                                      <Link
                                                                           to={`/courses/${course.courseId}`}
                                                                           className={
                                                                                actionLink
                                                                           }
                                                                      >
                                                                           <Eye
                                                                                size={
                                                                                     15
                                                                                }
                                                                           />
                                                                           View
                                                                      </Link>
                                                                 )}
                                                                 <button
                                                                      onClick={() =>
                                                                           setConfirmId(
                                                                                course.courseId,
                                                                           )
                                                                      }
                                                                      aria-label={`Delete ${course.title}`}
                                                                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition hover:bg-error-container/30 hover:text-error"
                                                                 >
                                                                      <Trash2
                                                                           size={
                                                                                16
                                                                           }
                                                                      />
                                                                 </button>
                                                            </>
                                                       )}
                                                  </div>
                                             )}
                                        </td>
                                   </tr>
                              );
                         })}
                    </tbody>
               </table>
          </div>
     );
}
