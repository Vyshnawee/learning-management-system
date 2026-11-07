import { useNavigate } from "react-router-dom";
import { RotateCcw, Tags, TriangleAlert } from "lucide-react";
import { useCategories } from "../../hooks/useCategories.js";
import { createCourse } from "../../api/courseApi.js";
import CourseForm from "../../components/instructor/CourseForm.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";

export default function CreateCoursePage() {
     const navigate = useNavigate();
     const { status, categories, errorMessage, reload } = useCategories();

     const handleCreate = async (data) => {
          const res = await createCourse(data);
          navigate(`/instructor/courses/${res.data.course._id}/edit`, {
               state: { created: true },
          });
     };

     return (
          <div className="mx-auto max-w-3xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         Create a course
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         Your course starts as a draft. Add sections and lessons
                         next, then publish it when it is ready.
                    </p>
               </header>

               {status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading"
                         className="h-96 animate-pulse rounded-xl bg-surface-low"
                    />
               )}

               {status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load the form"
                         text={errorMessage}
                         action={
                              <Button onClick={reload}>
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               )}

               {status === "success" && categories.length === 0 && (
                    <EmptyState
                         icon={Tags}
                         title="No categories available"
                         text="A course needs a category. Ask an admin to add categories first."
                    />
               )}

               {status === "success" && categories.length > 0 && (
                    <CourseForm
                         categories={categories}
                         submitLabel="Create course"
                         onSubmit={handleCreate}
                         cancelTo="/instructor/courses"
                    />
               )}
          </div>
     );
}
