import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Award, BarChart3, BookOpen, Clock, PlayCircle } from "lucide-react";
import Button from "../common/Button.jsx";
import Alert from "../common/Alert.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { enrollInCourse } from "../../api/enrollmentApi.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDuration } from "../../utils/format.js";

const linkButton =
     "inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 font-semibold transition";

const LEVELS = {
     beginner: "Beginner",
     intermediate: "Intermediate",
     advanced: "Advanced",
};

export default function EnrollCard({
     course,
     totalLessons,
     totalDuration,
     viewer,
     onEnrolled,
}) {
     const { user, loading } = useAuth();
     const location = useLocation();
     const [enrolling, setEnrolling] = useState(false);
     const [error, setError] = useState("");
     const [imageFailed, setImageFailed] = useState(false);

     const handleEnroll = async () => {
          setError("");
          setEnrolling(true);
          try {
               await enrollInCourse(course._id);
               onEnrolled();
          } catch (err) {
               if (err.response?.status === 409) {
                    onEnrolled(); // already enrolled (for example in another tab)
               } else {
                    setError(getErrorMessage(err));
               }
          } finally {
               setEnrolling(false);
          }
     };

     let action;
     if (loading) {
          action = (
               <div className="h-11 animate-pulse rounded-lg bg-surface-high" />
          );
     } else if (viewer.canManage) {
          action = (
               <Link
                    to={
                         user?.role === "admin"
                              ? "/admin/courses"
                              : "/instructor/courses"
                    }
                    className={`${linkButton} border border-outline-variant hover:bg-surface-high`}
               >
                    Manage this course
               </Link>
          );
     } else if (!user) {
          action = (
               <Link
                    to="/login"
                    state={{ from: location }}
                    className={`${linkButton} bg-primary text-on-primary hover:bg-primary-container`}
               >
                    Log in to enroll
               </Link>
          );
     } else if (user.role !== "student") {
          action = (
               <p className="rounded-lg bg-surface-container p-3 text-center text-sm text-on-surface-variant">
                    Only student accounts can enroll in courses.
               </p>
          );
     } else if (viewer.isEnrolled) {
          action = (
               <Link
                    to={`/student/learn/${course._id}`}
                    className={`${linkButton} bg-primary text-on-primary hover:bg-primary-container`}
               >
                    Continue learning
               </Link>
          );
     } else if (course.price > 0) {
          action = (
               <p className="rounded-lg bg-surface-container p-3 text-center text-sm text-on-surface-variant">
                    This is a paid course. Paid enrollment isn&apos;t available
                    yet.
               </p>
          );
     } else {
          action = (
               <Button
                    onClick={handleEnroll}
                    loading={enrolling}
                    className="w-full"
               >
                    Enroll for free
               </Button>
          );
     }

     const specs = [
          {
               icon: PlayCircle,
               text: `${totalLessons} ${totalLessons === 1 ? "lesson" : "lessons"}`,
          },
          { icon: Clock, text: `${formatDuration(totalDuration)} total` },
          { icon: BarChart3, text: LEVELS[course.level] || course.level },
          { icon: Award, text: "Certificate of completion" },
     ];

     return (
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-low">
               <div className="aspect-video bg-surface-container">
                    {course.thumbnail && !imageFailed ? (
                         <img
                              src={course.thumbnail}
                              alt=""
                              onError={() => setImageFailed(true)}
                              className="h-full w-full object-cover"
                         />
                    ) : (
                         <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-container to-surface-highest text-primary/70">
                              <BookOpen size={48} />
                         </div>
                    )}
               </div>

               <div className="space-y-4 p-5">
                    <p className="font-heading text-3xl font-bold text-primary">
                         {course.price > 0 ? `$${course.price}` : "Free"}
                    </p>

                    <Alert>{error}</Alert>
                    {action}

                    <ul className="space-y-3 border-t border-outline-variant pt-4">
                         {specs.map(({ icon: Icon, text }) => (
                              <li
                                   key={text}
                                   className="flex items-center gap-3 text-sm text-on-surface-variant"
                              >
                                   <Icon
                                        size={17}
                                        className="shrink-0 text-primary"
                                   />
                                   {text}
                              </li>
                         ))}
                    </ul>
               </div>
          </div>
     );
}
