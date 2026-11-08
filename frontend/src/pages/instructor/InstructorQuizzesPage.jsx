import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
     ClipboardList,
     Pencil,
     PlusCircle,
     RotateCcw,
     Trash2,
     TriangleAlert,
} from "lucide-react";
import { useCoursePicker } from "../../hooks/useCoursePicker.js";
import { deleteQuiz, getCourseQuizzes } from "../../api/quizApi.js";
import CourseScreen from "../../components/instructor/CourseScreen.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import SuccessNotice from "../../components/common/SuccessNotice.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const buttonLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition";
const createClass = `${buttonLink} bg-primary text-on-primary hover:bg-primary-container`;

function QuizzesPanel({ course }) {
     const [state, setState] = useState({
          status: "loading",
          quizzes: [],
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);
     const [confirmId, setConfirmId] = useState(null);
     const [busyId, setBusyId] = useState(null);
     const [actionError, setActionError] = useState("");
     const [notice, setNotice] = useState("");

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({
               ...current,
               status: current.quizzes.length ? "success" : "loading",
          }));

          getCourseQuizzes(course.courseId, controller.signal)
               .then((res) =>
                    setState({
                         status: "success",
                         quizzes: res.data.quizzes,
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
     }, [course.courseId, reloadKey]);

     const handleDelete = async (quiz) => {
          setBusyId(quiz._id);
          setActionError("");
          setNotice("");
          try {
               await deleteQuiz(quiz._id);
               setConfirmId(null);
               setNotice(`"${quiz.title}" was deleted.`);
               setReloadKey((key) => key + 1);
          } catch (error) {
               setActionError(getErrorMessage(error));
          } finally {
               setBusyId(null);
          }
     };

     if (state.status === "loading") {
          return (
               <div
                    role="status"
                    aria-label="Loading quizzes"
                    className="h-48 animate-pulse rounded-xl bg-surface-low"
               />
          );
     }

     if (state.status === "error") {
          return (
               <EmptyState
                    icon={TriangleAlert}
                    title="Could not load the quizzes"
                    text={state.errorMessage}
                    action={
                         <Button onClick={() => setReloadKey((key) => key + 1)}>
                              <RotateCcw size={16} />
                              Try again
                         </Button>
                    }
               />
          );
     }

     return (
          <div className="space-y-4">
               {actionError && <Alert>{actionError}</Alert>}
               <SuccessNotice>{notice}</SuccessNotice>

               {state.quizzes.length === 0 ? (
                    <EmptyState
                         icon={ClipboardList}
                         title="No quizzes yet"
                         text="Quizzes let students check what they learned. A student must pass every quiz in a course to earn the certificate."
                         action={
                              <Link
                                   to={`/instructor/quizzes/new?course=${course.courseId}`}
                                   className={createClass}
                              >
                                   <PlusCircle size={18} />
                                   Create the first quiz
                              </Link>
                         }
                    />
               ) : (
                    <ul className="space-y-3">
                         {state.quizzes.map((quiz) => (
                              <li
                                   key={quiz._id}
                                   className="rounded-xl border border-outline-variant bg-surface-low p-5"
                              >
                                   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                             <h2 className="truncate text-lg font-semibold">
                                                  {quiz.title}
                                             </h2>
                                             {quiz.description && (
                                                  <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
                                                       {quiz.description}
                                                  </p>
                                             )}
                                             <p className="mt-2 text-sm text-on-surface-variant">
                                                  {quiz.questionCount}{" "}
                                                  {quiz.questionCount === 1
                                                       ? "question"
                                                       : "questions"}{" "}
                                                  · {quiz.totalPoints}{" "}
                                                  {quiz.totalPoints === 1
                                                       ? "point"
                                                       : "points"}{" "}
                                                  · pass at {quiz.passingScore}%
                                             </p>
                                        </div>

                                        {confirmId === quiz._id ? (
                                             <div className="shrink-0 space-y-2">
                                                  <p className="max-w-60 text-xs text-on-surface-variant">
                                                       Delete this quiz and all
                                                       students&apos; attempts?
                                                       This can&apos;t be
                                                       undone.
                                                  </p>
                                                  <div className="flex gap-2">
                                                       <Button
                                                            loading={
                                                                 busyId ===
                                                                 quiz._id
                                                            }
                                                            onClick={() =>
                                                                 handleDelete(
                                                                      quiz,
                                                                 )
                                                            }
                                                       >
                                                            Yes, delete
                                                       </Button>
                                                       <Button
                                                            variant="secondary"
                                                            disabled={
                                                                 busyId ===
                                                                 quiz._id
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
                                                  <Link
                                                       to={`/instructor/quizzes/${quiz._id}/edit`}
                                                       className={`${buttonLink} border border-outline-variant hover:bg-surface-high`}
                                                  >
                                                       <Pencil size={15} />
                                                       Edit
                                                  </Link>
                                                  <button
                                                       onClick={() =>
                                                            setConfirmId(
                                                                 quiz._id,
                                                            )
                                                       }
                                                       aria-label={`Delete ${quiz.title}`}
                                                       className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition hover:bg-error-container/30 hover:text-error"
                                                  >
                                                       <Trash2 size={16} />
                                                  </button>
                                             </div>
                                        )}
                                   </div>
                              </li>
                         ))}
                    </ul>
               )}
          </div>
     );
}

export default function InstructorQuizzesPage() {
     const picker = useCoursePicker();

     return (
          <CourseScreen
               title="Quizzes"
               subtitle="Create and manage the quizzes in your courses."
               picker={picker}
               actions={(course) => (
                    <Link
                         to={`/instructor/quizzes/new?course=${course.courseId}`}
                         className={createClass}
                    >
                         <PlusCircle size={18} />
                         Create quiz
                    </Link>
               )}
          >
               {(course) => (
                    <QuizzesPanel key={course.courseId} course={course} />
               )}
          </CourseScreen>
     );
}
