import { useEffect, useState } from "react";
import axios from "axios";
import {
     CheckCircle2,
     GraduationCap,
     RotateCcw,
     TrendingUp,
     TriangleAlert,
     Users,
} from "lucide-react";
import { getAdminEnrollmentStats } from "../../api/adminApi.js";
import StatCard from "../../components/common/StatCard.jsx";
import BarChart from "../../components/common/BarChart.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import { fillDays } from "../../utils/chartData.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDay } from "../../utils/format.js";

const DAYS = 30;

// With 30 bars, only a few day numbers are shown under the chart
const toChartData = (days) =>
     days.map((item, index) => ({
          label: String(item.day),
          value: item.count,
          tooltip: formatDay(item.date),
          showLabel:
               index === days.length - 1 ||
               (index % 7 === 0 && days.length - 1 - index >= 4),
     }));

export default function AdminEnrollmentsPage() {
     const [state, setState] = useState({
          status: "loading",
          data: null,
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({ ...current, status: "loading" }));

          getAdminEnrollmentStats(controller.signal)
               .then((res) =>
                    setState({
                         status: "success",
                         data: res.data,
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

     const { status, data, errorMessage } = state;
     const days = data ? fillDays(data.enrollmentsPerDay, DAYS) : null;
     const inRange = days ? days.reduce((sum, day) => sum + day.count, 0) : 0;

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         Enrollment statistics
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         How students are enrolling and progressing across the
                         platform.
                    </p>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading statistics"
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
                         title="Could not load the statistics"
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

               {status === "success" && data.total === 0 && (
                    <EmptyState
                         icon={GraduationCap}
                         title="No enrollments yet"
                         text="Statistics will appear here as soon as students enroll in courses."
                    />
               )}

               {status === "success" && data.total > 0 && (
                    <div className="space-y-10">
                         <section
                              aria-label="Enrollment numbers"
                              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                         >
                              <StatCard
                                   icon={Users}
                                   label="Total enrollments"
                                   value={data.total}
                              />
                              <StatCard
                                   icon={CheckCircle2}
                                   label="Completed"
                                   value={data.completed}
                                   hint="Finished every lesson"
                              />
                              <StatCard
                                   icon={TrendingUp}
                                   label="Completion rate"
                                   value={`${data.completionRate}%`}
                              />
                              <StatCard
                                   icon={GraduationCap}
                                   label="Average progress"
                                   value={`${data.averageProgress}%`}
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
                                   Enrollments per day
                              </h2>
                              <p className="mb-6 text-sm text-on-surface-variant">
                                   {formatDay(days[0].date)} to{" "}
                                   {formatDay(days[days.length - 1].date)} ·{" "}
                                   {inRange}{" "}
                                   {inRange === 1
                                        ? "enrollment"
                                        : "enrollments"}{" "}
                                   in total. Hover over a bar to see its day.
                              </p>
                              <BarChart
                                   label="New enrollments per day"
                                   data={toChartData(days)}
                              />
                         </section>

                         <section aria-labelledby="top-heading">
                              <h2
                                   id="top-heading"
                                   className="mb-4 text-xl font-semibold"
                              >
                                   Most popular courses
                              </h2>
                              <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-low">
                                   <table className="w-full min-w-[560px] text-left text-sm">
                                        <caption className="sr-only">
                                             Top 5 courses by enrollments
                                        </caption>
                                        <thead className="border-b border-outline-variant bg-surface-container text-xs uppercase tracking-wide text-on-surface-variant">
                                             <tr>
                                                  <th
                                                       scope="col"
                                                       className="px-4 py-3 font-semibold"
                                                  >
                                                       #
                                                  </th>
                                                  <th
                                                       scope="col"
                                                       className="px-4 py-3 font-semibold"
                                                  >
                                                       Course
                                                  </th>
                                                  <th
                                                       scope="col"
                                                       className="px-4 py-3 text-right font-semibold"
                                                  >
                                                       Enrollments
                                                  </th>
                                                  <th
                                                       scope="col"
                                                       className="px-4 py-3 text-right font-semibold"
                                                  >
                                                       Completed
                                                  </th>
                                                  <th
                                                       scope="col"
                                                       className="px-4 py-3 text-right font-semibold"
                                                  >
                                                       Completion rate
                                                  </th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {data.topCourses.map(
                                                  (course, index) => (
                                                       <tr
                                                            key={
                                                                 course.courseId
                                                            }
                                                            className="border-b border-outline-variant/60 last:border-b-0"
                                                       >
                                                            <td className="px-4 py-3 text-on-surface-variant">
                                                                 {index + 1}
                                                            </td>
                                                            <td className="px-4 py-3 font-semibold">
                                                                 {course.title}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                 {
                                                                      course.enrollments
                                                                 }
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                 {
                                                                      course.completed
                                                                 }
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                 {course.enrollments
                                                                      ? `${Math.floor((course.completed / course.enrollments) * 100)}%`
                                                                      : "–"}
                                                            </td>
                                                       </tr>
                                                  ),
                                             )}
                                        </tbody>
                                   </table>
                              </div>
                         </section>
                    </div>
               )}
          </div>
     );
}
