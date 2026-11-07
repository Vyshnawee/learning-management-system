import { Link } from "react-router-dom";
import {
     BookOpen,
     CheckCircle2,
     PlusCircle,
     RotateCcw,
     Star,
     TriangleAlert,
     Users,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useInstructorDashboard } from "../../hooks/useInstructorDashboard.js";
import StatCard from "../../components/common/StatCard.jsx";
import BarChart from "../../components/common/BarChart.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import CourseTable from "../../components/instructor/CourseTable.jsx";

const createLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";

// "2026-06" -> "Jun"
const monthLabel = (value) => {
     const [year, month] = value.split("-").map(Number);
     return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
          undefined,
          {
               month: "short",
               timeZone: "UTC",
          },
     );
};

export default function InstructorDashboardPage() {
     const { user } = useAuth();
     const { status, data, errorMessage, reload } = useInstructorDashboard();
     const firstName = user.name.split(" ")[0];

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                         <h1 className="text-3xl font-bold sm:text-4xl">
                              Instructor dashboard
                         </h1>
                         <p className="mt-2 text-on-surface-variant">
                              Welcome back, {firstName}. Here is how your
                              courses are doing.
                         </p>
                    </div>
                    <Link to="/instructor/courses/new" className={createLink}>
                         <PlusCircle size={18} />
                         Create new course
                    </Link>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading your dashboard"
                         className="animate-pulse space-y-8"
                    >
                         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              {[0, 1, 2, 3].map((i) => (
                                   <div
                                        key={i}
                                        className="h-32 rounded-xl bg-surface-low"
                                   />
                              ))}
                         </div>
                         <div className="h-80 rounded-xl bg-surface-low" />
                         <div className="h-64 rounded-xl bg-surface-low" />
                    </div>
               )}

               {status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load your dashboard"
                         text={errorMessage}
                         action={
                              <Button onClick={reload}>
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               )}

               {status === "success" && data.courses.total === 0 && (
                    <EmptyState
                         icon={BookOpen}
                         title="You haven't created a course yet"
                         text="Create your first course, add sections and lessons, then publish it for students."
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

               {status === "success" && data.courses.total > 0 && (
                    <div className="space-y-10">
                         <section
                              aria-label="Your numbers"
                              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                         >
                              <StatCard
                                   icon={BookOpen}
                                   label="Total courses"
                                   value={data.courses.total}
                                   hint={`${data.courses.published} published · ${data.courses.draft} ${
                                        data.courses.draft === 1
                                             ? "draft"
                                             : "drafts"
                                   }`}
                              />
                              <StatCard
                                   icon={Users}
                                   label="Total enrollments"
                                   value={data.totalEnrollments}
                                   hint={`${data.uniqueStudents} ${data.uniqueStudents === 1 ? "student" : "students"}`}
                              />
                              <StatCard
                                   icon={CheckCircle2}
                                   label="Completion rate"
                                   value={`${data.completionRate}%`}
                                   hint={`${data.totalCompleted} finished`}
                              />
                              <StatCard
                                   icon={Star}
                                   label="Average rating"
                                   value={
                                        data.rating.count > 0
                                             ? data.rating.average.toFixed(1)
                                             : "–"
                                   }
                                   hint={
                                        data.rating.count > 0
                                             ? `Based on ${data.rating.count} ${data.rating.count === 1 ? "review" : "reviews"}`
                                             : "No reviews yet"
                                   }
                              />
                         </section>

                         <section
                              aria-labelledby="chart-heading"
                              className="rounded-xl border border-outline-variant bg-surface-low p-6"
                         >
                              <h2
                                   id="chart-heading"
                                   className="text-xl font-semibold"
                              >
                                   Enrollments in the last 6 months
                              </h2>
                              <p className="mb-6 text-sm text-on-surface-variant">
                                   New students who joined your courses each
                                   month.
                              </p>
                              <BarChart
                                   label="New enrollments per month"
                                   data={data.monthlyEnrollments.map(
                                        (item) => ({
                                             label: monthLabel(item.month),
                                             value: item.count,
                                        }),
                                   )}
                              />
                         </section>

                         <section aria-labelledby="courses-heading">
                              <div className="mb-4 flex items-end justify-between gap-3">
                                   <h2
                                        id="courses-heading"
                                        className="text-2xl font-semibold"
                                   >
                                        Your latest courses
                                   </h2>
                                   <Link
                                        to="/instructor/courses"
                                        className="text-sm font-semibold text-primary hover:underline"
                                   >
                                        Manage all {data.courses.total}
                                   </Link>
                              </div>
                              <CourseTable
                                   courses={data.perCourse.slice(0, 5)}
                              />
                         </section>
                    </div>
               )}
          </div>
     );
}
