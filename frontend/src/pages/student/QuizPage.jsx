import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
     ArrowLeft,
     ArrowRight,
     CheckCircle2,
     RotateCcw,
     SearchX,
     ShieldAlert,
     TriangleAlert,
     XCircle,
} from "lucide-react";
import { getMyQuizResults, getQuiz, submitAttempt } from "../../api/quizApi.js";
import PageLoader from "../../components/common/PageLoader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
import ScoreRing from "../../components/quiz/ScoreRing.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const primaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition hover:bg-primary-container";
const secondaryLink =
     "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant px-5 font-semibold transition hover:bg-surface-high";

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export default function QuizPage() {
     const { quizId } = useParams();

     const [quiz, setQuiz] = useState(null);
     const [history, setHistory] = useState(null);
     const [status, setStatus] = useState("loading"); // loading | ready | notfound | forbidden | error
     const [errorMessage, setErrorMessage] = useState("");
     const [reloadKey, setReloadKey] = useState(0);

     const [phase, setPhase] = useState("intro"); // intro | taking | result
     const [answers, setAnswers] = useState({}); // questionId -> chosen option position
     const [index, setIndex] = useState(0);
     const [confirming, setConfirming] = useState(false);
     const [submitting, setSubmitting] = useState(false);
     const [submitError, setSubmitError] = useState("");
     const [result, setResult] = useState(null);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");
          setPhase("intro");
          setAnswers({});
          setResult(null);

          Promise.all([
               getQuiz(quizId, controller.signal),
               getMyQuizResults(quizId, controller.signal),
          ])
               .then(([quizRes, historyRes]) => {
                    setQuiz(quizRes.data.quiz);
                    setHistory(historyRes.data);
                    setStatus("ready");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    const code = error.response?.status;
                    if (code === 404 || code === 400) setStatus("notfound");
                    else if (code === 403) setStatus("forbidden");
                    else {
                         setErrorMessage(getErrorMessage(error));
                         setStatus("error");
                    }
               });

          return () => controller.abort();
     }, [quizId, reloadKey]);

     const questions = useMemo(() => quiz?.questions ?? [], [quiz]);
     const totalPoints = useMemo(
          () => questions.reduce((sum, q) => sum + q.points, 0),
          [questions],
     );
     const answeredCount = questions.filter(
          (q) => answers[q._id] !== undefined,
     ).length;

     if (status === "loading") return <PageLoader label="Loading quiz..." />;

     if (status !== "ready") {
          const states = {
               notfound: {
                    icon: SearchX,
                    title: "Quiz not found",
                    text: "This quiz doesn't exist or isn't available right now.",
                    action: (
                         <Link to="/student/courses" className={primaryLink}>
                              Back to my courses
                         </Link>
                    ),
               },
               forbidden: {
                    icon: ShieldAlert,
                    title: "You can't take this quiz",
                    text: "You need to be enrolled in this course to take its quiz.",
                    action: (
                         <Link to="/courses" className={primaryLink}>
                              Browse courses
                         </Link>
                    ),
               },
               error: {
                    icon: TriangleAlert,
                    title: "Could not load this quiz",
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
               <div className="mx-auto max-w-3xl px-4 py-16">
                    <EmptyState
                         icon={state.icon}
                         title={state.title}
                         text={state.text}
                         action={state.action}
                    />
               </div>
          );
     }

     const attemptsLeft = history.attemptsLeftToday;
     const maxAttempts = history.maxAttemptsPerDay;
     const backToCourse = `/student/learn/${quiz.courseId}`;

     const start = () => {
          setAnswers({});
          setIndex(0);
          setConfirming(false);
          setSubmitError("");
          setResult(null);
          setPhase("taking");
          scrollTop();
     };

     const submit = async () => {
          setSubmitting(true);
          setSubmitError("");
          try {
               const res = await submitAttempt(quiz._id, {
                    answers: questions
                         .filter((q) => answers[q._id] !== undefined)
                         .map((q) => ({
                              questionId: q._id,
                              selectedOption: answers[q._id],
                         })),
               });
               const data = res.data;
               setResult(data);
               setHistory((current) => ({
                    ...current,
                    attemptsLeftToday: data.attemptsLeftToday,
                    attemptCount: current.attemptCount + 1,
                    bestPercentage: Math.max(
                         current.bestPercentage,
                         data.percentage,
                    ),
                    hasPassed: current.hasPassed || data.passed,
               }));
               setPhase("result");
               scrollTop();
          } catch (error) {
               if (error.response?.status === 429) {
                    setHistory((current) => ({
                         ...current,
                         attemptsLeftToday: 0,
                    }));
               }
               setSubmitError(getErrorMessage(error));
          } finally {
               setConfirming(false);
               setSubmitting(false);
          }
     };

     const question = questions[index];
     const isLast = index === questions.length - 1;

     return (
          <div className="min-h-screen">
               <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur">
                    <div className="mx-auto flex min-h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
                         <Link
                              to={backToCourse}
                              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg pr-2 text-sm text-on-surface-variant hover:text-on-surface"
                         >
                              <ArrowLeft size={18} />
                              <span className="hidden sm:inline">
                                   Back to course
                              </span>
                         </Link>
                         <span className="hidden h-5 w-px bg-outline-variant sm:block" />
                         <p className="min-w-0 flex-1 truncate font-heading font-semibold">
                              {quiz.title}
                         </p>
                         <span className="shrink-0 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold">
                              Pass at {quiz.passingScore}%
                         </span>
                    </div>
               </header>

               <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    {/* INTRO */}
                    {phase === "intro" && (
                         <div className="rounded-xl border border-outline-variant bg-surface-low p-6 sm:p-8">
                              <h1 className="mb-2 text-3xl font-bold">
                                   {quiz.title}
                              </h1>
                              {quiz.description && (
                                   <p className="mb-6 text-on-surface-variant">
                                        {quiz.description}
                                   </p>
                              )}

                              <dl className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                   {[
                                        ["Questions", questions.length],
                                        ["Total points", totalPoints],
                                        [
                                             "Passing score",
                                             `${quiz.passingScore}%`,
                                        ],
                                        [
                                             "Attempts left today",
                                             `${attemptsLeft} of ${maxAttempts}`,
                                        ],
                                   ].map(([label, value]) => (
                                        <div
                                             key={label}
                                             className="rounded-lg bg-surface-container p-4"
                                        >
                                             <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                                                  {label}
                                             </dt>
                                             <dd className="mt-1 font-heading text-2xl font-bold">
                                                  {value}
                                             </dd>
                                        </div>
                                   ))}
                              </dl>

                              {history.attemptCount > 0 && (
                                   <p className="mb-6 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                                        Your best score so far:
                                        <span className="font-semibold text-on-surface">
                                             {history.bestPercentage}%
                                        </span>
                                        {history.hasPassed && (
                                             <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                                                  <CheckCircle2 size={13} />{" "}
                                                  Passed
                                             </span>
                                        )}
                                   </p>
                              )}

                              {attemptsLeft === 0 && (
                                   <div className="mb-6">
                                        <Alert>
                                             You&apos;ve used all {maxAttempts}{" "}
                                             attempts for today. Please come
                                             back later to try again.
                                        </Alert>
                                   </div>
                              )}

                              <div className="flex flex-wrap gap-3">
                                   <Button
                                        onClick={start}
                                        disabled={attemptsLeft === 0}
                                   >
                                        {history.attemptCount > 0
                                             ? "Try again"
                                             : "Start quiz"}
                                        <ArrowRight size={18} />
                                   </Button>
                                   <Link
                                        to={backToCourse}
                                        className={secondaryLink}
                                   >
                                        Back to course
                                   </Link>
                              </div>
                         </div>
                    )}

                    {/* TAKING THE QUIZ */}
                    {phase === "taking" && question && (
                         <div>
                              <div className="mb-6">
                                   <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-semibold">
                                             Question {index + 1} of{" "}
                                             {questions.length}
                                        </span>
                                        <span className="text-on-surface-variant">
                                             {answeredCount} answered
                                        </span>
                                   </div>
                                   <ProgressBar
                                        value={
                                             (answeredCount /
                                                  questions.length) *
                                             100
                                        }
                                        label="Questions answered"
                                   />
                              </div>

                              <nav
                                   aria-label="Questions"
                                   className="mb-6 flex flex-wrap gap-2"
                              >
                                   {questions.map((q, i) => {
                                        const isCurrent = i === index;
                                        const isAnswered =
                                             answers[q._id] !== undefined;
                                        return (
                                             <button
                                                  key={q._id}
                                                  onClick={() => setIndex(i)}
                                                  aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ""}`}
                                                  aria-current={
                                                       isCurrent
                                                            ? "step"
                                                            : undefined
                                                  }
                                                  className={`flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                                                       isCurrent
                                                            ? "border-primary bg-primary text-on-primary"
                                                            : isAnswered
                                                              ? "border-primary/60 bg-primary/10 text-primary"
                                                              : "border-outline-variant hover:bg-surface-high"
                                                  }`}
                                             >
                                                  {i + 1}
                                             </button>
                                        );
                                   })}
                              </nav>

                              <section className="rounded-xl border border-outline-variant bg-surface-low p-6 sm:p-8">
                                   <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                                        {question.points}{" "}
                                        {question.points === 1
                                             ? "point"
                                             : "points"}
                                   </p>
                                   <h2
                                        id="question-text"
                                        className="mb-6 text-2xl font-semibold leading-snug"
                                   >
                                        {question.questionText}
                                   </h2>

                                   <div
                                        role="radiogroup"
                                        aria-labelledby="question-text"
                                        className="space-y-3"
                                   >
                                        {question.options.map(
                                             (option, optionIndex) => {
                                                  const selected =
                                                       answers[question._id] ===
                                                       optionIndex;
                                                  return (
                                                       <button
                                                            key={optionIndex}
                                                            role="radio"
                                                            aria-checked={
                                                                 selected
                                                            }
                                                            onClick={() =>
                                                                 setAnswers(
                                                                      (
                                                                           current,
                                                                      ) => ({
                                                                           ...current,
                                                                           [question._id]:
                                                                                optionIndex,
                                                                      }),
                                                                 )
                                                            }
                                                            className={`flex min-h-14 w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                                                 selected
                                                                      ? "border-primary bg-primary/10"
                                                                      : "border-outline-variant hover:border-outline hover:bg-surface-container"
                                                            }`}
                                                       >
                                                            <span
                                                                 className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                                                      selected
                                                                           ? "bg-primary text-on-primary"
                                                                           : "bg-surface-highest"
                                                                 }`}
                                                            >
                                                                 {
                                                                      LETTERS[
                                                                           optionIndex
                                                                      ]
                                                                 }
                                                            </span>
                                                            <span className="flex-1">
                                                                 {option}
                                                            </span>
                                                       </button>
                                                  );
                                             },
                                        )}
                                   </div>
                              </section>

                              {submitError && (
                                   <div className="mt-4">
                                        <Alert>{submitError}</Alert>
                                   </div>
                              )}

                              {confirming && (
                                   <div className="mt-4 rounded-xl border border-secondary/40 bg-secondary/10 p-4">
                                        <p className="mb-3 font-semibold text-secondary">
                                             {questions.length - answeredCount}{" "}
                                             unanswered{" "}
                                             {questions.length -
                                                  answeredCount ===
                                             1
                                                  ? "question"
                                                  : "questions"}{" "}
                                             will count as wrong. Submit anyway?
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                             <Button
                                                  onClick={submit}
                                                  loading={submitting}
                                             >
                                                  Submit quiz
                                             </Button>
                                             <Button
                                                  variant="secondary"
                                                  onClick={() =>
                                                       setConfirming(false)
                                                  }
                                                  disabled={submitting}
                                             >
                                                  Keep answering
                                             </Button>
                                        </div>
                                   </div>
                              )}

                              <div className="mt-6 flex items-center justify-between gap-3">
                                   <Button
                                        variant="secondary"
                                        onClick={() => setIndex(index - 1)}
                                        disabled={index === 0}
                                   >
                                        <ArrowLeft size={18} />
                                        Previous
                                   </Button>

                                   {isLast ? (
                                        <Button
                                             loading={submitting && !confirming}
                                             disabled={
                                                  answeredCount === 0 ||
                                                  confirming
                                             }
                                             onClick={() =>
                                                  answeredCount <
                                                  questions.length
                                                       ? setConfirming(true)
                                                       : submit()
                                             }
                                        >
                                             Submit quiz
                                        </Button>
                                   ) : (
                                        <Button
                                             onClick={() => setIndex(index + 1)}
                                        >
                                             Next
                                             <ArrowRight size={18} />
                                        </Button>
                                   )}
                              </div>
                              {isLast && answeredCount === 0 && (
                                   <p className="mt-3 text-right text-sm text-on-surface-variant">
                                        Answer at least one question to submit.
                                   </p>
                              )}
                         </div>
                    )}

                    {/* RESULT */}
                    {phase === "result" && result && (
                         <div className="space-y-8">
                              <section
                                   aria-labelledby="result-heading"
                                   className="flex flex-col items-center gap-6 rounded-xl border border-outline-variant bg-surface-low p-6 text-center sm:flex-row sm:p-8 sm:text-left"
                              >
                                   <ScoreRing
                                        percent={result.percentage}
                                        passed={result.passed}
                                   />
                                   <div className="flex-1">
                                        <span
                                             className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                                                  result.passed
                                                       ? "bg-primary/15 text-primary"
                                                       : "bg-error-container/40 text-on-error-container"
                                             }`}
                                        >
                                             {result.passed ? (
                                                  <CheckCircle2 size={15} />
                                             ) : (
                                                  <XCircle size={15} />
                                             )}
                                             {result.passed
                                                  ? "Passed"
                                                  : "Not passed"}{" "}
                                             · Passing score{" "}
                                             {result.passingScore}%
                                        </span>
                                        <h1
                                             id="result-heading"
                                             className="text-3xl font-bold"
                                        >
                                             {result.passed
                                                  ? "Great job! You passed the quiz."
                                                  : "You didn't pass this time."}
                                        </h1>
                                        <p className="mt-2 text-on-surface-variant">
                                             You scored {result.score} of{" "}
                                             {result.totalPoints} points.{" "}
                                             {result.passed
                                                  ? "Your result has been saved."
                                                  : "Review your answers below and try again when you're ready."}
                                        </p>
                                        <p className="mt-2 text-sm text-on-surface-variant">
                                             Attempts left today:{" "}
                                             <span className="font-semibold text-on-surface">
                                                  {result.attemptsLeftToday} of{" "}
                                                  {maxAttempts}
                                             </span>
                                        </p>
                                        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                                             {result.attemptsLeftToday > 0 && (
                                                  <Button
                                                       variant="secondary"
                                                       onClick={start}
                                                  >
                                                       <RotateCcw size={16} />
                                                       Retake quiz
                                                  </Button>
                                             )}
                                             <Link
                                                  to={backToCourse}
                                                  className={primaryLink}
                                             >
                                                  Back to course
                                             </Link>
                                        </div>
                                   </div>
                              </section>

                              <section aria-labelledby="breakdown-heading">
                                   <h2
                                        id="breakdown-heading"
                                        className="mb-1 text-2xl font-semibold"
                                   >
                                        Question breakdown
                                   </h2>
                                   <p className="mb-4 text-sm text-on-surface-variant">
                                        Your answers are shown below. The
                                        correct answers are not revealed.
                                   </p>
                                   <ol className="space-y-3">
                                        {questions.map((q, i) => {
                                             const isCorrect =
                                                  result.results.find(
                                                       (r) =>
                                                            r.questionId ===
                                                            q._id,
                                                  )?.isCorrect;
                                             const picked = answers[q._id];
                                             return (
                                                  <li
                                                       key={q._id}
                                                       className="rounded-xl border border-outline-variant bg-surface-low p-5"
                                                  >
                                                       <div className="mb-3 flex items-start justify-between gap-3">
                                                            <p className="min-w-0">
                                                                 <span className="mr-2 text-sm text-outline">
                                                                      Q{i + 1}
                                                                 </span>
                                                                 <span className="font-semibold">
                                                                      {
                                                                           q.questionText
                                                                      }
                                                                 </span>
                                                            </p>
                                                            <span
                                                                 className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${
                                                                      isCorrect
                                                                           ? "bg-primary/15 text-primary"
                                                                           : "bg-error-container/40 text-on-error-container"
                                                                 }`}
                                                            >
                                                                 {isCorrect ? (
                                                                      <CheckCircle2
                                                                           size={
                                                                                13
                                                                           }
                                                                      />
                                                                 ) : (
                                                                      <XCircle
                                                                           size={
                                                                                13
                                                                           }
                                                                      />
                                                                 )}
                                                                 {isCorrect
                                                                      ? `Correct +${q.points}`
                                                                      : "Incorrect"}
                                                            </span>
                                                       </div>
                                                       <p className="rounded-lg bg-surface-container px-3 py-2 text-sm">
                                                            <span className="text-on-surface-variant">
                                                                 Your
                                                                 answer:{" "}
                                                            </span>
                                                            {picked ===
                                                            undefined ? (
                                                                 <span className="italic text-on-surface-variant">
                                                                      Not
                                                                      answered
                                                                 </span>
                                                            ) : (
                                                                 <span>
                                                                      {
                                                                           LETTERS[
                                                                                picked
                                                                           ]
                                                                      }
                                                                      .{" "}
                                                                      {
                                                                           q
                                                                                .options[
                                                                                picked
                                                                           ]
                                                                      }
                                                                 </span>
                                                            )}
                                                       </p>
                                                  </li>
                                             );
                                        })}
                                   </ol>
                              </section>
                         </div>
                    )}
               </div>
          </div>
     );
}
