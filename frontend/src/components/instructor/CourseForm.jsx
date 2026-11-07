import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Input from "../common/Input.jsx";
import Textarea from "../common/Textarea.jsx";
import Select from "../common/Select.jsx";
import Button from "../common/Button.jsx";
import Alert from "../common/Alert.jsx";
import SuccessNotice from "../common/SuccessNotice.jsx";
import ListEditor from "./ListEditor.jsx";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";

const LEVELS = [
     { value: "beginner", label: "Beginner" },
     { value: "intermediate", label: "Intermediate" },
     { value: "advanced", label: "Advanced" },
];

export const EMPTY_COURSE = {
     title: "",
     shortDescription: "",
     description: "",
     categoryId: "",
     level: "beginner",
     thumbnail: "",
     learningObjectives: [""],
     prerequisites: [],
};

// Trims everything and drops empty list items. This is exactly what gets sent to the server.
const clean = (values) => ({
     title: values.title.trim(),
     shortDescription: values.shortDescription.trim(),
     description: values.description.trim(),
     categoryId: values.categoryId,
     level: values.level,
     thumbnail: values.thumbnail.trim(),
     learningObjectives: values.learningObjectives
          .map((item) => item.trim())
          .filter(Boolean),
     prerequisites: values.prerequisites
          .map((item) => item.trim())
          .filter(Boolean),
});

// The same rules as the backend, for instant feedback. The server checks everything again.
const validate = (data) => {
     const errors = {};
     if (data.title.length < 5 || data.title.length > 100)
          errors.title = "Title must be 5 to 100 characters";
     if (!data.shortDescription)
          errors.shortDescription = "A short description is required";
     if (!data.description) errors.description = "A description is required";
     if (!data.categoryId) errors.categoryId = "Please choose a category";
     if (data.thumbnail) {
          try {
               const url = new URL(data.thumbnail);
               if (!["http:", "https:"].includes(url.protocol))
                    throw new Error();
          } catch {
               errors.thumbnail =
                    "Thumbnail must be a valid web address (starting with https://)";
          }
     }
     return errors;
};

// For list fields the backend reports paths like "learningObjectives[0]"
const findListError = (errors, name) =>
     Object.entries(errors).find(
          ([key]) => key === name || key.startsWith(`${name}[`),
     )?.[1];

function Section({ title, text, children }) {
     return (
          <section className="rounded-xl border border-outline-variant bg-surface-low p-5 sm:p-6">
               <h2 className="text-xl font-semibold">{title}</h2>
               {text && (
                    <p className="mb-5 mt-1 text-sm text-on-surface-variant">
                         {text}
                    </p>
               )}
               <div className={`space-y-5 ${text ? "" : "mt-5"}`}>
                    {children}
               </div>
          </section>
     );
}

// onSubmit(payload) must throw if saving fails. Creating navigates away; editing stays on the page.
export default function CourseForm({
     categories,
     initialValues = EMPTY_COURSE,
     submitLabel,
     onSubmit,
     cancelTo,
}) {
     const [values, setValues] = useState(initialValues);
     const [baseline, setBaseline] = useState(() =>
          JSON.stringify(clean(initialValues)),
     );
     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [saved, setSaved] = useState("");
     const [submitting, setSubmitting] = useState(false);

     const isDirty = useMemo(
          () => JSON.stringify(clean(values)) !== baseline,
          [values, baseline],
     );

     // Warn before closing or reloading the tab with unsaved changes
     useEffect(() => {
          if (!isDirty) return;
          const warn = (event) => {
               event.preventDefault();
               event.returnValue = "";
          };
          window.addEventListener("beforeunload", warn);
          return () => window.removeEventListener("beforeunload", warn);
     }, [isDirty]);

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

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");
          setSaved("");

          const data = clean(values);
          const errors = validate(data);
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) {
               setFormError("Please fix the highlighted fields and try again.");
               window.scrollTo({ top: 0, behavior: "smooth" });
               return;
          }

          setSubmitting(true);
          try {
               await onSubmit(data);
               // Saved: show the cleaned values and treat them as the new starting point
               setValues({
                    ...data,
                    learningObjectives: data.learningObjectives,
                    prerequisites: data.prerequisites,
               });
               setBaseline(JSON.stringify(data));
               setSaved("Your changes have been saved.");
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
               window.scrollTo({ top: 0, behavior: "smooth" });
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
               <Alert>{formError}</Alert>
               <SuccessNotice>{saved}</SuccessNotice>

               <Section
                    title="Basic information"
                    text="What students see first in the catalog and on the course page."
               >
                    <Input
                         label="Course title"
                         name="title"
                         value={values.title}
                         onChange={handleChange}
                         error={fieldErrors.title}
                         maxLength={100}
                         placeholder="For example: Intro to React"
                         hint="5 to 100 characters."
                    />
                    <Textarea
                         label="Short description"
                         name="shortDescription"
                         rows={2}
                         value={values.shortDescription}
                         onChange={handleChange}
                         error={fieldErrors.shortDescription}
                         maxLength={200}
                         placeholder="One or two sentences shown on the course card."
                    />
                    <Textarea
                         label="Full description"
                         name="description"
                         rows={7}
                         value={values.description}
                         onChange={handleChange}
                         error={fieldErrors.description}
                         maxLength={5000}
                         placeholder="Explain what the course covers and who it is for."
                    />
               </Section>

               <Section title="Details">
                    <div className="grid gap-5 sm:grid-cols-2">
                         <Select
                              label="Category"
                              name="categoryId"
                              value={values.categoryId}
                              onChange={handleChange}
                              error={fieldErrors.categoryId}
                         >
                              <option value="">Choose a category</option>
                              {categories.map((category) => (
                                   <option
                                        key={category._id}
                                        value={category._id}
                                   >
                                        {category.name}
                                   </option>
                              ))}
                         </Select>
                         <Select
                              label="Level"
                              name="level"
                              value={values.level}
                              onChange={handleChange}
                              error={fieldErrors.level}
                         >
                              {LEVELS.map((level) => (
                                   <option
                                        key={level.value}
                                        value={level.value}
                                   >
                                        {level.label}
                                   </option>
                              ))}
                         </Select>
                    </div>
                    <Input
                         label="Thumbnail image address (optional)"
                         name="thumbnail"
                         type="url"
                         value={values.thumbnail}
                         onChange={handleChange}
                         error={fieldErrors.thumbnail}
                         placeholder="https://example.com/image.jpg"
                         hint="Paste the web address of an image. Without one, a default picture is shown."
                    />
                    {values.thumbnail.trim() && !fieldErrors.thumbnail && (
                         <img
                              src={values.thumbnail.trim()}
                              alt="Thumbnail preview"
                              className="aspect-video w-full max-w-sm rounded-lg border border-outline-variant object-cover"
                              onError={(event) => {
                                   event.currentTarget.style.display = "none";
                              }}
                              onLoad={(event) => {
                                   event.currentTarget.style.display = "block";
                              }}
                         />
                    )}
               </Section>

               <Section
                    title="What students will learn"
                    text="Short points shown on the course page."
               >
                    <ListEditor
                         label="Learning objectives"
                         items={values.learningObjectives}
                         onChange={(items) =>
                              setField("learningObjectives", items)
                         }
                         error={findListError(
                              fieldErrors,
                              "learningObjectives",
                         )}
                         placeholder="For example: Build reusable components"
                         addLabel="Add objective"
                    />
                    <ListEditor
                         label="Prerequisites"
                         hint="What students should already know. Leave empty if nothing is needed."
                         items={values.prerequisites}
                         onChange={(items) => setField("prerequisites", items)}
                         error={findListError(fieldErrors, "prerequisites")}
                         placeholder="For example: Basic JavaScript"
                         addLabel="Add prerequisite"
                    />
               </Section>

               <div className="flex flex-wrap items-center gap-3">
                    <Button
                         type="submit"
                         loading={submitting}
                         disabled={!isDirty && submitLabel !== "Create course"}
                    >
                         {submitLabel}
                    </Button>
                    <Link
                         to={cancelTo}
                         className="inline-flex min-h-11 items-center rounded-lg border border-outline-variant px-5 font-semibold transition hover:bg-surface-high"
                    >
                         {isDirty ? "Cancel" : "Back"}
                    </Link>
                    {isDirty && (
                         <span className="text-sm text-secondary">
                              You have unsaved changes
                         </span>
                    )}
               </div>
          </form>
     );
}
