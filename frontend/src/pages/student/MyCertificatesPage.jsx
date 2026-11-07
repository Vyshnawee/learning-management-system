import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
     Award,
     BookOpen,
     Calendar,
     RotateCcw,
     TriangleAlert,
} from "lucide-react";
import { getMyCertificates } from "../../api/certificateApi.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDate } from "../../utils/format.js";

export default function MyCertificatesPage() {
     const [certificates, setCertificates] = useState([]);
     const [status, setStatus] = useState("loading"); // loading | success | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          getMyCertificates(controller.signal)
               .then((res) => {
                    setCertificates(res.data.certificates);
                    setStatus("success");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    setErrorMessage(getErrorMessage(error));
                    setStatus("error");
               });

          return () => controller.abort();
     }, [reloadKey]);

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         My certificates
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         View and print the certificates you have earned.
                    </p>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading certificates"
                         className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                         {[0, 1, 2].map((i) => (
                              <div
                                   key={i}
                                   className="h-56 animate-pulse rounded-xl border border-outline-variant bg-surface-low"
                              />
                         ))}
                    </div>
               )}

               {status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load your certificates"
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

               {status === "success" && certificates.length === 0 && (
                    <EmptyState
                         icon={Award}
                         title="No certificates yet"
                         text="Complete all the lessons in a course (and pass its quizzes) to earn your first certificate."
                         action={
                              <Link
                                   to="/student/courses"
                                   className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
                              >
                                   <BookOpen size={18} />
                                   Go to my courses
                              </Link>
                         }
                    />
               )}

               {status === "success" && certificates.length > 0 && (
                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                         {certificates.map((certificate) => (
                              <li
                                   key={certificate._id}
                                   className="flex flex-col rounded-xl border border-outline-variant bg-surface-low p-5"
                              >
                                   <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                                        <Award size={24} />
                                   </span>
                                   <h2 className="mb-1 line-clamp-2 text-lg font-semibold">
                                        {certificate.courseId?.title ||
                                             "Course"}
                                   </h2>
                                   <p className="mb-4 text-sm text-on-surface-variant">
                                        Instructor:{" "}
                                        {certificate.courseId?.instructorId
                                             ?.name || "Instructor"}
                                   </p>

                                   <dl className="mb-5 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-on-surface-variant">
                                             <Calendar size={15} />
                                             <dt className="sr-only">Issued</dt>
                                             <dd>
                                                  Issued{" "}
                                                  {formatDate(
                                                       certificate.issuedAt,
                                                  )}
                                             </dd>
                                        </div>
                                        <div className="rounded-lg bg-surface-container px-3 py-2">
                                             <dt className="text-xs text-on-surface-variant">
                                                  Certificate ID
                                             </dt>
                                             <dd className="break-all font-mono text-xs">
                                                  {certificate.certificateId}
                                             </dd>
                                        </div>
                                   </dl>

                                   <Link
                                        to={`/certificates/${certificate.certificateId}`}
                                        className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-semibold text-on-primary transition hover:bg-primary-container"
                                   >
                                        View certificate
                                   </Link>
                              </li>
                         ))}
                    </ul>
               )}
          </div>
     );
}
