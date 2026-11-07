import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
     Eye,
     ListTree,
     RotateCcw,
     SearchX,
     ShieldAlert,
     TriangleAlert,
} from "lucide-react";
import { getCourse, updateCourse } from "../../api/courseApi.js";
import { useCategories } from "../../hooks/useCategories.js";
import CourseForm from "../../components/instructor/CourseForm.jsx";
import CourseStatusBadge from "../../components/instructor/CourseStatusBadge.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import SuccessNotice from "../../components/common/SuccessNotice.jsx";
import Button from "../../components/common/Button.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const primaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";
const secondaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant px-5 font-semibold transition hover:bg-surface-high";

export default function EditCoursePage() {
     const { courseId } = useParams();
     const location = useLocation();
     const justCreated = Boolean(location.state?.created);
     const categoriesState = useCategories();

     const [course, setCourse] = useState(null);
     const [status, setStatus] = useState("loading"); // loading | ready | notfound | forbidden | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          getCourse(courseId, controller.signal)
               .then((res) => {
                    if (!res.data.viewer.canManage) {
                         setStatus("forbidden");
                         return;
                    }
                    setCourse(res.data.course);
                    setStatus("ready");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    const code = error.response?.status;
                    if (code === 404 || code === 400) {
                         setStatus("notfound");
                    } else {
                         setErrorMessage(getErrorMessage(error));
                         setStatus("error");
                    }
               });

          return () => controller.abort();
     }, [courseId, reloadKey]);

     const handleSave = async (data) => {
          const res = await updateCourse(courseId, data);
          setCourse(res.data.course);
     };

     const back = (
          <Link to="/instructor/courses" className={primaryLink}>
               Back to my courses
          </Link>
     );

     if (status === "loading" || categoriesState.status === "loading") {
          return (
               <div className="mx-auto max-w-3xl">
                    <div
                         role="status"
                         aria-label="Loading course"
                         className="h-96 animate-pulse rounded-xl bg-surface-low"
                    />
               </div>
          );
     }

     if (status === "notfound") {
          return (
               <div className="mx-auto max-w-3xl">
                    <EmptyState
                         icon={SearchX}
                         title="Course not found"
                         text="This course doesn't exist or has been deleted."
                         action={back}
                    />
               </div>
          );
     }

     if (status === "forbidden") {
          return (
               <div className="mx-auto max-w-3xl">
                    <EmptyState
                         icon={ShieldAlert}
                         title="You can't edit this course"
                         text="You can only edit courses that you created."
                         action={back}
                    />
               </div>
          );
     }

     if (status === "error" || categoriesState.status === "error") {
          return (
               <div className="mx-auto max-w-3xl">
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load this course"
                         text={errorMessage || categoriesState.errorMessage}
                         action={
                              <Button
                                   onClick={() => {
                                        setReloadKey((key) => key + 1);
                                        categoriesState.reload();
                                   }}
                              >
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               </div>
          );
     }

     const initialValues = {
          title: course.title,
          shortDescription: course.shortDescription,
          description: course.description,
          categoryId: course.categoryId?._id || "",
          level: course.level,
          thumbnail: course.thumbnail || "",
          learningObjectives: course.learningObjectives.length
               ? course.learningObjectives
               : [""],
          prerequisites: course.prerequisites,
     };

     return (
          <div className="mx-auto max-w-3xl">
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
                         Edit course
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         {course.title}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                         <Link
                              to={`/instructor/courses/${course._id}/curriculum`}
                              className={secondaryLink}
                         >
                              <ListTree size={18} />
                              Manage sections and lessons
                         </Link>
                         {course.status === "published" && (
                              <Link
                                   to={`/courses/${course._id}`}
                                   className={secondaryLink}
                              >
                                   <Eye size={18} />
                                   View public page
                              </Link>
                         )}
                    </div>
               </header>

               {justCreated && (
                    <div className="mb-6">
                         <SuccessNotice>
                              Course created as a draft. Next, add sections and
                              lessons, then publish it from the My courses page.
                         </SuccessNotice>
                    </div>
               )}

               {/* key makes the form start fresh if you open a different course */}
               <CourseForm
                    key={course._id}
                    categories={categoriesState.categories}
                    initialValues={initialValues}
                    submitLabel="Save changes"
                    onSubmit={handleSave}
                    cancelTo="/instructor/courses"
               />
          </div>
     );
}
