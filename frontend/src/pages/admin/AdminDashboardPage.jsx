import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
     Award,
     BookOpen,
     GraduationCap,
     RotateCcw,
     TriangleAlert,
     Users,
} from "lucide-react";
import {
     getAdminDashboard,
     getAdminEnrollmentStats,
} from "../../api/adminApi.js";
import StatCard from "../../components/common/StatCard.jsx";
import BarChart from "../../components/common/BarChart.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import { fillDays } from "../../utils/chartData.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDay, timeAgo } from "../../utils/format.js";
import { ROLE_LABELS } from "../../utils/roles.js";

const DAYS = 14;

// Show a few day numbers under the bars, not all of them
const toChartData = (days) =>
     days.map((item, index) => ({
          label: String(item.day),
          value: item.count,
          tooltip: formatDay(item.date),
          showLabel: days.length <= 14 || index === days.length - 1,
     }));

export default function AdminDashboardPage() {
     const [state, setState] = useState({
          status: "loading",
          data: null,
          stats: null,
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({ ...current, status: "loading" }));

          Promise.all([
               getAdminDashboard(controller.signal),
               // The chart is optional: if this fails, the rest of the page still works
               getAdminEnrollmentStats(controller.signal).catch((error) => {
                    if (axios.isCancel(error)) throw error;
                    return null;
               }),
          ])
               .then(([dashboard, stats]) =>
                    setState({
                         status: "success",
                         data: dashboard.data,
                         stats: stats?.data ?? null,
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
     }, [reloadKey]);

     const { status, data, stats, errorMessage } = state;
     const days = stats ? fillDays(stats.enrollmentsPerDay, DAYS) : null;
     const enrolledInRange = days
          ? days.reduce((sum, day) => sum + day.count, 0)
          : 0;

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         Admin dashboard
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         An overview of users, courses and learning on LearnHub.
                    </p>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading the dashboard"
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
                    </div>
               )}

               {status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load the dashboard"
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

               {status === "success" && (
                    <div className="space-y-10">
                         <section
                              aria-label="Platform numbers"
                              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                         >
                              <StatCard
                                   icon={Users}
                                   label="Total users"
                                   value={data.users.total}
                                   hint={`${data.users.students} students · ${data.users.instructors} instructors · ${data.users.admins} ${
                                        data.users.admins === 1
                                             ? "admin"
                                             : "admins"
                                   }${data.users.suspended > 0 ? ` · ${data.users.suspended} suspended` : ""}`}
                              />
                              <StatCard
                                   icon={BookOpen}
                                   label="Courses"
                                   value={data.courses.total}
                                   hint={`${data.courses.published} published · ${data.courses.draft} ${
                                        data.courses.draft === 1
                                             ? "draft"
                                             : "drafts"
                                   } · ${data.courses.archived} archived`}
                              />
                              <StatCard
                                   icon={GraduationCap}
                                   label="Enrollments"
                                   value={data.enrollments.total}
                                   hint={`${data.enrollments.completed} completed`}
                              />
                              <StatCard
                                   icon={Award}
                                   label="Certificates issued"
                                   value={data.certificates}
                                   hint={`${data.reviews} ${data.reviews === 1 ? "review" : "reviews"} written`}
                              />
                         </section>

                         <section aria-labelledby="week-heading">
                              <h2
                                   id="week-heading"
                                   className="mb-4 text-xl font-semibold"
                              >
                                   Last 7 days
                              </h2>
                              <div className="grid gap-4 sm:grid-cols-2">
                                   <div className="rounded-xl border border-outline-variant bg-surface-low p-5">
                                        <p className="text-sm text-on-surface-variant">
                                             New users
                                        </p>
                                        <p className="font-heading text-3xl font-bold">
                                             {data.last7Days.newUsers}
                                        </p>
                                   </div>
                                   <div className="rounded-xl border border-outline-variant bg-surface-low p-5">
                                        <p className="text-sm text-on-surface-variant">
                                             New enrollments
                                        </p>
                                        <p className="font-heading text-3xl font-bold">
                                             {data.last7Days.newEnrollments}
                                        </p>
                                   </div>
                              </div>
                         </section>

                         {days && (
                              <section
                                   aria-labelledby="chart-heading"
                                   className="rounded-xl border border-outline-variant bg-surface-low p-6"
                              >
                                   <h2
                                        id="chart-heading"
                                        className="text-xl font-semibold"
                                   >
                                        Enrollments per day
                                   </h2>
                                   <p className="mb-6 text-sm text-on-surface-variant">
                                        {formatDay(days[0].date)} to{" "}
                                        {formatDay(days[days.length - 1].date)}{" "}
                                        · {enrolledInRange}{" "}
                                        {enrolledInRange === 1
                                             ? "enrollment"
                                             : "enrollments"}{" "}
                                        in total
                                   </p>
                                   <BarChart
                                        label="New enrollments per day"
                                        data={toChartData(days)}
                                   />
                              </section>
                         )}

                         <section aria-labelledby="activity-heading">
                              <h2
                                   id="activity-heading"
                                   className="mb-4 text-xl font-semibold"
                              >
                                   Recent activity
                              </h2>
                              <div className="grid gap-6 lg:grid-cols-2">
                                   <div className="rounded-xl border border-outline-variant bg-surface-low p-5">
                                        <div className="mb-3 flex items-center justify-between">
                                             <h3 className="font-semibold">
                                                  New users
                                             </h3>
                                             <Link
                                                  to="/admin/users"
                                                  className="text-sm font-semibold text-primary hover:underline"
                                             >
                                                  View all
                                             </Link>
                                        </div>
                                        {data.recentActivity.recentUsers
                                             .length === 0 ? (
                                             <p className="text-sm text-on-surface-variant">
                                                  No users yet.
                                             </p>
                                        ) : (
                                             <ul className="divide-y divide-outline-variant/60">
                                                  {data.recentActivity.recentUsers.map(
                                                       (user) => (
                                                            <li
                                                                 key={user._id}
                                                                 className="flex items-center justify-between gap-3 py-3"
                                                            >
                                                                 <div className="min-w-0">
                                                                      <p className="truncate font-semibold">
                                                                           {
                                                                                user.name
                                                                           }
                                                                      </p>
                                                                      <p className="truncate text-xs text-on-surface-variant">
                                                                           {
                                                                                user.email
                                                                           }{" "}
                                                                           ·{" "}
                                                                           {ROLE_LABELS[
                                                                                user
                                                                                     .role
                                                                           ] ||
                                                                                user.role}
                                                                      </p>
                                                                 </div>
                                                                 <span className="shrink-0 text-xs text-on-surface-variant">
                                                                      {timeAgo(
                                                                           user.createdAt,
                                                                      )}
                                                                 </span>
                                                            </li>
                                                       ),
                                                  )}
                                             </ul>
                                        )}
                                   </div>

                                   <div className="rounded-xl border border-outline-variant bg-surface-low p-5">
                                        <div className="mb-3 flex items-center justify-between">
                                             <h3 className="font-semibold">
                                                  New enrollments
                                             </h3>
                                             <Link
                                                  to="/admin/enrollments"
                                                  className="text-sm font-semibold text-primary hover:underline"
                                             >
                                                  Statistics
                                             </Link>
                                        </div>
                                        {data.recentActivity.recentEnrollments
                                             .length === 0 ? (
                                             <p className="text-sm text-on-surface-variant">
                                                  No enrollments yet.
                                             </p>
                                        ) : (
                                             <ul className="divide-y divide-outline-variant/60">
                                                  {data.recentActivity.recentEnrollments.map(
                                                       (enrollment) => (
                                                            <li
                                                                 key={
                                                                      enrollment._id
                                                                 }
                                                                 className="flex items-center justify-between gap-3 py-3"
                                                            >
                                                                 <p className="min-w-0 text-sm">
                                                                      <span className="font-semibold">
                                                                           {enrollment
                                                                                .studentId
                                                                                ?.name ||
                                                                                "A student"}
                                                                      </span>{" "}
                                                                      <span className="text-on-surface-variant">
                                                                           enrolled
                                                                           in
                                                                      </span>{" "}
                                                                      <span className="font-semibold">
                                                                           {enrollment
                                                                                .courseId
                                                                                ?.title ||
                                                                                "a course"}
                                                                      </span>
                                                                 </p>
                                                                 <span className="shrink-0 text-xs text-on-surface-variant">
                                                                      {timeAgo(
                                                                           enrollment.enrolledAt,
                                                                      )}
                                                                 </span>
                                                            </li>
                                                       ),
                                                  )}
                                             </ul>
                                        )}
                                   </div>
                              </div>
                         </section>
                    </div>
               )}
          </div>
     );
}
