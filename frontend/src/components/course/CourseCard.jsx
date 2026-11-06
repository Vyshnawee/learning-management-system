import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, PlayCircle, Star } from "lucide-react";

const LEVEL_LABELS = {
     beginner: "Beginner",
     intermediate: "Intermediate",
     advanced: "Advanced",
};

export default function CourseCard({ course }) {
     const [imageFailed, setImageFailed] = useState(false);
     const instructorName = course.instructorId?.name || "Instructor";
     const hasRating = course.ratingCount > 0;
     const showImage = course.thumbnail && !imageFailed;

     return (
          <article className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-low transition hover:border-outline">
               <div className="relative aspect-video bg-surface-container">
                    {showImage ? (
                         <img
                              src={course.thumbnail}
                              alt=""
                              loading="lazy"
                              onError={() => setImageFailed(true)}
                              className="h-full w-full object-cover"
                         />
                    ) : (
                         <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-container to-surface-highest text-primary/70">
                              <BookOpen size={44} />
                         </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-md bg-surface/85 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                         {LEVEL_LABELS[course.level] || course.level}
                    </span>
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-surface/85 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                         <Star
                              size={13}
                              className="fill-secondary text-secondary"
                         />
                         {hasRating ? (
                              <>
                                   {course.ratingAverage.toFixed(1)}
                                   <span className="font-normal text-on-surface-variant">
                                        ({course.ratingCount})
                                   </span>
                              </>
                         ) : (
                              <span className="font-normal text-on-surface-variant">
                                   New
                              </span>
                         )}
                    </span>
               </div>

               <div className="flex flex-1 flex-col p-5">
                    {course.categoryId?.name && (
                         <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                              {course.categoryId.name}
                         </p>
                    )}
                    <h3 className="mb-1 line-clamp-2 text-lg font-semibold leading-snug">
                         {course.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-on-surface-variant">
                         {course.shortDescription}
                    </p>

                    <div className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
                         <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-highest text-xs font-bold text-on-surface">
                              {instructorName.charAt(0).toUpperCase()}
                         </span>
                         <span className="truncate">{instructorName}</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
                         <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                                   <PlayCircle size={15} />
                                   {course.lessonCount ?? 0}{" "}
                                   {course.lessonCount === 1
                                        ? "lesson"
                                        : "lessons"}
                              </span>
                              <span className="w-fit rounded bg-primary/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                   {course.price > 0
                                        ? `$${course.price}`
                                        : "Free"}
                              </span>
                         </div>
                         <Link
                              to={`/courses/${course._id}`}
                              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
                         >
                              View course
                         </Link>
                    </div>
               </div>
          </article>
     );
}
