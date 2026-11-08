import { useEffect, useState } from "react";
import {
     Link,
     useNavigate,
     useParams,
     useSearchParams,
} from "react-router-dom";
import axios from "axios";
import {
     ClipboardList,
     RotateCcw,
     SearchX,
     ShieldAlert,
     TriangleAlert,
} from "lucide-react";
import { getCourse } from "../../api/courseApi.js";
import { createQuiz, getQuiz, updateQuiz } from "../../api/quizApi.js";
import QuizForm, {
     EMPTY_QUIZ,
     quizToValues,
} from "../../components/instructor/QuizForm.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const primaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";

export default function QuizBuilderPage() {
     const { quizId } = useParams();
     const [searchParams] = useSearchParams();
     const navigate = useNavigate();
     const isEdit = Boolean(quizId);
     const courseParam = searchParams.get("course");

     const [quiz, setQuiz] = useState(null);
     const [course, setCourse] = useState(null);
     const [status, setStatus] = useState("loading"); // loading | ready | nocourse | notfound | forbidden | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          const { signal } = controller;
          setStatus("loading");

          const load = async () => {
               try {
                    let courseId = courseParam;

                    if (isEdit) {
                         // The owner receives the full quiz, including the correct answers
                         const quizRes = await getQuiz(quizId, signal);
                         setQuiz(quizRes.data.quiz);
                         courseId = quizRes.data.quiz.courseId;
                    } else {
                         setQuiz(null);
                         if (!courseId) {
                              setStatus("nocourse");
                              return;
                         }
                    }

                    const courseRes = await getCourse(courseId, signal);
                    if (!courseRes.data.viewer.canManage) {
                         setStatus("forbidden");
                         return;
                    }
                    setCourse({
                         _id: courseRes.data.course._id,
                         title: courseRes.data.course.title,
                    });
                    setStatus("ready");
               } catch (error) {
                    if (axios.isCancel(error)) return;
                    const code = error.response?.status;
                    if (code === 404 || code === 400) setStatus("notfound");
                    else if (code === 403) setStatus("forbidden");
                    else {
                         setErrorMessage(getErrorMessage(error));
                         setStatus("error");
                    }
               }
          };

          load();
          return () => controller.abort();
     }, [quizId, courseParam, isEdit, reloadKey]);

     const listPath = course
          ? `/instructor/quizzes?course=${course._id}`
          : "/instructor/quizzes";

     if (status === "loading") {
          return (
               <div className="mx-auto max-w-3xl">
                    <div
                         role="status"
                         aria-label="Loading quiz"
                         className="h-96 animate-pulse rounded-xl bg-surface-low"
                    />
               </div>
          );
     }

     if (status !== "ready") {
          const states = {
               nocourse: {
                    icon: ClipboardList,
                    title: "Choose a course first",
                    text: "Open the Quizzes page, choose a course, and press Create quiz.",
               },
               notfound: {
                    icon: SearchX,
                    title: "Quiz not found",
                    text: "This quiz doesn't exist or has been deleted.",
               },
               forbidden: {
                    icon: ShieldAlert,
                    title: "You can't manage this quiz",
                    text: "You can only manage quizzes in courses that you created.",
               },
               error: {
                    icon: TriangleAlert,
                    title: "Could not load this page",
                    text: errorMessage,
               },
          };
          const state = states[status];
          return (
               <div className="mx-auto max-w-3xl">
                    <EmptyState
                         icon={state.icon}
                         title={state.title}
                         text={state.text}
                         action={
                              status === "error" ? (
                                   <Button
                                        onClick={() =>
                                             setReloadKey((key) => key + 1)
                                        }
                                   >
                                        <RotateCcw size={16} />
                                        Try again
                                   </Button>
                              ) : (
                                   <Link
                                        to="/instructor/quizzes"
                                        className={primaryLink}
                                   >
                                        Go to quizzes
                                   </Link>
                              )
                         }
                    />
               </div>
          );
     }

     const handleSubmit = async (data) => {
          if (isEdit) {
               await updateQuiz(quizId, data);
          } else {
               await createQuiz(course._id, data);
               navigate(listPath);
          }
     };

     return (
          <div className="mx-auto max-w-3xl">
               <header className="mb-8">
                    <Link
                         to={listPath}
                         className="text-sm text-on-surface-variant hover:text-on-surface"
                    >
                         &larr; Quizzes
                    </Link>
                    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                         {isEdit ? "Edit quiz" : "Create a quiz"}
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         In the course: {course.title}
                    </p>
               </header>

               <QuizForm
                    key={quiz?._id || "new"}
                    initialValues={quiz ? quizToValues(quiz) : EMPTY_QUIZ}
                    isEdit={isEdit}
                    submitLabel={isEdit ? "Save changes" : "Create quiz"}
                    onSubmit={handleSubmit}
                    cancelTo={listPath}
               />
          </div>
     );
}
