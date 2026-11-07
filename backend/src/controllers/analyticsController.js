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
     const courses = await Course.find({ instructorId: req.user._id })
          .select(
               "title status level thumbnail ratingAverage ratingCount updatedAt",
          )
          .sort({ updatedAt: -1 })
          .lean();
     const courseIds = courses.map((course) => course._id);

     // The last 6 months including this one, as "YYYY-MM" (UTC)
     const now = new Date();
     const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(
               Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1),
          );
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
     });
     const since = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
     );

     const [perCourse, lessonCounts, monthly, students] = await Promise.all([
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
          Lesson.aggregate([
               { $match: { courseId: { $in: courseIds } } },
               { $group: { _id: "$courseId", count: { $sum: 1 } } },
          ]),
          Enrollment.aggregate([
               {
                    $match: {
                         courseId: { $in: courseIds },
                         enrolledAt: { $gte: since },
                    },
               },
               {
                    $group: {
                         _id: {
                              $dateToString: {
                                   format: "%Y-%m",
                                   date: "$enrolledAt",
                              },
                         },
                         count: { $sum: 1 },
                    },
               },
          ]),
          Enrollment.distinct("studentId", { courseId: { $in: courseIds } }),
     ]);

     const enrollmentMap = new Map(perCourse.map((p) => [String(p._id), p]));
     const lessonMap = new Map(
          lessonCounts.map((l) => [String(l._id), l.count]),
     );
     const monthMap = new Map(monthly.map((m) => [m._id, m.count]));

     const totalEnrollments = perCourse.reduce(
          (sum, p) => sum + p.enrollments,
          0,
     );
     const totalCompleted = perCourse.reduce((sum, p) => sum + p.completed, 0);

     // Overall rating, weighted by how many reviews each course has
     const ratingCount = courses.reduce((sum, c) => sum + c.ratingCount, 0);
     const ratingSum = courses.reduce(
          (sum, c) => sum + c.ratingAverage * c.ratingCount,
          0,
     );

     res.status(200).json({
          success: true,
          data: {
               courses: {
                    total: courses.length,
                    published: courses.filter((c) => c.status === "published")
                         .length,
                    draft: courses.filter((c) => c.status === "draft").length,
                    archived: courses.filter((c) => c.status === "archived")
                         .length,
               },
               totalEnrollments,
               uniqueStudents: students.length,
               totalCompleted,
               completionRate: totalEnrollments
                    ? Math.floor((totalCompleted / totalEnrollments) * 100)
                    : 0,
               rating: {
                    average: ratingCount
                         ? Math.round((ratingSum / ratingCount) * 10) / 10
                         : 0,
                    count: ratingCount,
               },
               monthlyEnrollments: months.map((month) => ({
                    month,
                    count: monthMap.get(month) || 0,
               })),
               perCourse: courses.map((course) => {
                    const stats = enrollmentMap.get(String(course._id));
                    const enrollments = stats ? stats.enrollments : 0;
                    const completed = stats ? stats.completed : 0;
                    return {
                         courseId: course._id,
                         title: course.title,
                         status: course.status,
                         level: course.level,
                         thumbnail: course.thumbnail,
                         lessonCount: lessonMap.get(String(course._id)) || 0,
                         enrollments,
                         completed,
                         completionRate: enrollments
                              ? Math.floor((completed / enrollments) * 100)
                              : null,
                         ratingAverage: course.ratingAverage,
                         ratingCount: course.ratingCount,
                         updatedAt: course.updatedAt,
                    };
               }),
          },
     });
};
