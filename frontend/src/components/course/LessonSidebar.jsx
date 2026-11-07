import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ClipboardList, PlayCircle } from "lucide-react";
import ProgressBar from "../common/ProgressBar.jsx";
import { formatDuration } from "../../utils/format.js";

export default function LessonSidebar({
     courseId,
     sections,
     quizzes,
     completedSet,
     currentLessonId,
     progress,
}) {
     return (
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-low">
               <div className="border-b border-outline-variant p-4">
                    <h2 className="mb-3 text-lg font-semibold">
                         Course content
                    </h2>
                    <div className="mb-2 flex justify-between text-sm">
                         <span className="text-on-surface-variant">
                              {progress.done} of {progress.total} lessons
                              completed
                         </span>
                         <span className="font-semibold text-primary">
                              {progress.percent}%
                         </span>
                    </div>
                    <ProgressBar
                         value={progress.percent}
                         label="Course progress"
                    />
               </div>

               <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100vh-15rem)]">
                    {sections.map((section, sectionIndex) => {
                         const sectionDone = section.lessons.filter((lesson) =>
                              completedSet.has(lesson._id),
                         ).length;

                         return (
                              <div key={section._id}>
                                   <div className="flex items-center justify-between gap-3 bg-surface-container px-4 py-2.5">
                                        <p className="truncate text-sm font-semibold">
                                             Section {sectionIndex + 1}:{" "}
                                             {section.title}
                                        </p>
                                        <span className="shrink-0 text-xs text-on-surface-variant">
                                             {sectionDone}/
                                             {section.lessons.length}
                                        </span>
                                   </div>
                                   <ul>
                                        {section.lessons.map((lesson) => {
                                             const isCurrent =
                                                  lesson._id ===
                                                  currentLessonId;
                                             const isDone = completedSet.has(
                                                  lesson._id,
                                             );
                                             const Icon = isDone
                                                  ? CheckCircle2
                                                  : isCurrent
                                                    ? PlayCircle
                                                    : Circle;

                                             return (
                                                  <li key={lesson._id}>
                                                       <Link
                                                            to={`/student/learn/${courseId}/${lesson._id}`}
                                                            aria-current={
                                                                 isCurrent
                                                                      ? "page"
                                                                      : undefined
                                                            }
                                                            className={`flex min-h-12 items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition ${
                                                                 isCurrent
                                                                      ? "border-primary bg-primary/10"
                                                                      : "border-transparent hover:bg-surface-container"
                                                            }`}
                                                       >
                                                            <Icon
                                                                 size={18}
                                                                 className={
                                                                      isDone ||
                                                                      isCurrent
                                                                           ? "shrink-0 text-primary"
                                                                           : "shrink-0 text-outline"
                                                                 }
                                                            />
                                                            <span
                                                                 className={`min-w-0 flex-1 ${isCurrent ? "font-semibold" : ""}`}
                                                            >
                                                                 {lesson.title}
                                                            </span>
                                                            <span className="shrink-0 text-xs text-on-surface-variant">
                                                                 {formatDuration(
                                                                      lesson.duration,
                                                                 )}
                                                            </span>
                                                       </Link>
                                                  </li>
                                             );
                                        })}
                                   </ul>
                              </div>
                         );
                    })}

                    {quizzes.length > 0 && (
                         <div>
                              <div className="bg-surface-container px-4 py-2.5">
                                   <p className="text-sm font-semibold">
                                        Quizzes
                                   </p>
                              </div>
                              <ul>
                                   {quizzes.map((quiz) => (
                                        <li key={quiz._id}>
                                             <Link
                                                  to={`/student/quizzes/${quiz._id}`}
                                                  className="flex min-h-12 items-center gap-3 border-l-2 border-transparent px-4 py-2.5 text-sm transition hover:bg-surface-container"
                                             >
                                                  <ClipboardList
                                                       size={18}
                                                       className="shrink-0 text-secondary"
                                                  />
                                                  <span className="min-w-0 flex-1">
                                                       <span className="block">
                                                            {quiz.title}
                                                       </span>
                                                       <span className="block text-xs text-on-surface-variant">
                                                            {quiz.questionCount}{" "}
                                                            {quiz.questionCount ===
                                                            1
                                                                 ? "question"
                                                                 : "questions"}{" "}
                                                            · pass at{" "}
                                                            {quiz.passingScore}%
                                                       </span>
                                                  </span>
                                                  <span className="shrink-0 rounded bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-secondary">
                                                       Take quiz
                                                  </span>
                                             </Link>
                                        </li>
                                   ))}
                              </ul>
                         </div>
                    )}
               </div>
          </div>
     );
}
