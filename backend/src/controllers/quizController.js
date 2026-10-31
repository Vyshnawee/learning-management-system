import Course from "../models/Course.js";
import Section from "../models/Section.js";
import Quiz from "../models/Quiz.js";
import AppError from "../utils/AppError.js";
import pick from "../utils/pick.js";
import {
     getCourseForManagement,
     getQuizForManagement,
     isCourseManager,
     canAccessLessonContent,
} from "../services/courseService.js";
import Enrollment from "../models/Enrollment.js";
import QuizAttempt from "../models/QuizAttempt.js";

const QUIZ_FIELDS = [
     "title",
     "description",
     "passingScore",
     "sectionId",
     "questions",
];
const QUESTION_FIELDS = ["questionText", "options", "correctAnswer", "points"];

// Keep only the allowed fields of each question
const cleanQuestions = (questions) =>
     questions.map((q) => ({
          ...pick(q, QUESTION_FIELDS),
          questionType: "multiple_choice",
     }));

// The section must belong to the same course as the quiz
const assertSectionInCourse = async (sectionId, courseId) => {
     const exists = await Section.exists({ _id: sectionId, courseId });
     if (!exists) {
          throw new AppError("Section not found in this course", 404);
     }
};

// Student version of a quiz: the correct answers are removed
const hideAnswers = (quiz) => {
     const obj = quiz.toObject();
     obj.questions = obj.questions.map(
          ({ correctAnswer, ...question }) => question,
     );
     return obj;
};

// POST /api/courses/:courseId/quizzes  (owner or admin)
export const createQuiz = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);
     const data = pick(req.body, QUIZ_FIELDS);

     if (data.sectionId) {
          await assertSectionInCourse(data.sectionId, course._id);
     }

     const quiz = await Quiz.create({
          ...data,
          questions: cleanQuestions(data.questions),
          courseId: course._id,
          createdBy: req.user._id,
     });

     res.status(201).json({
          success: true,
          message: "Quiz created",
          data: { quiz },
     });
};

// GET /api/courses/:courseId/quizzes  (owner, admin, or enrolled student)
export const getCourseQuizzes = async (req, res) => {
     const course = await Course.findById(req.params.courseId);

     if (
          !course ||
          (course.status !== "published" && !isCourseManager(course, req.user))
     ) {
          throw new AppError("Course not found", 404);
     }

     if (!(await canAccessLessonContent(course, req.user))) {
          throw new AppError("Enroll in this course to see its quizzes", 403);
     }

     const quizzes = await Quiz.find({ courseId: course._id })
          .sort({ createdAt: 1 })
          .lean();

     // The list shows a summary only, never the questions
     const summaries = quizzes.map(({ questions, ...quiz }) => ({
          ...quiz,
          questionCount: questions.length,
          totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
     }));

     res.status(200).json({
          success: true,
          data: { quizzes: summaries },
     });
};

// GET /api/quizzes/:quizId
// Owner/admin: full quiz with answers. Enrolled student: questions without answers.
export const getQuiz = async (req, res) => {
     const quiz = await Quiz.findById(req.params.quizId);
     const course = quiz ? await Course.findById(quiz.courseId) : null;

     if (
          !quiz ||
          !course ||
          (course.status !== "published" && !isCourseManager(course, req.user))
     ) {
          throw new AppError("Quiz not found", 404);
     }

     if (isCourseManager(course, req.user)) {
          return res.status(200).json({ success: true, data: { quiz } });
     }

     if (!(await canAccessLessonContent(course, req.user))) {
          throw new AppError("Enroll in this course to access this quiz", 403);
     }

     res.status(200).json({
          success: true,
          data: { quiz: hideAnswers(quiz) },
     });
};

// PATCH /api/quizzes/:quizId  (owner or admin)
export const updateQuiz = async (req, res) => {
     const { quiz, course } = await getQuizForManagement(
          req.params.quizId,
          req.user,
     );
     const data = pick(req.body, QUIZ_FIELDS);

     if (data.sectionId) {
          await assertSectionInCourse(data.sectionId, course._id);
     }
     if (data.questions) {
          data.questions = cleanQuestions(data.questions);
     }

     quiz.set(data);
     await quiz.save();

     res.status(200).json({
          success: true,
          message: "Quiz updated",
          data: { quiz },
     });
};

// DELETE /api/quizzes/:quizId  (owner or admin)
export const deleteQuiz = async (req, res) => {
     const { quiz } = await getQuizForManagement(req.params.quizId, req.user);

     // In Step 2 we will also delete this quiz's attempts here
     await QuizAttempt.deleteMany({ quizId: quiz._id });
     await quiz.deleteOne();

     res.status(200).json({
          success: true,
          message: "Quiz deleted",
     });
};

// POST /api/quizzes/:quizId/attempts  (enrolled student)
export const attemptQuiz = async (req, res) => {
     const quiz = await Quiz.findById(req.params.quizId);
     const course = quiz ? await Course.findById(quiz.courseId) : null;

     if (!quiz || !course || course.status !== "published") {
          throw new AppError("Quiz not found", 404);
     }

     const enrolled = await Enrollment.exists({
          studentId: req.user._id,
          courseId: course._id,
     });
     if (!enrolled) {
          throw new AppError("Enroll in this course to take this quiz", 403);
     }

     // Build a map: questionId -> chosen option, rejecting duplicates and unknown questions
     const validIds = new Set(quiz.questions.map((q) => q._id.toString()));
     const chosen = new Map();
     for (const answer of req.body.answers) {
          const id = String(answer.questionId).toLowerCase();
          if (!validIds.has(id)) {
               throw new AppError(
                    "An answer refers to a question that is not in this quiz",
                    400,
               );
          }
          if (chosen.has(id)) {
               throw new AppError(
                    "Each question can be answered only once",
                    400,
               );
          }
          chosen.set(id, answer.selectedOption);
     }

     // Grade on the server. Unanswered questions score 0.
     let score = 0;
     let totalPoints = 0;
     const results = quiz.questions.map((question) => {
          totalPoints += question.points;
          const isCorrect =
               chosen.get(question._id.toString()) === question.correctAnswer;
          if (isCorrect) score += question.points;
          return { questionId: question._id, isCorrect };
     });

     const percentage = Math.floor((score / totalPoints) * 100);
     const passed = score * 100 >= quiz.passingScore * totalPoints;

     const attempt = await QuizAttempt.create({
          quizId: quiz._id,
          courseId: course._id,
          studentId: req.user._id,
          answers: [...chosen].map(([questionId, selectedOption]) => ({
               questionId,
               selectedOption,
          })),
          score,
          totalPoints,
          percentage,
          passed,
     });

     res.status(201).json({
          success: true,
          message: passed
               ? "Quiz passed"
               : "Quiz submitted. You did not reach the passing score.",
          data: {
               attemptId: attempt._id,
               score,
               totalPoints,
               percentage,
               passingScore: quiz.passingScore,
               passed,
               results, // which questions were right or wrong; correct answers are not revealed
          },
     });
};

// GET /api/quizzes/:quizId/attempts/my-results  (the student's own attempts)
export const getMyQuizResults = async (req, res) => {
     const attempts = await QuizAttempt.find({
          quizId: req.params.quizId,
          studentId: req.user._id,
     })
          .select("-answers")
          .sort({ attemptedAt: -1 });

     res.status(200).json({
          success: true,
          data: {
               attempts,
               attemptCount: attempts.length,
               bestPercentage: attempts.reduce(
                    (best, a) => Math.max(best, a.percentage),
                    0,
               ),
               hasPassed: attempts.some((a) => a.passed),
          },
     });
};
