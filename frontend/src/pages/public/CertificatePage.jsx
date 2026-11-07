import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
     ArrowLeft,
     Award,
     Check,
     Copy,
     GraduationCap,
     Printer,
     RotateCcw,
     ShieldCheck,
     ShieldX,
     TriangleAlert,
} from "lucide-react";
import { getCertificate } from "../../api/certificateApi.js";
import Logo from "../../components/common/Logo.jsx";
import Button from "../../components/common/Button.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDate } from "../../utils/format.js";

export default function CertificatePage() {
     const { certificateId } = useParams();
     const { user } = useAuth();

     const [certificate, setCertificate] = useState(null);
     const [status, setStatus] = useState("loading"); // loading | success | invalid | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);
     const [copied, setCopied] = useState(false);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          getCertificate(certificateId, controller.signal)
               .then((res) => {
                    setCertificate(res.data.certificate);
                    setStatus("success");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    const code = error.response?.status;
                    if (code === 404 || code === 400) {
                         setStatus("invalid");
                    } else {
                         setErrorMessage(getErrorMessage(error));
                         setStatus("error");
                    }
               });

          return () => controller.abort();
     }, [certificateId, reloadKey]);

     useEffect(() => {
          if (!certificate) return;
          const previous = document.title;
          document.title = `Certificate: ${certificate.courseTitle} | LearnHub`;
          return () => {
               document.title = previous;
          };
     }, [certificate]);

     // The "Copied" message disappears after a moment
     useEffect(() => {
          if (!copied) return;
          const timer = setTimeout(() => setCopied(false), 2500);
          return () => clearTimeout(timer);
     }, [copied]);

     const verifyUrl = `${window.location.origin}/certificates/${certificateId}`;

     const copyLink = async () => {
          try {
               await navigator.clipboard.writeText(verifyUrl);
               setCopied(true);
          } catch {
               window.prompt("Copy this verification link:", verifyUrl);
          }
     };

     const backTo = user?.role === "student" ? "/student/certificates" : "/";
     const backLabel = user?.role === "student" ? "My certificates" : "Home";

     return (
          <div className="min-h-screen bg-surface print:bg-white">
               <header className="border-b border-outline-variant print:hidden">
                    <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                         <Logo />
                         <Link
                              to={backTo}
                              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-on-surface-variant hover:text-on-surface"
                         >
                              <ArrowLeft size={16} />
                              {backLabel}
                         </Link>
                    </div>
               </header>

               <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 print:p-0">
                    {status === "loading" && (
                         <div
                              role="status"
                              aria-label="Loading certificate"
                              className="h-96 animate-pulse rounded-xl bg-surface-low"
                         />
                    )}

                    {status === "invalid" && (
                         <EmptyState
                              icon={ShieldX}
                              title="Certificate not found"
                              text="We couldn't find a certificate with this ID. Please check the link or the ID and try again."
                              action={
                                   <Link
                                        to="/"
                                        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
                                   >
                                        Go to home
                                   </Link>
                              }
                         />
                    )}

                    {status === "error" && (
                         <EmptyState
                              icon={TriangleAlert}
                              title="Could not load this certificate"
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

                    {status === "success" && certificate && (
                         <>
                              <div className="mb-6 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
                                   <p className="flex items-center gap-2 font-semibold text-primary">
                                        <ShieldCheck size={20} />
                                        Valid certificate, issued by LearnHub
                                   </p>
                                   <div className="flex flex-wrap gap-3">
                                        <Button
                                             variant="secondary"
                                             onClick={copyLink}
                                        >
                                             {copied ? (
                                                  <Check size={16} />
                                             ) : (
                                                  <Copy size={16} />
                                             )}
                                             {copied
                                                  ? "Link copied"
                                                  : "Copy verification link"}
                                        </Button>
                                        <Button onClick={() => window.print()}>
                                             <Printer size={16} />
                                             Print / Save as PDF
                                        </Button>
                                   </div>
                              </div>

                              {/* The certificate itself: a light "paper" design that prints well */}
                              <article
                                   aria-label="Certificate of completion"
                                   className="print-exact mx-auto w-full max-w-4xl rounded-lg border-[6px] border-double border-[#b8862b] bg-[#fbf8ef] p-3 text-[#1f2933] shadow-2xl sm:p-4 print:shadow-none"
                              >
                                   <div className="flex min-h-[28rem] flex-col items-center justify-between gap-6 border border-[#b8862b]/50 px-6 py-10 text-center sm:min-h-[34rem] sm:px-14">
                                        <div className="flex flex-col items-center">
                                             <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f5f57] text-[#fbf8ef]">
                                                  <GraduationCap size={28} />
                                             </span>
                                             <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f5f57]">
                                                  LearnHub
                                             </p>
                                             <h1 className="mt-3 font-heading text-3xl font-bold sm:text-5xl">
                                                  Certificate of Completion
                                             </h1>
                                        </div>

                                        <div className="w-full">
                                             <p className="text-[#52606d]">
                                                  This certifies that
                                             </p>
                                             <p className="mx-auto mt-2 max-w-2xl border-b border-[#b8862b]/60 pb-3 font-heading text-3xl font-bold text-[#0f5f57] sm:text-5xl">
                                                  {certificate.studentName ||
                                                       "Student"}
                                             </p>
                                             <p className="mt-4 text-[#52606d]">
                                                  has successfully completed the
                                                  course
                                             </p>
                                             <p className="mx-auto mt-2 max-w-2xl text-2xl font-semibold sm:text-3xl">
                                                  {certificate.courseTitle}
                                             </p>
                                        </div>

                                        <div className="grid w-full grid-cols-1 items-end gap-6 sm:grid-cols-3">
                                             <div>
                                                  <p className="border-t border-[#1f2933]/40 pt-2 font-semibold">
                                                       {certificate.instructorName ||
                                                            "Instructor"}
                                                  </p>
                                                  <p className="text-sm text-[#52606d]">
                                                       Instructor
                                                  </p>
                                             </div>
                                             <div className="flex justify-center">
                                                  <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-double border-[#b8862b] bg-[#f3e3b3] text-[#8a6212]">
                                                       <Award size={36} />
                                                  </span>
                                             </div>
                                             <div>
                                                  <p className="border-t border-[#1f2933]/40 pt-2 font-semibold">
                                                       {formatDate(
                                                            certificate.issuedAt,
                                                       )}
                                                  </p>
                                                  <p className="text-sm text-[#52606d]">
                                                       Date of issue
                                                  </p>
                                             </div>
                                        </div>

                                        <p className="break-all text-xs text-[#52606d]">
                                             Certificate ID:{" "}
                                             <span className="font-mono">
                                                  {certificate.certificateId}
                                             </span>
                                             <br />
                                             Verify at {verifyUrl}
                                        </p>
                                   </div>
                              </article>
                         </>
                    )}
               </div>
          </div>
     );
}
