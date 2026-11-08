import { useState } from "react";
import { Link } from "react-router-dom";
import {
     BookOpen,
     Eye,
     RotateCcw,
     Search,
     SearchX,
     TriangleAlert,
     X,
} from "lucide-react";
import { getAdminCourses, setCourseStatus } from "../../api/adminApi.js";
import { useAdminList } from "../../hooks/useAdminList.js";
import { useCategories } from "../../hooks/useCategories.js";
import { useQueryFilters } from "../../hooks/useQueryFilters.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Select from "../../components/common/Select.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import SuccessNotice from "../../components/common/SuccessNotice.jsx";
import CourseStatusBadge from "../../components/instructor/CourseStatusBadge.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDate } from "../../utils/format.js";

const LIMIT = 10;
const selectCourses = (res) => res.data.courses;

export default function AdminCoursesPage() {
     const { searchParams, update, clear } = useQueryFilters();
     const search = searchParams.get("search") || "";
     const status = searchParams.get("status") || "";
     const category = searchParams.get("category") || "";
     const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

     const categoriesState = useCategories();
     const list = useAdminList(getAdminCourses, selectCourses, {
          page,
          limit: LIMIT,
          search: search || undefined,
          status: status || undefined,
          category: category || undefined,
     });

     const [busyId, setBusyId] = useState(null);
     const [actionError, setActionError] = useState("");
     const [notice, setNotice] = useState("");

     const hasFilters = Boolean(search || status || category);

     const handleSearch = (event) => {
          event.preventDefault();
          update({
               search: new FormData(event.currentTarget)
                    .get("search")
                    .toString()
                    .trim(),
          });
     };

     const changeStatus = async (course, newStatus) => {
          if (newStatus === course.status) return;
          setBusyId(course._id);
          setActionError("");
          setNotice("");
          try {
               const res = await setCourseStatus(course._id, newStatus);
               // The response is not populated, so only copy the changed fields
               list.setItems((items) =>
                    items.map((item) =>
                         item._id === course._id
                              ? {
                                     ...item,
                                     status: res.data.course.status,
                                     publishedAt: res.data.course.publishedAt,
                                }
                              : item,
                    ),
               );
               setNotice(`"${course.title}" is now ${newStatus}.`);
          } catch (error) {
               // For example: "A course needs at least one lesson before it can be published"
               setActionError(`${course.title}: ${getErrorMessage(error)}`);
          } finally {
               setBusyId(null);
          }
     };

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">Courses</h1>
                    <p className="mt-2 text-on-surface-variant">
                         Review every course on the platform. Move a course to
                         Draft or Archived to hide it from the catalog.
                    </p>
               </header>

               <section
                    aria-label="Filters"
                    className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end"
               >
                    <form
                         key={search}
                         onSubmit={handleSearch}
                         role="search"
                         className="relative flex-1"
                    >
                         <label
                              htmlFor="course-title-search"
                              className="mb-1.5 block text-sm font-medium"
                         >
                              Search
                         </label>
                         <Search
                              size={18}
                              className="pointer-events-none absolute bottom-3 left-3.5 text-outline"
                         />
                         <input
                              id="course-title-search"
                              name="search"
                              type="search"
                              maxLength={100}
                              defaultValue={search}
                              placeholder="Course title (press Enter)"
                              className="min-h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest py-2.5 pl-10 pr-10 text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                         />
                         {search && (
                              <button
                                   type="button"
                                   onClick={() => update({ search: "" })}
                                   aria-label="Clear search"
                                   className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center text-outline hover:text-on-surface"
                              >
                                   <X size={18} />
                              </button>
                         )}
                    </form>
                    <Select
                         label="Status"
                         value={status}
                         onChange={(event) =>
                              update({ status: event.target.value })
                         }
                         className="lg:w-44"
                    >
                         <option value="">All statuses</option>
                         <option value="published">Published</option>
                         <option value="draft">Draft</option>
                         <option value="archived">Archived</option>
                    </Select>
                    {categoriesState.status === "success" &&
                         categoriesState.categories.length > 0 && (
                              <Select
                                   label="Category"
                                   value={category}
                                   onChange={(event) =>
                                        update({ category: event.target.value })
                                   }
                                   className="lg:w-52"
                              >
                                   <option value="">All categories</option>
                                   {categoriesState.categories.map((item) => (
                                        <option key={item._id} value={item._id}>
                                             {item.name}
                                        </option>
                                   ))}
                              </Select>
                         )}
               </section>

               {actionError && (
                    <div className="mb-4">
                         <Alert>{actionError}</Alert>
                    </div>
               )}
               <div className="mb-4">
                    <SuccessNotice>{notice}</SuccessNotice>
               </div>

               {list.status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading courses"
                         className="h-72 animate-pulse rounded-xl bg-surface-low"
                    />
               )}

               {list.status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load the courses"
                         text={list.errorMessage}
                         action={
                              <Button onClick={list.reload}>
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               )}

               {list.status === "success" && list.items.length === 0 && (
                    <EmptyState
                         icon={hasFilters ? SearchX : BookOpen}
                         title={
                              hasFilters ? "No courses found" : "No courses yet"
                         }
                         text={
                              hasFilters
                                   ? "Try different words or clear your filters."
                                   : "Courses will appear here after instructors create them."
                         }
                         action={
                              hasFilters && (
                                   <Button variant="secondary" onClick={clear}>
                                        <RotateCcw size={16} />
                                        Clear all filters
                                   </Button>
                              )
                         }
                    />
               )}

               {list.status === "success" && list.items.length > 0 && (
                    <div className="space-y-4">
                         <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-low">
                              <table className="w-full min-w-[820px] text-left text-sm">
                                   <caption className="sr-only">
                                        Courses
                                   </caption>
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
                                                  Instructor
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  Status
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  Change status
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  <span className="sr-only">
                                                       View
                                                  </span>
                                             </th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {list.items.map((course) => {
                                             const instructor =
                                                  course.instructorId;
                                             return (
                                                  <tr
                                                       key={course._id}
                                                       className="border-b border-outline-variant/60 last:border-b-0"
                                                  >
                                                       <td className="max-w-xs px-4 py-3">
                                                            <p className="truncate font-semibold">
                                                                 {course.title}
                                                            </p>
                                                            <p className="text-xs text-on-surface-variant">
                                                                 {course
                                                                      .categoryId
                                                                      ?.name ||
                                                                      "No category"}{" "}
                                                                 · Created{" "}
                                                                 {formatDate(
                                                                      course.createdAt,
                                                                 )}
                                                            </p>
                                                       </td>
                                                       <td className="px-4 py-3">
                                                            <p className="font-semibold">
                                                                 {instructor?.name ||
                                                                      "Deleted user"}
                                                            </p>
                                                            <p className="text-xs text-on-surface-variant">
                                                                 {
                                                                      instructor?.email
                                                                 }
                                                            </p>
                                                            {instructor?.isActive ===
                                                                 false && (
                                                                 <span className="mt-1 inline-block rounded bg-error-container/40 px-2 py-0.5 text-xs font-semibold text-on-error-container">
                                                                      Instructor
                                                                      suspended
                                                                 </span>
                                                            )}
                                                       </td>
                                                       <td className="px-4 py-3">
                                                            <CourseStatusBadge
                                                                 status={
                                                                      course.status
                                                                 }
                                                            />
                                                       </td>
                                                       <td className="px-4 py-3">
                                                            <label
                                                                 className="sr-only"
                                                                 htmlFor={`status-${course._id}`}
                                                            >
                                                                 Status of{" "}
                                                                 {course.title}
                                                            </label>
                                                            <select
                                                                 id={`status-${course._id}`}
                                                                 value={
                                                                      course.status
                                                                 }
                                                                 disabled={
                                                                      busyId !==
                                                                      null
                                                                 }
                                                                 onChange={(
                                                                      event,
                                                                 ) =>
                                                                      changeStatus(
                                                                           course,
                                                                           event
                                                                                .target
                                                                                .value,
                                                                      )
                                                                 }
                                                                 className="min-h-11 rounded-lg border border-outline-variant bg-surface-lowest px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                                                            >
                                                                 <option value="published">
                                                                      Published
                                                                 </option>
                                                                 <option value="draft">
                                                                      Draft
                                                                 </option>
                                                                 <option value="archived">
                                                                      Archived
                                                                 </option>
                                                            </select>
                                                            {busyId ===
                                                                 course._id && (
                                                                 <span className="ml-2 text-xs text-on-surface-variant">
                                                                      Saving...
                                                                 </span>
                                                            )}
                                                       </td>
                                                       <td className="px-4 py-3">
                                                            <Link
                                                                 to={`/courses/${course._id}`}
                                                                 className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-sm font-medium transition hover:bg-surface-high"
                                                            >
                                                                 <Eye
                                                                      size={15}
                                                                 />
                                                                 View
                                                            </Link>
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </table>
                         </div>
                         <Pagination
                              pagination={list.pagination}
                              noun="courses"
                              onChange={(newPage) => {
                                   update({
                                        page:
                                             newPage > 1 ? String(newPage) : "",
                                   });
                                   window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                   });
                              }}
                         />
                    </div>
               )}
          </div>
     );
}
