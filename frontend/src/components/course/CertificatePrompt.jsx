import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award } from "lucide-react";
import Button from "../common/Button.jsx";
import Alert from "../common/Alert.jsx";
import { issueCertificate } from "../../api/certificateApi.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

// Shown on the learning page when every lesson is complete.
// The server decides whether the certificate can be issued (all lessons + all quizzes passed).
export default function CertificatePrompt({ courseId }) {
     const navigate = useNavigate();
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");

     const handleGet = async () => {
          setLoading(true);
          setError("");
          try {
               const res = await issueCertificate(courseId);
               navigate(`/certificates/${res.data.certificate.certificateId}`);
          } catch (err) {
               // For example: "Pass these quizzes first: React Basics Quiz"
               setError(getErrorMessage(err));
               setLoading(false);
          }
     };

     return (
          <div className="mt-4 rounded-xl border border-secondary/40 bg-secondary/10 p-5">
               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                         <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                              <Award size={20} />
                         </span>
                         <div>
                              <p className="font-semibold text-secondary">
                                   You&apos;ve completed every lesson. Great
                                   work!
                              </p>
                              <p className="text-sm text-on-surface-variant">
                                   Claim your certificate. If the course has
                                   quizzes, you need to pass them too.
                              </p>
                         </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                         <Button onClick={handleGet} loading={loading}>
                              Get my certificate
                         </Button>
                         <Link
                              to="/student/courses"
                              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-primary hover:underline"
                         >
                              My courses
                         </Link>
                    </div>
               </div>
               {error && (
                    <div className="mt-4">
                         <Alert>{error}</Alert>
                    </div>
               )}
          </div>
     );
}
