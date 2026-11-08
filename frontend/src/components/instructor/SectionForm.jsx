import { useState } from "react";
import Input from "../common/Input.jsx";
import Textarea from "../common/Textarea.jsx";
import Button from "../common/Button.jsx";
import Alert from "../common/Alert.jsx";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";

// onSubmit({ title, description }) must throw if saving fails
export default function SectionForm({
     initialValues = { title: "", description: "" },
     submitLabel,
     onSubmit,
     onCancel,
}) {
     const [values, setValues] = useState(initialValues);
     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [submitting, setSubmitting] = useState(false);

     const handleChange = (event) => {
          const { name, value } = event.target;
          setValues((current) => ({ ...current, [name]: value }));
          setFieldErrors((current) => ({ ...current, [name]: "" }));
     };

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");

          const data = {
               title: values.title.trim(),
               description: values.description.trim(),
          };
          const errors = {};
          if (data.title.length < 2 || data.title.length > 100)
               errors.title = "Title must be 2 to 100 characters";
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) return;

          setSubmitting(true);
          try {
               await onSubmit(data);
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
               setSubmitting(false);
          }
     };

     return (
          <form
               onSubmit={handleSubmit}
               noValidate
               className="space-y-4 rounded-xl border border-primary/40 bg-surface-container p-4"
          >
               <Alert>{formError}</Alert>
               <Input
                    label="Section title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    error={fieldErrors.title}
                    maxLength={100}
                    placeholder="For example: Getting started"
                    autoFocus
               />
               <Textarea
                    label="Description (optional)"
                    name="description"
                    rows={2}
                    value={values.description}
                    onChange={handleChange}
                    error={fieldErrors.description}
                    maxLength={500}
               />
               <div className="flex flex-wrap gap-3">
                    <Button type="submit" loading={submitting}>
                         {submitLabel}
                    </Button>
                    <Button
                         type="button"
                         variant="secondary"
                         onClick={onCancel}
                         disabled={submitting}
                    >
                         Cancel
                    </Button>
               </div>
          </form>
     );
}
