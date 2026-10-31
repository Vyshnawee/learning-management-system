import mongoose from "mongoose";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Review from "../models/Review.js";
import { getCourseForManagement } from "../services/courseService.js";

const completedExpr = {
     $sum: { $cond: [{ $ne: ["$completedAt", null] }, 1, 0] },
};

// GET /api/courses/:courseId/analytics  (owner or admin)
export const getCourseAnalytics = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);
     const courseId = course._id;

     const [totals, lessonCount, ratingBreakdown, quizzes, quizStats] =
          await Promise.all([
               Enrollment.aggregate([
                    { $match: { courseId } },
                    {
                         $group: {
                              _id: null,
                              enrollments: { $sum: 1 },
                              completed: completedExpr,
                              averageProgress: { $avg: "$progressPercentage" },
                         },
                    },
               ]),
               Lesson.countDocuments({ courseId }),
               Review.aggregate([
                    { $match: { courseId } },
                    { $group: { _id: "$rating", count: { $sum: 1 } } },
               ]),
               Quiz.find({ courseId }).select("title passingScore"),
               QuizAttempt.aggregate([
                    { $match: { courseId } },
                    {
                         $group: {
                              _id: "$quizId",
                              attempts: { $sum: 1 },
                              students: { $addToSet: "$studentId" },
                              passedAttempts: {
                                   $sum: { $cond: ["$passed", 1, 0] },
                              },
                              averagePercentage: { $avg: "$percentage" },
                         },
                    },
               ]),
          ]);

     const summary = totals[0] || {
          enrollments: 0,
          completed: 0,
          averageProgress: 0,
     };

     const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
     ratingBreakdown.forEach((r) => (ratings[r._id] = r.count));

     const statsMap = new Map(quizStats.map((s) => [String(s._id), s]));
     const quizResults = quizzes.map((quiz) => {
          const s = statsMap.get(String(quiz._id));
          return {
               quizId: quiz._id,
               title: quiz.title,
               passingScore: quiz.passingScore,
               attempts: s ? s.attempts : 0,
               studentsAttempted: s ? s.students.length : 0,
               passRate: s
                    ? Math.floor((s.passedAttempts / s.attempts) * 100)
                    : 0,
               averagePercentage: s ? Math.round(s.averagePercentage) : 0,
          };
     });

     res.status(200).json({
          success: true,
          data: {
               course: {
                    id: courseId,
                    title: course.title,
                    status: course.status,
               },
               lessonCount,
               enrollments: summary.enrollments,
               completed: summary.completed,
               completionRate: summary.enrollments
                    ? Math.floor(
                           (summary.completed / summary.enrollments) * 100,
                      )
                    : 0,
               averageProgress: Math.round(summary.averageProgress || 0),
               ratingAverage: course.ratingAverage,
               ratingCount: course.ratingCount,
               ratingBreakdown: ratings,
               quizzes: quizResults,
          },
     });
};

// GET /api/instructor/dashboard  (instructor)
export const getInstructorDashboard = async (req, res) => {
     const courses = await Course.find({ instructorId: req.user._id }).select(
          "title status ratingAverage ratingCount",
     );
     const courseIds = courses.map((c) => c._id);

     const [totals, perCourse] = await Promise.all([
          Enrollment.aggregate([
               { $match: { courseId: { $in: courseIds } } },
               {
                    $group: {
                         _id: null,
                         enrollments: { $sum: 1 },
                         completed: completedExpr,
                         students: { $addToSet: "$studentId" },
                    },
               },
          ]),
          Enrollment.aggregate([
               { $match: { courseId: { $in: courseIds } } },
               {
                    $group: {
                         _id: "$courseId",
                         enrollments: { $sum: 1 },
                         completed: completedExpr,
                    },
               },
          ]),
     ]);

     const summary = totals[0] || {
          enrollments: 0,
          completed: 0,
          students: [],
     };
     const perCourseMap = new Map(perCourse.map((p) => [String(p._id), p]));

     res.status(200).json({
          success: true,
          data: {
               courses: {
                    total: courses.length,
                    published: courses.filter((c) => c.status === "published")
                         .length,
                    draft: courses.filter((c) => c.status === "draft").length,
               },
               totalEnrollments: summary.enrollments,
               uniqueStudents: summary.students.length,
               totalCompleted: summary.completed,
               perCourse: courses.map((c) => {
                    const p = perCourseMap.get(String(c._id));
                    return {
                         courseId: c._id,
                         title: c.title,
                         status: c.status,
                         enrollments: p ? p.enrollments : 0,
                         completed: p ? p.completed : 0,
                         ratingAverage: c.ratingAverage,
                         ratingCount: c.ratingCount,
                    };
               }),
          },
     });
};
