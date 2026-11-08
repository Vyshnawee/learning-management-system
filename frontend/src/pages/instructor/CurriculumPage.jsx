import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
     ArrowDown,
     ArrowUp,
     Eye,
     ListTree,
     Pencil,
     Plus,
     RotateCcw,
     SearchX,
     ShieldAlert,
     Trash2,
     TriangleAlert,
} from "lucide-react";
import {
     getCourse,
     getCurriculum,
     publishCourse,
} from "../../api/courseApi.js";
import {
     createLesson,
     createSection,
     deleteLesson,
     deleteSection,
     reorderLessons,
     reorderSections,
     updateLesson,
     updateSection,
} from "../../api/curriculumApi.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import SuccessNotice from "../../components/common/SuccessNotice.jsx";
import CourseStatusBadge from "../../components/instructor/CourseStatusBadge.jsx";
import SectionForm from "../../components/instructor/SectionForm.jsx";
import LessonEditor from "../../components/instructor/LessonEditor.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDuration } from "../../utils/format.js";

const primaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";
const secondaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 text-sm font-semibold transition hover:bg-surface-high";

function IconButton({ label, onClick, disabled, danger = false, children }) {
     return (
          <button
               type="button"
               onClick={onClick}
               disabled={disabled}
               aria-label={label}
               title={label}
               className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition disabled:cursor-not-allowed disabled:opacity-30 ${
                    danger
                         ? "hover:bg-error-container/30 hover:text-error"
                         : "hover:bg-surface-high hover:text-on-surface"
               }`}
          >
               {children}
          </button>
     );
}

// Swap two neighbours and return the new list of IDs
const moved = (list, index, delta) => {
     const next = [...list];
     [next[index], next[index + delta]] = [next[index + delta], next[index]];
     return next.map((item) => item._id);
};

export default function CurriculumPage() {
     const { courseId } = useParams();

     const [course, setCourse] = useState(null);
     const [sections, setSections] = useState([]);
     const [status, setStatus] = useState("loading"); // loading | ready | notfound | forbidden | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);

     const [selected, setSelected] = useState(null); // { mode: "new", sectionId } | { mode: "edit", lessonId }
     const [addingSection, setAddingSection] = useState(false);
     const [editingSectionId, setEditingSectionId] = useState(null);
     const [confirmSectionId, setConfirmSectionId] = useState(null);
     const [busy, setBusy] = useState(false);
     const [actionError, setActionError] = useState("");
     const [notice, setNotice] = useState("");
     const editorRef = useRef(null);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          Promise.all([
               getCourse(courseId, controller.signal),
               getCurriculum(courseId, controller.signal),
          ])
               .then(([courseRes, curriculumRes]) => {
                    if (!courseRes.data.viewer.canManage) {
                         setStatus("forbidden");
                         return;
                    }
                    setCourse(courseRes.data.course);
                    setSections(curriculumRes.data.sections);
                    setStatus("ready");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    const code = error.response?.status;
                    if (code === 404 || code === 400) setStatus("notfound");
                    else {
                         setErrorMessage(getErrorMessage(error));
                         setStatus("error");
                    }
               });

          return () => controller.abort();
     }, [courseId, reloadKey]);

     // Reload the curriculum after a change, without showing the loading screen
     const refreshCurriculum = useCallback(async () => {
          const res = await getCurriculum(courseId);
          setSections(res.data.sections);
     }, [courseId]);

     // Runs one change from a button. Errors appear in the red message at the top.
     const mutate = async (action, message = "") => {
          setBusy(true);
          setActionError("");
          setNotice("");
          try {
               await action();
               await refreshCurriculum();
               if (message) setNotice(message);
               return true;
          } catch (error) {
               setActionError(getErrorMessage(error));
               return false;
          } finally {
               setBusy(false);
          }
     };

     const allLessons = useMemo(
          () => sections.flatMap((section) => section.lessons),
          [sections],
     );
     const totalMinutes = allLessons.reduce(
          (sum, lesson) => sum + (lesson.duration || 0),
          0,
     );

     // Find what is open in the editor
     const selectedLesson =
          selected?.mode === "edit"
               ? allLessons.find((lesson) => lesson._id === selected.lessonId)
               : null;
     const selectedSection = selected
          ? sections.find((section) =>
                 selected.mode === "new"
                      ? section._id === selected.sectionId
                      : section.lessons.some(
                             (lesson) => lesson._id === selected.lessonId,
                        ),
            )
          : null;
     const editorKey = selected
          ? selected.mode === "new"
               ? `new-${selected.sectionId}`
               : selected.lessonId
          : "";

     // If the open lesson or section was deleted, close the editor
     useEffect(() => {
          if (selected && !selectedSection) setSelected(null);
     }, [selected, selectedSection]);

     // On phones the editor appears below the list, so scroll to it
     useEffect(() => {
          if (editorKey && window.innerWidth < 1024) {
               editorRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
               });
          }
     }, [editorKey]);

     const handleCreateSection = async (data) => {
          await createSection(courseId, data);
          await refreshCurriculum();
          setAddingSection(false);
          setActionError("");
          setNotice("Section added.");
     };

     const handleUpdateSection = async (sectionId, data) => {
          await updateSection(sectionId, data);
          await refreshCurriculum();
          setEditingSectionId(null);
          setActionError("");
          setNotice("Section updated.");
     };

     const handleSaveLesson = async (data) => {
          setActionError("");
          if (selected.mode === "new") {
               const res = await createLesson(selected.sectionId, data);
               await refreshCurriculum();
               setSelected({ mode: "edit", lessonId: res.data.lesson._id });
               setNotice("Lesson added. You can keep editing it here.");
          } else {
               await updateLesson(selected.lessonId, data);
               await refreshCurriculum();
               setNotice("");
          }
     };

     const handleDeleteLesson = async () => {
          const ok = await mutate(
               () => deleteLesson(selected.lessonId),
               "Lesson deleted.",
          );
          if (ok) setSelected(null);
     };

     const handleTogglePublish = async () => {
          setBusy(true);
          setActionError("");
          setNotice("");
          try {
               const res = await publishCourse(
                    courseId,
                    course.status !== "published",
               );
               setCourse(res.data.course);
               setNotice(res.message);
          } catch (error) {
               // For example: "Add at least one lesson before publishing"
               setActionError(getErrorMessage(error));
          } finally {
               setBusy(false);
          }
     };

     const back = (
          <Link to="/instructor/courses" className={primaryLink}>
               Back to my courses
          </Link>
     );

     if (status === "loading") {
          return (
               <div className="mx-auto max-w-6xl">
                    <div
                         role="status"
                         aria-label="Loading curriculum"
                         className="h-96 animate-pulse rounded-xl bg-surface-low"
                    />
               </div>
          );
     }

     if (status !== "ready") {
          const states = {
               notfound: {
                    icon: SearchX,
                    title: "Course not found",
                    text: "This course doesn't exist or has been deleted.",
                    action: back,
               },
               forbidden: {
                    icon: ShieldAlert,
                    title: "You can't manage this course",
                    text: "You can only manage courses that you created.",
                    action: back,
               },
               error: {
                    icon: TriangleAlert,
                    title: "Could not load this course",
                    text: errorMessage,
                    action: (
                         <Button onClick={() => setReloadKey((key) => key + 1)}>
                              <RotateCcw size={16} />
                              Try again
                         </Button>
                    ),
               },
          };
          const state = states[status];
          return (
               <div className="mx-auto max-w-3xl">
                    <EmptyState
                         icon={state.icon}
                         title={state.title}
                         text={state.text}
                         action={state.action}
                    />
               </div>
          );
     }

     const isPublished = course.status === "published";

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                         <CourseStatusBadge status={course.status} />
                         <Link
                              to="/instructor/courses"
                              className="text-sm text-on-surface-variant hover:text-on-surface"
                         >
                              &larr; My courses
                         </Link>
                    </div>
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         Curriculum
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         {course.title} · {sections.length}{" "}
                         {sections.length === 1 ? "section" : "sections"} ·{" "}
                         {allLessons.length}{" "}
                         {allLessons.length === 1 ? "lesson" : "lessons"} ·{" "}
                         {formatDuration(totalMinutes)}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                         <Link
                              to={`/instructor/courses/${course._id}/edit`}
                              className={secondaryLink}
                         >
                              <Pencil size={16} />
                              Edit course details
                         </Link>
                         <Link
                              to={`/courses/${course._id}`}
                              className={secondaryLink}
                         >
                              <Eye size={16} />
                              {isPublished
                                   ? "View public page"
                                   : "Preview page"}
                         </Link>
                         {course.status !== "archived" && (
                              <Button
                                   variant={
                                        isPublished ? "secondary" : "primary"
                                   }
                                   loading={busy}
                                   onClick={handleTogglePublish}
                              >
                                   {isPublished
                                        ? "Unpublish"
                                        : "Publish course"}
                              </Button>
                         )}
                    </div>
                    {!isPublished && course.status !== "archived" && (
                         <p className="mt-2 text-sm text-on-surface-variant">
                              A course needs at least one lesson to be
                              published.
                         </p>
                    )}
               </header>

               {actionError && (
                    <div className="mb-4">
                         <Alert>{actionError}</Alert>
                    </div>
               )}
               {notice && (
                    <div className="mb-4">
                         <SuccessNotice>{notice}</SuccessNotice>
                    </div>
               )}

               <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
                    {/* Sections and lessons */}
                    <div className="min-w-0 space-y-4">
                         {sections.length === 0 && !addingSection && (
                              <EmptyState
                                   icon={ListTree}
                                   title="No sections yet"
                                   text="Sections group your lessons, for example “Getting started” or “Core concepts”. Add your first one."
                                   action={
                                        <Button
                                             onClick={() =>
                                                  setAddingSection(true)
                                             }
                                        >
                                             <Plus size={16} />
                                             Add section
                                        </Button>
                                   }
                              />
                         )}

                         {sections.map((section, sectionIndex) => (
                              <section
                                   key={section._id}
                                   aria-label={`Section ${sectionIndex + 1}: ${section.title}`}
                                   className="overflow-hidden rounded-xl border border-outline-variant bg-surface-low"
                              >
                                   {editingSectionId === section._id ? (
                                        <div className="p-3">
                                             <SectionForm
                                                  initialValues={{
                                                       title: section.title,
                                                       description:
                                                            section.description ||
                                                            "",
                                                  }}
                                                  submitLabel="Save section"
                                                  onSubmit={(data) =>
                                                       handleUpdateSection(
                                                            section._id,
                                                            data,
                                                       )
                                                  }
                                                  onCancel={() =>
                                                       setEditingSectionId(null)
                                                  }
                                             />
                                        </div>
                                   ) : (
                                        <div className="flex items-center gap-1 bg-surface-container px-4 py-2">
                                             <div className="min-w-0 flex-1">
                                                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                                       Section{" "}
                                                       {sectionIndex + 1}
                                                  </p>
                                                  <h2 className="truncate font-semibold">
                                                       {section.title}
                                                  </h2>
                                                  <p className="text-xs text-on-surface-variant">
                                                       {section.lessons.length}{" "}
                                                       {section.lessons
                                                            .length === 1
                                                            ? "lesson"
                                                            : "lessons"}{" "}
                                                       ·{" "}
                                                       {formatDuration(
                                                            section.lessons.reduce(
                                                                 (sum, l) =>
                                                                      sum +
                                                                      (l.duration ||
                                                                           0),
                                                                 0,
                                                            ),
                                                       )}
                                                  </p>
                                             </div>
                                             <IconButton
                                                  label="Move section up"
                                                  disabled={
                                                       busy ||
                                                       sectionIndex === 0
                                                  }
                                                  onClick={() =>
                                                       mutate(() =>
                                                            reorderSections(
                                                                 courseId,
                                                                 moved(
                                                                      sections,
                                                                      sectionIndex,
                                                                      -1,
                                                                 ),
                                                            ),
                                                       )
                                                  }
                                             >
                                                  <ArrowUp size={18} />
                                             </IconButton>
                                             <IconButton
                                                  label="Move section down"
                                                  disabled={
                                                       busy ||
                                                       sectionIndex ===
                                                            sections.length - 1
                                                  }
                                                  onClick={() =>
                                                       mutate(() =>
                                                            reorderSections(
                                                                 courseId,
                                                                 moved(
                                                                      sections,
                                                                      sectionIndex,
                                                                      1,
                                                                 ),
                                                            ),
                                                       )
                                                  }
                                             >
                                                  <ArrowDown size={18} />
                                             </IconButton>
                                             <IconButton
                                                  label="Edit section"
                                                  disabled={busy}
                                                  onClick={() => {
                                                       setEditingSectionId(
                                                            section._id,
                                                       );
                                                       setConfirmSectionId(
                                                            null,
                                                       );
                                                  }}
                                             >
                                                  <Pencil size={17} />
                                             </IconButton>
                                             <IconButton
                                                  label="Delete section"
                                                  danger
                                                  disabled={busy}
                                                  onClick={() =>
                                                       setConfirmSectionId(
                                                            section._id,
                                                       )
                                                  }
                                             >
                                                  <Trash2 size={17} />
                                             </IconButton>
                                        </div>
                                   )}

                                   {confirmSectionId === section._id && (
                                        <div className="border-b border-outline-variant bg-error-container/20 px-4 py-3">
                                             <p className="mb-3 text-sm font-semibold">
                                                  Delete this section and its{" "}
                                                  {section.lessons.length}{" "}
                                                  {section.lessons.length === 1
                                                       ? "lesson"
                                                       : "lessons"}
                                                  ? This can&apos;t be undone.
                                             </p>
                                             <div className="flex flex-wrap gap-3">
                                                  <Button
                                                       loading={busy}
                                                       onClick={async () => {
                                                            await mutate(
                                                                 () =>
                                                                      deleteSection(
                                                                           section._id,
                                                                      ),
                                                                 "Section deleted.",
                                                            );
                                                            setConfirmSectionId(
                                                                 null,
                                                            );
                                                       }}
                                                  >
                                                       Yes, delete section
                                                  </Button>
                                                  <Button
                                                       variant="secondary"
                                                       disabled={busy}
                                                       onClick={() =>
                                                            setConfirmSectionId(
                                                                 null,
                                                            )
                                                       }
                                                  >
                                                       Cancel
                                                  </Button>
                                             </div>
                                        </div>
                                   )}

                                   <ul>
                                        {section.lessons.map(
                                             (lesson, lessonIndex) => {
                                                  const isOpen =
                                                       selected?.mode ===
                                                            "edit" &&
                                                       selected.lessonId ===
                                                            lesson._id;
                                                  return (
                                                       <li
                                                            key={lesson._id}
                                                            className={`flex items-center border-t border-outline-variant/60 ${
                                                                 isOpen
                                                                      ? "bg-primary/10"
                                                                      : ""
                                                            }`}
                                                       >
                                                            <button
                                                                 type="button"
                                                                 onClick={() => {
                                                                      setSelected(
                                                                           {
                                                                                mode: "edit",
                                                                                lessonId:
                                                                                     lesson._id,
                                                                           },
                                                                      );
                                                                      setNotice(
                                                                           "",
                                                                      );
                                                                 }}
                                                                 aria-current={
                                                                      isOpen
                                                                           ? "true"
                                                                           : undefined
                                                                 }
                                                                 className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left text-sm hover:bg-surface-container"
                                                            >
                                                                 <span className="w-9 shrink-0 text-xs text-outline">
                                                                      {sectionIndex +
                                                                           1}
                                                                      .
                                                                      {lessonIndex +
                                                                           1}
                                                                 </span>
                                                                 <span
                                                                      className={`min-w-0 flex-1 truncate ${isOpen ? "font-semibold" : ""}`}
                                                                 >
                                                                      {
                                                                           lesson.title
                                                                      }
                                                                 </span>
                                                                 {lesson.isPreview && (
                                                                      <span className="shrink-0 rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                                                                           Preview
                                                                      </span>
                                                                 )}
                                                                 <span className="shrink-0 text-xs text-on-surface-variant">
                                                                      {formatDuration(
                                                                           lesson.duration,
                                                                      )}
                                                                 </span>
                                                            </button>
                                                            <IconButton
                                                                 label={`Move lesson ${lesson.title} up`}
                                                                 disabled={
                                                                      busy ||
                                                                      lessonIndex ===
                                                                           0
                                                                 }
                                                                 onClick={() =>
                                                                      mutate(
                                                                           () =>
                                                                                reorderLessons(
                                                                                     section._id,
                                                                                     moved(
                                                                                          section.lessons,
                                                                                          lessonIndex,
                                                                                          -1,
                                                                                     ),
                                                                                ),
                                                                      )
                                                                 }
                                                            >
                                                                 <ArrowUp
                                                                      size={16}
                                                                 />
                                                            </IconButton>
                                                            <IconButton
                                                                 label={`Move lesson ${lesson.title} down`}
                                                                 disabled={
                                                                      busy ||
                                                                      lessonIndex ===
                                                                           section
                                                                                .lessons
                                                                                .length -
                                                                                1
                                                                 }
                                                                 onClick={() =>
                                                                      mutate(
                                                                           () =>
                                                                                reorderLessons(
                                                                                     section._id,
                                                                                     moved(
                                                                                          section.lessons,
                                                                                          lessonIndex,
                                                                                          1,
                                                                                     ),
                                                                                ),
                                                                      )
                                                                 }
                                                            >
                                                                 <ArrowDown
                                                                      size={16}
                                                                 />
                                                            </IconButton>
                                                       </li>
                                                  );
                                             },
                                        )}
                                   </ul>

                                   <div className="border-t border-outline-variant/60 p-2">
                                        <button
                                             type="button"
                                             onClick={() => {
                                                  setSelected({
                                                       mode: "new",
                                                       sectionId: section._id,
                                                  });
                                                  setNotice("");
                                             }}
                                             className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant text-sm font-semibold text-primary hover:bg-surface-container"
                                        >
                                             <Plus size={16} />
                                             Add lesson to this section
                                        </button>
                                   </div>
                              </section>
                         ))}

                         {addingSection ? (
                              <SectionForm
                                   submitLabel="Add section"
                                   onSubmit={handleCreateSection}
                                   onCancel={() => setAddingSection(false)}
                              />
                         ) : (
                              sections.length > 0 && (
                                   <button
                                        type="button"
                                        onClick={() => setAddingSection(true)}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant font-semibold text-primary hover:bg-surface-low"
                                   >
                                        <Plus size={18} />
                                        Add new section
                                   </button>
                              )
                         )}
                    </div>

                    {/* Lesson editor */}
                    <div
                         ref={editorRef}
                         className="min-w-0 scroll-mt-24 lg:sticky lg:top-6 lg:self-start"
                    >
                         {selected && selectedSection ? (
                              <LessonEditor
                                   key={editorKey}
                                   lesson={selectedLesson}
                                   sectionTitle={selectedSection.title}
                                   onSubmit={handleSaveLesson}
                                   onDelete={handleDeleteLesson}
                                   onClose={() => setSelected(null)}
                              />
                         ) : (
                              <div className="hidden rounded-xl border border-dashed border-outline-variant bg-surface-low p-8 text-center lg:block">
                                   <p className="font-semibold">
                                        No lesson selected
                                   </p>
                                   <p className="mt-1 text-sm text-on-surface-variant">
                                        Choose a lesson to edit it, or use “Add
                                        lesson to this section”.
                                   </p>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}
