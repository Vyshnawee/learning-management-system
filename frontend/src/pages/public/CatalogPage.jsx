import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { RotateCcw, Search, SearchX, TriangleAlert, X } from "lucide-react";
import { getCategories, getCourses } from "../../api/courseApi.js";
import CourseCard from "../../components/course/CourseCard.jsx";
import CourseCardSkeleton from "../../components/course/CourseCardSkeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Button from "../../components/common/Button.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const PAGE_SIZE = 9;

const LEVELS = [
     { value: "", label: "All levels" },
     { value: "beginner", label: "Beginner" },
     { value: "intermediate", label: "Intermediate" },
     { value: "advanced", label: "Advanced" },
];

const SORTS = [
     { value: "newest", label: "Newest" },
     { value: "rating", label: "Top rated" },
     { value: "title", label: "Title A to Z" },
     { value: "oldest", label: "Oldest" },
];

const chipClass = (active) =>
     `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition min-h-11 ${
          active
               ? "border-primary bg-primary text-on-primary"
               : "border-outline-variant text-on-surface hover:bg-surface-high"
     }`;

const selectClass =
     "min-h-11 rounded-lg border border-outline-variant bg-surface-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export default function CatalogPage() {
     // Filters live in the URL, so a filtered catalog can be shared, bookmarked, and works with Back
     const [searchParams, setSearchParams] = useSearchParams();
     const search = searchParams.get("search") || "";
     const category = searchParams.get("category") || "";
     const level = searchParams.get("level") || "";
     const sort = searchParams.get("sort") || "newest";
     const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

     const [categories, setCategories] = useState([]);
     const [courses, setCourses] = useState([]);
     const [pagination, setPagination] = useState({
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 0,
     });
     const [status, setStatus] = useState("loading"); // loading | success | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);

     // Categories for the filter chips (if this fails, the chips are simply not shown)
     useEffect(() => {
          getCategories()
               .then((res) => setCategories(res.data.categories))
               .catch(() => {});
     }, []);

     // Load courses whenever a filter, the page, or the retry counter changes
     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          getCourses(
               {
                    page,
                    limit: PAGE_SIZE,
                    search: search || undefined,
                    category: category || undefined,
                    level: level || undefined,
                    sort,
               },
               controller.signal,
          )
               .then((res) => {
                    setCourses(res.data.courses);
                    setPagination(res.pagination);
                    setStatus("success");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return; // an older request was replaced by a newer one
                    setErrorMessage(getErrorMessage(error));
                    setStatus("error");
               });

          return () => controller.abort();
     }, [page, search, category, level, sort, reloadKey]);

     // Change filters. Any change except the page number goes back to page 1.
     const update = (changes) => {
          const next = new URLSearchParams(searchParams);
          Object.entries(changes).forEach(([key, value]) => {
               if (value) next.set(key, value);
               else next.delete(key);
          });
          if (!("page" in changes)) next.delete("page");
          setSearchParams(next);
     };

     const handleSearch = (event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget)
               .get("search")
               .toString()
               .trim();
          update({ search: value });
     };

     const goToPage = (newPage) => {
          update({ page: newPage > 1 ? String(newPage) : "" });
          window.scrollTo({ top: 0, behavior: "smooth" });
     };

     const clearFilters = () => setSearchParams({});
     const hasFilters = Boolean(search || category || level);

     return (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
               <header className="mb-8">
                    <h1 className="text-4xl font-bold">Course catalog</h1>
                    <p className="mt-2 text-lg text-on-surface-variant">
                         Explore free online courses and expand your skills.
                    </p>
               </header>

               {/* Search and filters */}
               <section
                    aria-label="Search and filters"
                    className="mb-8 space-y-4"
               >
                    <div className="flex flex-col gap-3 lg:flex-row">
                         {/* key={search} resets the box when the URL changes, e.g. "Clear filters" or Back */}
                         <form
                              key={search}
                              onSubmit={handleSearch}
                              role="search"
                              className="relative flex-1"
                         >
                              <label
                                   htmlFor="course-search"
                                   className="sr-only"
                              >
                                   Search courses
                              </label>
                              <Search
                                   size={18}
                                   className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
                              />
                              <input
                                   id="course-search"
                                   name="search"
                                   type="search"
                                   maxLength={100}
                                   defaultValue={search}
                                   placeholder="Search courses by title or keyword (press Enter)"
                                   className="min-h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest py-2.5 pl-10 pr-10 text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                              {search && (
                                   <button
                                        type="button"
                                        onClick={() => update({ search: "" })}
                                        aria-label="Clear search"
                                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-outline hover:text-on-surface"
                                   >
                                        <X size={18} />
                                   </button>
                              )}
                         </form>

                         <div className="flex gap-3">
                              <div>
                                   <label htmlFor="level" className="sr-only">
                                        Level
                                   </label>
                                   <select
                                        id="level"
                                        value={level}
                                        onChange={(event) =>
                                             update({
                                                  level: event.target.value,
                                             })
                                        }
                                        className={selectClass}
                                   >
                                        {LEVELS.map((item) => (
                                             <option
                                                  key={item.value}
                                                  value={item.value}
                                             >
                                                  {item.label}
                                             </option>
                                        ))}
                                   </select>
                              </div>
                              <div>
                                   <label htmlFor="sort" className="sr-only">
                                        Sort by
                                   </label>
                                   <select
                                        id="sort"
                                        value={sort}
                                        onChange={(event) =>
                                             update({
                                                  sort:
                                                       event.target.value ===
                                                       "newest"
                                                            ? ""
                                                            : event.target
                                                                   .value,
                                             })
                                        }
                                        className={selectClass}
                                   >
                                        {SORTS.map((item) => (
                                             <option
                                                  key={item.value}
                                                  value={item.value}
                                             >
                                                  Sort: {item.label}
                                             </option>
                                        ))}
                                   </select>
                              </div>
                         </div>
                    </div>

                    {categories.length > 0 && (
                         <div
                              role="group"
                              aria-label="Categories"
                              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
                         >
                              <button
                                   onClick={() => update({ category: "" })}
                                   className={chipClass(!category)}
                              >
                                   All
                              </button>
                              {categories.map((item) => (
                                   <button
                                        key={item._id}
                                        onClick={() =>
                                             update({ category: item._id })
                                        }
                                        aria-pressed={category === item._id}
                                        className={chipClass(
                                             category === item._id,
                                        )}
                                   >
                                        {item.name}
                                   </button>
                              ))}
                         </div>
                    )}
               </section>

               {/* Results */}
               {status === "success" && (
                    <p
                         aria-live="polite"
                         className="mb-4 text-sm text-on-surface-variant"
                    >
                         {pagination.total}{" "}
                         {pagination.total === 1 ? "course" : "courses"} found
                         {search && (
                              <>
                                   {" "}
                                   for &ldquo;
                                   <span className="text-on-surface">
                                        {search}
                                   </span>
                                   &rdquo;
                              </>
                         )}
                    </p>
               )}

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading courses"
                         className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                         {Array.from({ length: 6 }, (_, i) => (
                              <CourseCardSkeleton key={i} />
                         ))}
                    </div>
               )}

               {status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load courses"
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
               )}

               {status === "success" && courses.length === 0 && (
                    <EmptyState
                         icon={SearchX}
                         title="No courses found"
                         text={
                              hasFilters
                                   ? "We couldn't find any courses matching your search. Try different words or clear your filters."
                                   : "No courses have been published yet. Please check back soon."
                         }
                         action={
                              hasFilters && (
                                   <Button
                                        variant="secondary"
                                        onClick={clearFilters}
                                   >
                                        <RotateCcw size={16} />
                                        Clear all filters
                                   </Button>
                              )
                         }
                    />
               )}

               {status === "success" && courses.length > 0 && (
                    <>
                         <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              {courses.map((course) => (
                                   <CourseCard
                                        key={course._id}
                                        course={course}
                                   />
                              ))}
                         </div>
                         <Pagination
                              pagination={pagination}
                              onChange={goToPage}
                         />
                    </>
               )}
          </div>
     );
}
