import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Pencil, RotateCcw, Tags, Trash2, TriangleAlert } from "lucide-react";
import {
     createCategory,
     deleteCategory,
     getAdminCategories,
     updateCategory,
} from "../../api/adminApi.js";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import SuccessNotice from "../../components/common/SuccessNotice.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";

// The form used for both adding and editing. onSubmit must throw if saving fails.
function CategoryForm({
     initialValues = { name: "", description: "" },
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
               name: values.name.trim(),
               description: values.description.trim(),
          };
          const errors = {};
          if (data.name.length < 2 || data.name.length > 50)
               errors.name = "Name must be 2 to 50 characters";
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) return;

          setSubmitting(true);
          try {
               await onSubmit(data);
               if (!onCancel) setValues({ name: "", description: "" }); // clear the "add" form after success
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
               <Alert>{formError}</Alert>
               <Input
                    label="Category name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    error={fieldErrors.name}
                    maxLength={50}
                    placeholder="For example: Cyber Security"
               />
               <Textarea
                    label="Description (optional)"
                    name="description"
                    rows={2}
                    value={values.description}
                    onChange={handleChange}
                    error={fieldErrors.description}
                    maxLength={300}
               />
               <div className="flex flex-wrap gap-3">
                    <Button type="submit" loading={submitting}>
                         {submitLabel}
                    </Button>
                    {onCancel && (
                         <Button
                              type="button"
                              variant="secondary"
                              onClick={onCancel}
                              disabled={submitting}
                         >
                              Cancel
                         </Button>
                    )}
               </div>
          </form>
     );
}

export default function AdminCategoriesPage() {
     const [state, setState] = useState({
          status: "loading",
          categories: [],
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);
     const [editingId, setEditingId] = useState(null);
     const [confirmId, setConfirmId] = useState(null);
     const [busyId, setBusyId] = useState(null);
     const [actionError, setActionError] = useState("");
     const [notice, setNotice] = useState("");

     useEffect(() => {
          const controller = new AbortController();

          getAdminCategories(controller.signal)
               .then((res) =>
                    setState({
                         status: "success",
                         categories: res.data.categories,
                         errorMessage: "",
                    }),
               )
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    setState((current) => ({
                         ...current,
                         status: "error",
                         errorMessage: getErrorMessage(error),
                    }));
               });

          return () => controller.abort();
     }, [reloadKey]);

     const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

     const handleCreate = async (data) => {
          await createCategory(data);
          setActionError("");
          setNotice(`Category "${data.name}" was added.`);
          refresh();
     };

     const handleUpdate = async (category, data) => {
          await updateCategory(category._id, data);
          setEditingId(null);
          setActionError("");
          setNotice(`Category "${data.name}" was updated.`);
          refresh();
     };

     const handleDelete = async (category) => {
          setBusyId(category._id);
          setActionError("");
          setNotice("");
          try {
               await deleteCategory(category._id);
               setConfirmId(null);
               setNotice(`Category "${category.name}" was deleted.`);
               refresh();
          } catch (error) {
               // For example: "This category is used by 2 course(s). Move or delete them first."
               setActionError(getErrorMessage(error));
               setConfirmId(null);
          } finally {
               setBusyId(null);
          }
     };

     return (
          <div className="mx-auto max-w-4xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         Categories
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         Categories organize the catalog. A category that still
                         has courses can&apos;t be deleted.
                    </p>
               </header>

               <section
                    aria-labelledby="add-category-heading"
                    className="mb-8 rounded-xl border border-outline-variant bg-surface-low p-5 sm:p-6"
               >
                    <h2
                         id="add-category-heading"
                         className="mb-4 text-xl font-semibold"
                    >
                         Add a category
                    </h2>
                    <CategoryForm
                         submitLabel="Add category"
                         onSubmit={handleCreate}
                    />
               </section>

               {actionError && (
                    <div className="mb-4">
                         <Alert>{actionError}</Alert>
                    </div>
               )}
               <div className="mb-4">
                    <SuccessNotice>{notice}</SuccessNotice>
               </div>

               {state.status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading categories"
                         className="h-56 animate-pulse rounded-xl bg-surface-low"
                    />
               )}

               {state.status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load the categories"
                         text={state.errorMessage}
                         action={
                              <Button onClick={refresh}>
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               )}

               {state.status === "success" && state.categories.length === 0 && (
                    <EmptyState
                         icon={Tags}
                         title="No categories yet"
                         text="Add the first category above. Instructors need one to create a course."
                    />
               )}

               {state.status === "success" && state.categories.length > 0 && (
                    <ul className="space-y-3">
                         {state.categories.map((category) => {
                              const inUse = category.courseCount > 0;

                              return (
                                   <li
                                        key={category._id}
                                        className="rounded-xl border border-outline-variant bg-surface-low p-5"
                                   >
                                        {editingId === category._id ? (
                                             <CategoryForm
                                                  initialValues={{
                                                       name: category.name,
                                                       description:
                                                            category.description ||
                                                            "",
                                                  }}
                                                  submitLabel="Save changes"
                                                  onSubmit={(data) =>
                                                       handleUpdate(
                                                            category,
                                                            data,
                                                       )
                                                  }
                                                  onCancel={() =>
                                                       setEditingId(null)
                                                  }
                                             />
                                        ) : (
                                             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                  <div className="min-w-0">
                                                       <h2 className="text-lg font-semibold">
                                                            {category.name}
                                                       </h2>
                                                       {category.description && (
                                                            <p className="mt-1 text-sm text-on-surface-variant">
                                                                 {
                                                                      category.description
                                                                 }
                                                            </p>
                                                       )}
                                                       <p className="mt-2 text-sm text-on-surface-variant">
                                                            <span className="font-semibold text-on-surface">
                                                                 {
                                                                      category.courseCount
                                                                 }
                                                            </span>{" "}
                                                            {category.courseCount ===
                                                            1
                                                                 ? "course"
                                                                 : "courses"}{" "}
                                                            · address{" "}
                                                            <span className="font-mono text-xs">
                                                                 {category.slug}
                                                            </span>
                                                       </p>
                                                  </div>

                                                  {confirmId ===
                                                  category._id ? (
                                                       <div className="shrink-0 space-y-2">
                                                            <p className="max-w-56 text-xs text-on-surface-variant">
                                                                 Delete &ldquo;
                                                                 {category.name}
                                                                 &rdquo;? This
                                                                 can&apos;t be
                                                                 undone.
                                                            </p>
                                                            <div className="flex gap-2">
                                                                 <Button
                                                                      loading={
                                                                           busyId ===
                                                                           category._id
                                                                      }
                                                                      onClick={() =>
                                                                           handleDelete(
                                                                                category,
                                                                           )
                                                                      }
                                                                 >
                                                                      Yes,
                                                                      delete
                                                                 </Button>
                                                                 <Button
                                                                      variant="secondary"
                                                                      disabled={
                                                                           busyId ===
                                                                           category._id
                                                                      }
                                                                      onClick={() =>
                                                                           setConfirmId(
                                                                                null,
                                                                           )
                                                                      }
                                                                 >
                                                                      Cancel
                                                                 </Button>
                                                            </div>
                                                       </div>
                                                  ) : (
                                                       <div className="flex shrink-0 gap-2">
                                                            <button
                                                                 onClick={() => {
                                                                      setEditingId(
                                                                           category._id,
                                                                      );
                                                                      setNotice(
                                                                           "",
                                                                      );
                                                                      setActionError(
                                                                           "",
                                                                      );
                                                                 }}
                                                                 className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant px-4 text-sm font-semibold transition hover:bg-surface-high"
                                                            >
                                                                 <Pencil
                                                                      size={15}
                                                                 />
                                                                 Edit
                                                            </button>
                                                            <button
                                                                 onClick={() => {
                                                                      setConfirmId(
                                                                           category._id,
                                                                      );
                                                                      setNotice(
                                                                           "",
                                                                      );
                                                                      setActionError(
                                                                           "",
                                                                      );
                                                                 }}
                                                                 disabled={
                                                                      inUse
                                                                 }
                                                                 aria-label={`Delete ${category.name}`}
                                                                 title={
                                                                      inUse
                                                                           ? "Move or delete its courses first"
                                                                           : `Delete ${category.name}`
                                                                 }
                                                                 className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition hover:bg-error-container/30 hover:text-error disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                                                            >
                                                                 <Trash2
                                                                      size={16}
                                                                 />
                                                            </button>
                                                       </div>
                                                  )}
                                             </div>
                                        )}
                                   </li>
                              );
                         })}
                    </ul>
               )}
          </div>
     );
}
