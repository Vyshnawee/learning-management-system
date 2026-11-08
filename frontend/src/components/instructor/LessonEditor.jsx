import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Input from "../common/Input.jsx";
import Textarea from "../common/Textarea.jsx";
import Button from "../common/Button.jsx";
import Alert from "../common/Alert.jsx";
import SuccessNotice from "../common/SuccessNotice.jsx";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";
import { getVideoSource } from "../../utils/video.js";

const MAX_RESOURCES = 10;

const isHttpUrl = (value) => {
     try {
          return ["http:", "https:"].includes(new URL(value).protocol);
     } catch {
          return false;
     }
};

const toValues = (lesson) => ({
     title: lesson?.title || "",
     description: lesson?.description || "",
     videoUrl: lesson?.videoUrl || "",
     duration: String(lesson?.duration ?? 0),
     isPreview: Boolean(lesson?.isPreview),
     resources: (lesson?.resources || []).map(({ title, url }) => ({
          title,
          url,
     })),
});

const clean = (values) => ({
     title: values.title.trim(),
     description: values.description.trim(),
     videoUrl: values.videoUrl.trim(),
     duration: values.duration.trim() === "" ? 0 : Number(values.duration),
     isPreview: values.isPreview,
     resources: values.resources
          .map((r) => ({ title: r.title.trim(), url: r.url.trim() }))
          .filter((r) => r.title || r.url),
});

const VIDEO_HINTS = {
     iframe: "This YouTube or Vimeo video will play on the lesson page.",
     video: "This video file will play on the lesson page.",
     link: "This link can't be embedded. Students will see an Open video button.",
};

// lesson = null creates a new lesson. onSubmit(data) and onDelete() must throw if they fail.
export default function LessonEditor({
     lesson,
     sectionTitle,
     onSubmit,
     onDelete,
     onClose,
}) {
     const isNew = !lesson;
     const [values, setValues] = useState(() => toValues(lesson));
     const [baseline, setBaseline] = useState(() =>
          JSON.stringify(clean(toValues(lesson))),
     );
     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [saved, setSaved] = useState("");
     const [submitting, setSubmitting] = useState(false);
     const [confirmingDelete, setConfirmingDelete] = useState(false);
     const [deleting, setDeleting] = useState(false);

     const isDirty = useMemo(
          () => JSON.stringify(clean(values)) !== baseline,
          [values, baseline],
     );
     const videoSource = values.videoUrl.trim()
          ? getVideoSource(values.videoUrl.trim())
          : null;

     const setField = (name, value) => {
          setValues((current) => ({ ...current, [name]: value }));
          setFieldErrors((current) => {
               const next = { ...current };
               Object.keys(next).forEach((key) => {
                    if (key === name || key.startsWith(`${name}[`))
                         delete next[key];
               });
               return next;
          });
          setSaved("");
     };

     const handleChange = (event) =>
          setField(event.target.name, event.target.value);

     const updateResource = (index, key, value) =>
          setField(
               "resources",
               values.resources.map((r, i) =>
                    i === index ? { ...r, [key]: value } : r,
               ),
          );

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");
          setSaved("");

          // Drop empty resource rows first, so row numbers match what the server reports
          const data = clean(values);
          setValues((current) => ({ ...current, resources: data.resources }));

          const errors = {};
          if (data.title.length < 2 || data.title.length > 100)
               errors.title = "Title must be 2 to 100 characters";
          if (!isHttpUrl(data.videoUrl))
               errors.videoUrl =
                    "Enter a valid video address (starting with https://)";
          if (!Number.isInteger(data.duration) || data.duration < 0) {
               errors.duration =
                    "Duration must be a whole number of minutes, 0 or more";
          }
          data.resources.forEach((resource, i) => {
               if (!resource.title)
                    errors[`resources[${i}].title`] =
                         "Give this resource a title";
               if (!isHttpUrl(resource.url))
                    errors[`resources[${i}].url`] = "Enter a valid web address";
          });
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) {
               setFormError("Please fix the highlighted fields and try again.");
               return;
          }

          setSubmitting(true);
          try {
               await onSubmit(data);
               setBaseline(JSON.stringify(data));
               if (!isNew) setSaved("Lesson saved.");
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
          } finally {
               setSubmitting(false);
          }
     };

     const handleDelete = async () => {
          setDeleting(true);
          await onDelete();
          setDeleting(false);
          setConfirmingDelete(false);
     };

     return (
          <form
               onSubmit={handleSubmit}
               noValidate
               aria-label={isNew ? "New lesson" : "Edit lesson"}
               className="space-y-5 rounded-xl border border-outline-variant bg-surface-low p-5"
          >
               <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                         <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                              {isNew ? "New lesson" : "Edit lesson"}
                         </p>
                         <h2 className="truncate text-xl font-semibold">
                              {isNew ? "Add a lesson" : lesson.title}
                         </h2>
                         <p className="truncate text-sm text-on-surface-variant">
                              in {sectionTitle}
                         </p>
                    </div>
                    <button
                         type="button"
                         onClick={onClose}
                         aria-label="Close lesson editor"
                         className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-high"
                    >
                         <X size={20} />
                    </button>
               </div>

               <Alert>{formError}</Alert>
               <SuccessNotice>{saved}</SuccessNotice>

               <Input
                    label="Lesson title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    error={fieldErrors.title}
                    maxLength={100}
                    placeholder="For example: What is React?"
               />

               <Textarea
                    label="Description (optional)"
                    name="description"
                    rows={3}
                    value={values.description}
                    onChange={handleChange}
                    error={fieldErrors.description}
                    maxLength={1000}
                    placeholder="What will students learn in this lesson?"
               />

               <div>
                    <Input
                         label="Video address"
                         name="videoUrl"
                         type="url"
                         value={values.videoUrl}
                         onChange={handleChange}
                         error={fieldErrors.videoUrl}
                         placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {videoSource &&
                         videoSource.type !== "none" &&
                         !fieldErrors.videoUrl && (
                              <p className="mt-1.5 text-sm text-on-surface-variant">
                                   {VIDEO_HINTS[videoSource.type]}
                              </p>
                         )}
               </div>

               <Input
                    label="Duration (minutes)"
                    name="duration"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={values.duration}
                    onChange={handleChange}
                    error={fieldErrors.duration}
                    hint="Whole minutes, for example 12."
               />

               <div className="flex items-start justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container p-4">
                    <div>
                         <p id="preview-label" className="font-semibold">
                              Free preview
                         </p>
                         <p className="text-sm text-on-surface-variant">
                              Anyone can watch this lesson without enrolling.
                              Good for a welcome lesson.
                         </p>
                    </div>
                    <button
                         type="button"
                         role="switch"
                         aria-checked={values.isPreview}
                         aria-labelledby="preview-label"
                         onClick={() =>
                              setField("isPreview", !values.isPreview)
                         }
                         className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                              values.isPreview
                                   ? "bg-primary"
                                   : "bg-surface-highest"
                         }`}
                    >
                         <span
                              className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                                   values.isPreview
                                        ? "translate-x-6"
                                        : "translate-x-1"
                              }`}
                         />
                    </button>
               </div>

               <fieldset>
                    <legend className="mb-1.5 text-sm font-medium">
                         Resources (optional)
                    </legend>
                    <p className="mb-3 text-sm text-on-surface-variant">
                         Links students can open, such as notes or starter code.
                    </p>
                    <ul className="space-y-3">
                         {values.resources.map((resource, index) => (
                              <li
                                   key={index}
                                   className="rounded-lg border border-outline-variant p-3"
                              >
                                   <div className="space-y-3">
                                        <Input
                                             label={`Resource ${index + 1} title`}
                                             value={resource.title}
                                             maxLength={100}
                                             onChange={(event) =>
                                                  updateResource(
                                                       index,
                                                       "title",
                                                       event.target.value,
                                                  )
                                             }
                                             error={
                                                  fieldErrors[
                                                       `resources[${index}].title`
                                                  ]
                                             }
                                        />
                                        <Input
                                             label={`Resource ${index + 1} address`}
                                             type="url"
                                             value={resource.url}
                                             placeholder="https://"
                                             onChange={(event) =>
                                                  updateResource(
                                                       index,
                                                       "url",
                                                       event.target.value,
                                                  )
                                             }
                                             error={
                                                  fieldErrors[
                                                       `resources[${index}].url`
                                                  ]
                                             }
                                        />
                                        <button
                                             type="button"
                                             onClick={() =>
                                                  setField(
                                                       "resources",
                                                       values.resources.filter(
                                                            (_, i) =>
                                                                 i !== index,
                                                       ),
                                                  )
                                             }
                                             className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-on-surface-variant hover:bg-error-container/30 hover:text-error"
                                        >
                                             <Trash2 size={15} />
                                             Remove resource
                                        </button>
                                   </div>
                              </li>
                         ))}
                    </ul>
                    <button
                         type="button"
                         onClick={() =>
                              setField("resources", [
                                   ...values.resources,
                                   { title: "", url: "" },
                              ])
                         }
                         disabled={values.resources.length >= MAX_RESOURCES}
                         className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-50"
                    >
                         <Plus size={16} />
                         Add resource
                    </button>
               </fieldset>

               <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-5">
                    <Button
                         type="submit"
                         loading={submitting}
                         disabled={!isNew && !isDirty}
                    >
                         {isNew ? "Add lesson" : "Save lesson"}
                    </Button>
                    {!isNew && isDirty && (
                         <span className="text-sm text-secondary">
                              Unsaved changes
                         </span>
                    )}
               </div>

               {!isNew && (
                    <div className="border-t border-outline-variant pt-5">
                         {confirmingDelete ? (
                              <div className="space-y-3">
                                   <p className="text-sm font-semibold">
                                        Delete this lesson? Students&apos;
                                        progress on it is lost.
                                   </p>
                                   <div className="flex flex-wrap gap-3">
                                        <Button
                                             type="button"
                                             onClick={handleDelete}
                                             loading={deleting}
                                        >
                                             Yes, delete lesson
                                        </Button>
                                        <Button
                                             type="button"
                                             variant="secondary"
                                             onClick={() =>
                                                  setConfirmingDelete(false)
                                             }
                                             disabled={deleting}
                                        >
                                             Cancel
                                        </Button>
                                   </div>
                              </div>
                         ) : (
                              <button
                                   type="button"
                                   onClick={() => setConfirmingDelete(true)}
                                   className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-on-surface-variant hover:bg-error-container/30 hover:text-error"
                              >
                                   <Trash2 size={16} />
                                   Delete lesson
                              </button>
                         )}
                    </div>
               )}
          </form>
     );
}
