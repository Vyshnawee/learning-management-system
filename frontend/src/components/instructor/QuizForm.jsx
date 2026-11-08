import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const MAX_QUESTIONS = 50;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

export const newQuestion = () => ({
     questionText: "",
     options: ["", ""],
     correctAnswer: null,
     points: "1",
});

export const EMPTY_QUIZ = {
     title: "",
     description: "",
     passingScore: "60",
     questions: [newQuestion()],
};

// Turns a quiz from the API into form values
export const quizToValues = (quiz) => ({
     title: quiz.title,
     description: quiz.description || "",
     passingScore: String(quiz.passingScore),
     questions: quiz.questions.map((q) => ({
          questionText: q.questionText,
          options: [...q.options],
          correctAnswer: q.correctAnswer,
          points: String(q.points),
     })),
});

// Trims everything. This is exactly what gets sent to the server.
const clean = (values) => ({
     title: values.title.trim(),
     description: values.description.trim(),
     passingScore:
          values.passingScore.trim() === "" ? NaN : Number(values.passingScore),
     questions: values.questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((option) => option.trim()),
          correctAnswer: q.correctAnswer,
          points: q.points.trim() === "" ? NaN : Number(q.points),
     })),
});

// The same rules as the backend, for instant feedback. The server checks everything again.
const validate = (data) => {
     const errors = {};
     if (data.title.length < 2 || data.title.length > 100)
          errors.title = "Title must be 2 to 100 characters";
     if (
          !Number.isInteger(data.passingScore) ||
          data.passingScore < 0 ||
          data.passingScore > 100
     ) {
          errors.passingScore =
               "Passing score must be a whole number from 0 to 100";
     }
     if (data.questions.length < 1)
          errors.questions = "Add at least one question";

     data.questions.forEach((q, i) => {
          if (!q.questionText)
               errors[`questions[${i}].questionText`] = "Write the question";
          if (q.options.some((option) => !option)) {
               errors[`questions[${i}].options`] =
                    "Fill in every option, or remove the empty ones";
          }
          if (q.correctAnswer === null || q.correctAnswer >= q.options.length) {
               errors[`questions[${i}].correctAnswer`] =
                    "Choose which option is the correct answer";
          }
          if (!Number.isInteger(q.points) || q.points < 1 || q.points > 100) {
               errors[`questions[${i}].points`] =
                    "Points must be a whole number from 1 to 100";
          }
     });
     return errors;
};

// Finds the first message for a field (the server reports list items as "questions[0].options[1]")
const errorFor = (errors, name) =>
     Object.entries(errors).find(
          ([key]) =>
               key === name ||
               key.startsWith(`${name}.`) ||
               key.startsWith(`${name}[`),
     )?.[1];

export default function QuizForm({
     initialValues = EMPTY_QUIZ,
     isEdit = false,
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

     const clearErrors = (test) =>
          setFieldErrors((current) =>
               Object.fromEntries(
                    Object.entries(current).filter(([key]) => !test(key)),
               ),
          );

     const setField = (name, value) => {
          setValues((current) => ({ ...current, [name]: value }));
          clearErrors((key) => key === name);
          setSaved("");
     };

     const handleChange = (event) =>
          setField(event.target.name, event.target.value);

     const updateQuestion = (index, changes) => {
          setValues((current) => ({
               ...current,
               questions: current.questions.map((q, i) =>
                    i === index ? { ...q, ...changes } : q,
               ),
          }));
          clearErrors(
               (key) =>
                    key === "questions" ||
                    key.startsWith(`questions[${index}].`),
          );
          setSaved("");
     };

     const addQuestion = () => {
          setValues((current) => ({
               ...current,
               questions: [...current.questions, newQuestion()],
          }));
          clearErrors((key) => key === "questions");
     };

     const removeQuestion = (index) => {
          setValues((current) => ({
               ...current,
               questions: current.questions.filter((_, i) => i !== index),
          }));
          clearErrors((key) => key.startsWith("questions"));
     };

     const removeOption = (qIndex, oIndex) => {
          const q = values.questions[qIndex];
          let correct = q.correctAnswer;
          if (correct === oIndex) correct = null;
          else if (correct !== null && correct > oIndex) correct -= 1;
          updateQuestion(qIndex, {
               options: q.options.filter((_, i) => i !== oIndex),
               correctAnswer: correct,
          });
     };

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
               setValues(quizToValues(data));
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

     const totalPoints = values.questions.reduce(
          (sum, q) => sum + (Number.parseInt(q.points, 10) || 0),
          0,
     );

     return (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
               <Alert>{formError}</Alert>
               <SuccessNotice>{saved}</SuccessNotice>

               <section className="space-y-5 rounded-xl border border-outline-variant bg-surface-low p-5 sm:p-6">
                    <h2 className="text-xl font-semibold">Quiz details</h2>
                    <Input
                         label="Quiz title"
                         name="title"
                         value={values.title}
                         onChange={handleChange}
                         error={fieldErrors.title}
                         maxLength={100}
                         placeholder="For example: React Basics Quiz"
                    />
                    <Textarea
                         label="Description (optional)"
                         name="description"
                         rows={2}
                         value={values.description}
                         onChange={handleChange}
                         error={fieldErrors.description}
                         maxLength={500}
                         placeholder="Tell students what this quiz covers."
                    />
                    <Input
                         label="Passing score (%)"
                         name="passingScore"
                         type="number"
                         inputMode="numeric"
                         min={0}
                         max={100}
                         step={1}
                         value={values.passingScore}
                         onChange={handleChange}
                         error={fieldErrors.passingScore}
                         hint="The percentage of points a student needs to pass. Students must pass every quiz to earn the certificate."
                         className="max-w-xs"
                    />
               </section>

               <section
                    aria-labelledby="questions-heading"
                    className="space-y-4"
               >
                    <div className="flex flex-wrap items-end justify-between gap-2">
                         <h2
                              id="questions-heading"
                              className="text-xl font-semibold"
                         >
                              Questions
                         </h2>
                         <p className="text-sm text-on-surface-variant">
                              {values.questions.length}{" "}
                              {values.questions.length === 1
                                   ? "question"
                                   : "questions"}{" "}
                              · {totalPoints}{" "}
                              {totalPoints === 1 ? "point" : "points"} in total
                         </p>
                    </div>

                    {isEdit && (
                         <p className="rounded-lg border border-secondary/40 bg-secondary/10 p-3 text-sm text-secondary">
                              Saving replaces all the questions with the ones
                              shown here. Students&apos; past scores are kept.
                         </p>
                    )}

                    {errorFor(fieldErrors, "questions") && (
                         <p role="alert" className="text-sm text-error">
                              {errorFor(fieldErrors, "questions")}
                         </p>
                    )}

                    {values.questions.map((question, qIndex) => (
                         <fieldset
                              key={qIndex}
                              className="space-y-4 rounded-xl border border-outline-variant bg-surface-low p-5"
                         >
                              <legend className="sr-only">
                                   Question {qIndex + 1}
                              </legend>

                              <div className="flex items-center justify-between gap-3">
                                   <p className="font-heading text-lg font-semibold">
                                        Question {qIndex + 1}
                                   </p>
                                   <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        disabled={values.questions.length === 1}
                                        aria-label={`Remove question ${qIndex + 1}`}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-on-surface-variant transition hover:bg-error-container/30 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                                   >
                                        <Trash2 size={16} />
                                        Remove
                                   </button>
                              </div>

                              <Textarea
                                   label="Question"
                                   rows={2}
                                   value={question.questionText}
                                   maxLength={500}
                                   onChange={(event) =>
                                        updateQuestion(qIndex, {
                                             questionText: event.target.value,
                                        })
                                   }
                                   error={errorFor(
                                        fieldErrors,
                                        `questions[${qIndex}].questionText`,
                                   )}
                                   placeholder="Write the question"
                              />

                              <div
                                   role="group"
                                   aria-label={`Options for question ${qIndex + 1}`}
                              >
                                   <p className="mb-1 text-sm font-medium">
                                        Options
                                   </p>
                                   <p className="mb-3 text-sm text-on-surface-variant">
                                        Select the round button next to the{" "}
                                        <strong>correct</strong> answer.
                                   </p>
                                   <ul className="space-y-2">
                                        {question.options.map(
                                             (option, oIndex) => (
                                                  <li
                                                       key={oIndex}
                                                       className="flex items-center gap-1"
                                                  >
                                                       <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
                                                            <input
                                                                 type="radio"
                                                                 name={`correct-${qIndex}`}
                                                                 checked={
                                                                      question.correctAnswer ===
                                                                      oIndex
                                                                 }
                                                                 onChange={() =>
                                                                      updateQuestion(
                                                                           qIndex,
                                                                           {
                                                                                correctAnswer:
                                                                                     oIndex,
                                                                           },
                                                                      )
                                                                 }
                                                                 aria-label={`Mark option ${LETTERS[oIndex]} as the correct answer`}
                                                                 className="h-5 w-5 accent-primary"
                                                            />
                                                       </label>
                                                       <span className="w-6 shrink-0 text-sm font-semibold text-on-surface-variant">
                                                            {LETTERS[oIndex]}
                                                       </span>
                                                       <input
                                                            type="text"
                                                            value={option}
                                                            maxLength={200}
                                                            onChange={(event) =>
                                                                 updateQuestion(
                                                                      qIndex,
                                                                      {
                                                                           options: question.options.map(
                                                                                (
                                                                                     o,
                                                                                     i,
                                                                                ) =>
                                                                                     i ===
                                                                                     oIndex
                                                                                          ? event
                                                                                                 .target
                                                                                                 .value
                                                                                          : o,
                                                                           ),
                                                                      },
                                                                 )
                                                            }
                                                            aria-label={`Option ${LETTERS[oIndex]} of question ${qIndex + 1}`}
                                                            placeholder={`Option ${LETTERS[oIndex]}`}
                                                            className="min-h-11 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-lowest px-3.5 text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                                                       />
                                                       <button
                                                            type="button"
                                                            onClick={() =>
                                                                 removeOption(
                                                                      qIndex,
                                                                      oIndex,
                                                                 )
                                                            }
                                                            disabled={
                                                                 question
                                                                      .options
                                                                      .length <=
                                                                 MIN_OPTIONS
                                                            }
                                                            aria-label={`Remove option ${LETTERS[oIndex]}`}
                                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-error-container/30 hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
                                                       >
                                                            <X size={18} />
                                                       </button>
                                                  </li>
                                             ),
                                        )}
                                   </ul>

                                   {errorFor(
                                        fieldErrors,
                                        `questions[${qIndex}].options`,
                                   ) && (
                                        <p className="mt-2 text-sm text-error">
                                             {errorFor(
                                                  fieldErrors,
                                                  `questions[${qIndex}].options`,
                                             )}
                                        </p>
                                   )}
                                   {errorFor(
                                        fieldErrors,
                                        `questions[${qIndex}].correctAnswer`,
                                   ) && (
                                        <p className="mt-2 text-sm text-error">
                                             {errorFor(
                                                  fieldErrors,
                                                  `questions[${qIndex}].correctAnswer`,
                                             )}
                                        </p>
                                   )}

                                   <button
                                        type="button"
                                        onClick={() =>
                                             updateQuestion(qIndex, {
                                                  options: [
                                                       ...question.options,
                                                       "",
                                                  ],
                                             })
                                        }
                                        disabled={
                                             question.options.length >=
                                             MAX_OPTIONS
                                        }
                                        className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary transition hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-50"
                                   >
                                        <Plus size={16} />
                                        Add option
                                   </button>
                              </div>

                              <Input
                                   label="Points"
                                   type="number"
                                   inputMode="numeric"
                                   min={1}
                                   max={100}
                                   step={1}
                                   value={question.points}
                                   onChange={(event) =>
                                        updateQuestion(qIndex, {
                                             points: event.target.value,
                                        })
                                   }
                                   error={errorFor(
                                        fieldErrors,
                                        `questions[${qIndex}].points`,
                                   )}
                                   className="max-w-40"
                              />
                         </fieldset>
                    ))}

                    <button
                         type="button"
                         onClick={addQuestion}
                         disabled={values.questions.length >= MAX_QUESTIONS}
                         className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant font-semibold text-primary transition hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50"
                    >
                         <Plus size={18} />
                         Add question
                    </button>
               </section>

               <div className="flex flex-wrap items-center gap-3">
                    <Button
                         type="submit"
                         loading={submitting}
                         disabled={isEdit && !isDirty}
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
