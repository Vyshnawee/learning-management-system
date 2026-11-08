import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
     ArrowRight,
     Award,
     BarChart3,
     Circle,
     CheckCircle2,
     Cloud,
     Code,
     Database,
     Globe,
     PlayCircle,
     RotateCcw,
     Search,
     Smartphone,
     Tags,
} from "lucide-react";
import { getCourses } from "../../api/courseApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useCategories } from "../../hooks/useCategories.js";
import CourseCard from "../../components/course/CourseCard.jsx";
import CourseCardSkeleton from "../../components/course/CourseCardSkeleton.jsx";
import Button from "../../components/common/Button.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { getDashboardPath } from "../../utils/roles.js";

const primaryLink =
     "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-on-primary transition hover:bg-primary-container";
const secondaryLink =
     "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant px-6 font-semibold transition hover:bg-surface-high";

// An icon for each seeded category (any other category gets the default icon)
const CATEGORY_ICONS = {
     "web-development": Globe,
     "data-science": BarChart3,
     "mobile-development": Smartphone,
     databases: Database,
     "programming-fundamentals": Code,
     "devops-and-cloud": Cloud,
};

const STEPS = [
     {
          icon: Search,
          title: "Find a course",
          text: "Search the catalog or browse by category and level. Every course is free.",
     },
     {
          icon: PlayCircle,
          title: "Enroll and learn",
          text: "Watch video lessons at your own pace, mark them complete, and pick up where you left off.",
     },
     {
          icon: Award,
          title: "Earn a certificate",
          text: "Finish the lessons and pass the quizzes to get a certificate anyone can verify.",
     },
];

// A decorative picture of a lesson list. It is not real data, so screen readers skip it.
function HeroPreview() {
     const lessons = [
          { title: "Welcome and overview", state: "done" },
          { title: "Your first component", state: "done" },
          { title: "Passing data with props", state: "current" },
          { title: "Understanding state", state: "todo" },
     ];

     return (
          <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
               <div className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl" />
               <div className="relative rounded-2xl border border-outline-variant bg-surface-low p-5 shadow-2xl">
                    <div className="mb-4 aspect-video rounded-xl bg-gradient-to-br from-surface-container to-surface-highest">
                         <div className="flex h-full items-center justify-center">
                              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
                                   <PlayCircle size={30} />
                              </span>
                         </div>
                    </div>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-highest">
                         <div className="h-full w-1/2 rounded-full bg-primary" />
                    </div>
                    <ul className="space-y-2">
                         {lessons.map((lesson) => (
                              <li
                                   key={lesson.title}
                                   className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                                        lesson.state === "current"
                                             ? "bg-primary/10 font-semibold"
                                             : ""
                                   }`}
                              >
                                   {lesson.state === "done" ? (
                                        <CheckCircle2
                                             size={18}
                                             className="text-primary"
                                        />
                                   ) : lesson.state === "current" ? (
                                        <PlayCircle
                                             size={18}
                                             className="text-primary"
                                        />
                                   ) : (
                                        <Circle
                                             size={18}
                                             className="text-outline"
                                        />
                                   )}
                                   {lesson.title}
                              </li>
                         ))}
                    </ul>
               </div>
          </div>
     );
}

export default function HomePage() {
     const { user } = useAuth();
     const categoriesState = useCategories();

     const [popular, setPopular] = useState({
          status: "loading",
          courses: [],
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const previous = document.title;
          document.title = "LearnHub | Free online courses";
          return () => {
               document.title = previous;
          };
     }, []);

     useEffect(() => {
          const controller = new AbortController();
          setPopular((current) => ({ ...current, status: "loading" }));

          getCourses({ limit: 4, sort: "rating" }, controller.signal)
               .then((res) =>
                    setPopular({
                         status: "success",
                         courses: res.data.courses,
                         errorMessage: "",
                    }),
               )
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    setPopular({
                         status: "error",
                         courses: [],
                         errorMessage: getErrorMessage(error),
                    });
               });

          return () => controller.abort();
     }, [reloadKey]);

     const categories =
          categoriesState.status === "success"
               ? categoriesState.categories
               : [];

     return (
          <>
               {/* Hero */}
               <section className="border-b border-outline-variant bg-gradient-to-b from-surface-low to-surface">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
                         <div>
                              <p className="mb-4 inline-flex items-center rounded-full border border-outline-variant bg-surface-container px-3 py-1 text-sm font-medium text-primary">
                                   Free online learning
                              </p>
                              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                                   Learn new skills at your own pace,{" "}
                                   <span className="text-primary">
                                        completely free.
                                   </span>
                              </h1>
                              <p className="mt-5 max-w-xl text-lg text-on-surface-variant">
                                   Video lessons, quizzes and certificates from
                                   instructors who love to teach. No
                                   subscriptions, no trials and no hidden fees.
                              </p>
                              <div className="mt-8 flex flex-wrap gap-3">
                                   <Link to="/courses" className={primaryLink}>
                                        Browse courses
                                        <ArrowRight size={18} />
                                   </Link>
                                   {user ? (
                                        <Link
                                             to={getDashboardPath(user.role)}
                                             className={secondaryLink}
                                        >
                                             Go to my dashboard
                                        </Link>
                                   ) : (
                                        <Link
                                             to="/signup"
                                             className={secondaryLink}
                                        >
                                             Sign up free
                                        </Link>
                                   )}
                              </div>
                         </div>
                         <div className="hidden lg:block">
                              <HeroPreview />
                         </div>
                    </div>
               </section>

               {/* Categories */}
               {categories.length > 0 && (
                    <section
                         aria-labelledby="categories-heading"
                         className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
                    >
                         <h2
                              id="categories-heading"
                              className="text-3xl font-bold"
                         >
                              Explore by category
                         </h2>
                         <p className="mb-8 mt-2 text-on-surface-variant">
                              Find the right topic for your learning journey.
                         </p>
                         <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {categories.map((category) => {
                                   const Icon =
                                        CATEGORY_ICONS[category.slug] || Tags;
                                   return (
                                        <li key={category._id}>
                                             <Link
                                                  to={`/courses?category=${category._id}`}
                                                  className="group flex h-full items-start gap-4 rounded-xl border border-outline-variant bg-surface-low p-5 transition hover:border-primary"
                                             >
                                                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-highest text-primary">
                                                       <Icon size={22} />
                                                  </span>
                                                  <span className="min-w-0 flex-1">
                                                       <span className="block font-semibold">
                                                            {category.name}
                                                       </span>
                                                       {category.description && (
                                                            <span className="mt-1 line-clamp-2 block text-sm text-on-surface-variant">
                                                                 {
                                                                      category.description
                                                                 }
                                                            </span>
                                                       )}
                                                  </span>
                                                  <ArrowRight
                                                       size={18}
                                                       className="mt-1 shrink-0 text-outline transition group-hover:translate-x-1 group-hover:text-primary"
                                                  />
                                             </Link>
                                        </li>
                                   );
                              })}
                         </ul>
                    </section>
               )}

               {/* Popular courses */}
               <section
                    aria-labelledby="popular-heading"
                    className="border-y border-outline-variant bg-surface-low"
               >
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
                         <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                              <div>
                                   <h2
                                        id="popular-heading"
                                        className="text-3xl font-bold"
                                   >
                                        Popular courses
                                   </h2>
                                   <p className="mt-2 text-on-surface-variant">
                                        Top-rated courses you can start today.
                                   </p>
                              </div>
                              <Link
                                   to="/courses"
                                   className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline"
                              >
                                   View all courses
                                   <ArrowRight size={16} />
                              </Link>
                         </div>

                         {popular.status === "loading" && (
                              <div
                                   role="status"
                                   aria-label="Loading courses"
                                   className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                              >
                                   {[0, 1, 2, 3].map((i) => (
                                        <CourseCardSkeleton key={i} />
                                   ))}
                              </div>
                         )}

                         {popular.status === "error" && (
                              <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center">
                                   <p className="mb-4 text-on-surface-variant">
                                        {popular.errorMessage}
                                   </p>
                                   <Button
                                        variant="secondary"
                                        onClick={() =>
                                             setReloadKey((key) => key + 1)
                                        }
                                   >
                                        <RotateCcw size={16} />
                                        Try again
                                   </Button>
                              </div>
                         )}

                         {popular.status === "success" &&
                              popular.courses.length === 0 && (
                                   <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center">
                                        <p className="font-semibold">
                                             No courses have been published yet.
                                        </p>
                                        <p className="mt-1 text-on-surface-variant">
                                             Please check back soon.
                                        </p>
                                   </div>
                              )}

                         {popular.status === "success" &&
                              popular.courses.length > 0 && (
                                   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                        {popular.courses.map((course) => (
                                             <CourseCard
                                                  key={course._id}
                                                  course={course}
                                             />
                                        ))}
                                   </div>
                              )}
                    </div>
               </section>

               {/* How it works */}
               <section
                    aria-labelledby="how-heading"
                    className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
               >
                    <h2 id="how-heading" className="text-3xl font-bold">
                         How it works
                    </h2>
                    <p className="mb-8 mt-2 text-on-surface-variant">
                         Three simple steps from curious to certified.
                    </p>
                    <ol className="grid gap-6 md:grid-cols-3">
                         {STEPS.map(({ icon: Icon, title, text }, index) => (
                              <li
                                   key={title}
                                   className="rounded-xl border border-outline-variant bg-surface-low p-6"
                              >
                                   <div className="mb-4 flex items-center gap-3">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                             <Icon size={22} />
                                        </span>
                                        <span className="font-heading text-sm font-semibold text-outline">
                                             Step {index + 1}
                                        </span>
                                   </div>
                                   <h3 className="mb-2 text-xl font-semibold">
                                        {title}
                                   </h3>
                                   <p className="text-on-surface-variant">
                                        {text}
                                   </p>
                              </li>
                         ))}
                    </ol>
               </section>

               {/* Instructor banner (only for visitors who are not logged in) */}
               {!user && (
                    <section
                         aria-labelledby="teach-heading"
                         className="mx-auto max-w-7xl px-4 pb-16 sm:px-6"
                    >
                         <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-outline-variant bg-gradient-to-r from-surface-container to-surface-low p-8 md:flex-row md:items-center md:p-10">
                              <div className="max-w-xl">
                                   <h2
                                        id="teach-heading"
                                        className="text-3xl font-bold"
                                   >
                                        Share what you know
                                   </h2>
                                   <p className="mt-2 text-on-surface-variant">
                                        Create a course, add video lessons and
                                        quizzes, and help students learn. It
                                        only takes a few minutes to get started.
                                   </p>
                              </div>
                              <Link
                                   to="/signup?role=instructor"
                                   className={primaryLink}
                              >
                                   Start teaching
                                   <ArrowRight size={18} />
                              </Link>
                         </div>
                    </section>
               )}
          </>
     );
}
