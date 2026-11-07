import { useState } from "react";
import { ChevronDown, Lock, PlayCircle } from "lucide-react";
import { formatDuration } from "../../utils/format.js";

// hasAccess = enrolled student, or the course owner/admin
export default function CurriculumAccordion({ sections, hasAccess }) {
     // The first section starts open
     const [openIds, setOpenIds] = useState(
          () => new Set(sections.length ? [sections[0]._id] : []),
     );

     const allOpen = openIds.size === sections.length;

     const toggle = (id) =>
          setOpenIds((current) => {
               const next = new Set(current);
               if (next.has(id)) next.delete(id);
               else next.add(id);
               return next;
          });

     const toggleAll = () =>
          setOpenIds(allOpen ? new Set() : new Set(sections.map((s) => s._id)));

     return (
          <div>
               <div className="mb-3 flex justify-end">
                    <button
                         onClick={toggleAll}
                         className="min-h-11 rounded-lg px-3 text-sm font-medium text-primary hover:bg-surface-high"
                    >
                         {allOpen
                              ? "Collapse all sections"
                              : "Expand all sections"}
                    </button>
               </div>

               <div className="space-y-3">
                    {sections.map((section, sectionIndex) => {
                         const isOpen = openIds.has(section._id);
                         const minutes = section.lessons.reduce(
                              (sum, lesson) => sum + (lesson.duration || 0),
                              0,
                         );
                         const panelId = `section-panel-${section._id}`;

                         return (
                              <div
                                   key={section._id}
                                   className="overflow-hidden rounded-xl border border-outline-variant bg-surface-low"
                              >
                                   <button
                                        onClick={() => toggle(section._id)}
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-container"
                                   >
                                        <span className="min-w-0">
                                             <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                                                  Section {sectionIndex + 1}
                                             </span>
                                             <span className="block truncate font-semibold">
                                                  {section.title}
                                             </span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-3 text-sm text-on-surface-variant">
                                             <span className="hidden sm:inline">
                                                  {section.lessons.length}{" "}
                                                  {section.lessons.length === 1
                                                       ? "lesson"
                                                       : "lessons"}{" "}
                                                  · {formatDuration(minutes)}
                                             </span>
                                             <ChevronDown
                                                  size={18}
                                                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                                             />
                                        </span>
                                   </button>

                                   {isOpen && (
                                        <ul
                                             id={panelId}
                                             className="border-t border-outline-variant"
                                        >
                                             {section.lessons.length === 0 && (
                                                  <li className="px-4 py-3 text-sm text-on-surface-variant">
                                                       No lessons in this
                                                       section yet.
                                                  </li>
                                             )}
                                             {section.lessons.map(
                                                  (lesson, lessonIndex) => {
                                                       const unlocked =
                                                            hasAccess ||
                                                            lesson.isPreview;
                                                       const Icon = unlocked
                                                            ? PlayCircle
                                                            : Lock;

                                                       return (
                                                            <li
                                                                 key={
                                                                      lesson._id
                                                                 }
                                                                 className="flex min-h-12 items-center gap-3 border-b border-outline-variant/60 px-4 py-2.5 last:border-b-0"
                                                            >
                                                                 <Icon
                                                                      size={18}
                                                                      className={
                                                                           unlocked
                                                                                ? "shrink-0 text-primary"
                                                                                : "shrink-0 text-outline"
                                                                      }
                                                                 />
                                                                 <span className="w-9 shrink-0 text-xs text-outline">
                                                                      {sectionIndex +
                                                                           1}
                                                                      .
                                                                      {lessonIndex +
                                                                           1}
                                                                 </span>
                                                                 <span className="min-w-0 flex-1 truncate text-sm">
                                                                      {
                                                                           lesson.title
                                                                      }
                                                                 </span>
                                                                 {lesson.isPreview &&
                                                                      !hasAccess && (
                                                                           <span className="shrink-0 rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                                                                                Preview
                                                                           </span>
                                                                      )}
                                                                 <span className="shrink-0 text-xs text-on-surface-variant">
                                                                      {formatDuration(
                                                                           lesson.duration,
                                                                      )}
                                                                 </span>
                                                            </li>
                                                       );
                                                  },
                                             )}
                                        </ul>
                                   )}
                              </div>
                         );
                    })}
               </div>
          </div>
     );
}
