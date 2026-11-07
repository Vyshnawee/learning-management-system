import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import ProgressBar from "../common/ProgressBar.jsx";
import { getProgress } from "../../utils/progress.js";

const LEVELS = {
     beginner: "Beginner",
     intermediate: "Intermediate",
     advanced: "Advanced",
};

export default function EnrolledCourseCard({ enrollment }) {
     const [imageFailed, setImageFailed] = useState(false);
     const course = enrollment.courseId;
     const { total, done, percent, isComplete } = getProgress(enrollment);

     if (!course) return null;

     let label = "Continue";
     let Icon = ArrowRight;
     if (isComplete) {
          label = "Review";
          Icon = RotateCcw;
     } else if (done === 0) {
          label = "Start course";
     }

     return (
          <article className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-low transition hover:border-outline">
               <div className="relative aspect-video bg-surface-container">
                    {course.thumbnail && !imageFailed ? (
                         <img
                              src={course.thumbnail}
                              alt=""
                              loading="lazy"
                              onError={() => setImageFailed(true)}
                              className="h-full w-full object-cover"
                         />
                    ) : (
                         <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-container to-surface-highest text-primary/70">
                              <BookOpen size={40} />
                         </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-md bg-surface/85 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                         {LEVELS[course.level] || course.level}
                    </span>
               </div>

               <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-1 line-clamp-2 text-lg font-semibold leading-snug">
                         {course.title}
                    </h3>
                    <p className="mb-4 truncate text-sm text-on-surface-variant">
                         {course.instructorId?.name || "Instructor"}
                    </p>

                    <div className="mt-auto">
                         <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="text-on-surface-variant">
                                   {done} of {total}{" "}
                                   {total === 1 ? "lesson" : "lessons"}
                              </span>
                              <span
                                   className={`font-semibold ${isComplete ? "text-secondary" : "text-primary"}`}
                              >
                                   {percent}%
                              </span>
                         </div>
                         <ProgressBar
                              value={percent}
                              label={`Progress in ${course.title}`}
                         />

                         <Link
                              to={`/student/learn/${course._id}`}
                              className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                                   isComplete || done === 0
                                        ? "border border-outline-variant hover:bg-surface-high"
                                        : "bg-primary text-on-primary hover:bg-primary-container"
                              }`}
                         >
                              {label}
                              <Icon size={16} />
                         </Link>
                    </div>
               </div>
          </article>
     );
}
