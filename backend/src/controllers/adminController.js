import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Certificate from "../models/Certificate.js";
import Review from "../models/Review.js";
import AppError from "../utils/AppError.js";
import escapeRegex from "../utils/escapeRegex.js";
import Category from "../models/Category.js";
import Lesson from "../models/Lesson.js";
import pick from "../utils/pick.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
     const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

     const [
          usersByRole,
          suspendedUsers,
          coursesByStatus,
          totalEnrollments,
          completedEnrollments,
          totalCertificates,
          totalReviews,
          newUsers,
          newEnrollments,
          recentUsers,
          recentEnrollments,
     ] = await Promise.all([
          User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
          User.countDocuments({ isActive: false }),
          Course.aggregate([
               { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          Enrollment.countDocuments(),
          Enrollment.countDocuments({ completedAt: { $ne: null } }),
          Certificate.countDocuments(),
          Review.countDocuments(),
          User.countDocuments({ createdAt: { $gte: last7Days } }),
          Enrollment.countDocuments({ enrolledAt: { $gte: last7Days } }),
          User.find()
               .sort({ createdAt: -1 })
               .limit(5)
               .select("name email role createdAt"),
          Enrollment.find()
               .sort({ enrolledAt: -1 })
               .limit(5)
               .populate({ path: "studentId", select: "name" })
               .populate({ path: "courseId", select: "title" })
               .select("studentId courseId enrolledAt"),
     ]);

     // Turn [{ _id: "student", count: 4 }] into { student: 4 }
     const toMap = (rows) =>
          Object.fromEntries(rows.map((r) => [r._id, r.count]));
     const roles = toMap(usersByRole);
     const statuses = toMap(coursesByStatus);

     res.status(200).json({
          success: true,
          data: {
               users: {
                    total: Object.values(roles).reduce((a, b) => a + b, 0),
                    students: roles.student || 0,
                    instructors: roles.instructor || 0,
                    admins: roles.admin || 0,
                    suspended: suspendedUsers,
               },
               courses: {
                    total: Object.values(statuses).reduce((a, b) => a + b, 0),
                    published: statuses.published || 0,
                    draft: statuses.draft || 0,
                    archived: statuses.archived || 0,
               },
               enrollments: {
                    total: totalEnrollments,
                    completed: completedEnrollments,
               },
               certificates: totalCertificates,
               reviews: totalReviews,
               last7Days: { newUsers, newEnrollments },
               recentActivity: { recentUsers, recentEnrollments },
          },
     });
};

// GET /api/admin/users?search=&role=&status=&page=&limit=
export const getUsers = async (req, res) => {
     const { page, limit, skip } = getPagination(req.query, 20);
     const { search, role, status } = req.query;

     const filter = {};
     if (role) filter.role = role;
     if (status) filter.isActive = status === "active";
     if (search) {
          const pattern = new RegExp(escapeRegex(search), "i");
          filter.$or = [{ name: pattern }, { email: pattern }];
     }

     const [users, total] = await Promise.all([
          User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
          User.countDocuments(filter),
     ]);

     res.status(200).json({
          success: true,
          data: { users },
          pagination: buildPaginationMeta(total, page, limit),
     });
};

// PATCH /api/admin/users/:userId/status   Body: { "isActive": false }
export const updateUserStatus = async (req, res) => {
     const { isActive } = req.body;

     if (req.params.userId === req.user._id.toString()) {
          throw new AppError("You cannot change your own account status", 400);
     }

     const user = await User.findById(req.params.userId);
     if (!user) {
          throw new AppError("User not found", 404);
     }

     if (user.role === "admin") {
          throw new AppError("Admin accounts cannot be suspended", 403);
     }

     user.isActive = isActive;
     await user.save();

     res.status(200).json({
          success: true,
          message: isActive ? "User reactivated" : "User suspended",
          data: { user },
     });
};

// GET /api/admin/courses?status=&category=&search=&page=&limit=
export const getAdminCourses = async (req, res) => {
     const { page, limit, skip } = getPagination(req.query, 20);
     const { search, status, category } = req.query;

     const filter = {};
     if (status) filter.status = status;
     if (category) filter.categoryId = category;
     if (search) filter.title = new RegExp(escapeRegex(search), "i");

     const [courses, total] = await Promise.all([
          Course.find(filter)
               .select("-description")
               .populate({
                    path: "instructorId",
                    select: "name email isActive",
               })
               .populate({ path: "categoryId", select: "name" })
               .sort({ createdAt: -1 })
               .skip(skip)
               .limit(limit),
          Course.countDocuments(filter),
     ]);

     res.status(200).json({
          success: true,
          data: { courses },
          pagination: buildPaginationMeta(total, page, limit),
     });
};

// PATCH /api/admin/courses/:courseId/status   Body: { "status": "archived" }
export const updateCourseStatus = async (req, res) => {
     const { status } = req.body;

     const course = await Course.findById(req.params.courseId);
     if (!course) {
          throw new AppError("Course not found", 404);
     }

     if (status === "published") {
          const lessonCount = await Lesson.countDocuments({
               courseId: course._id,
          });
          if (lessonCount === 0) {
               throw new AppError(
                    "A course needs at least one lesson before it can be published",
                    400,
               );
          }
          course.publishedAt = course.publishedAt || new Date();
     }

     course.status = status;
     await course.save();

     res.status(200).json({
          success: true,
          message: `Course status changed to ${status}`,
          data: { course },
     });
};

// GET /api/admin/enrollments  (platform-wide enrollment statistics)
export const getEnrollmentStats = async (req, res) => {
     const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

     const [totals, perDay, topCourses] = await Promise.all([
          Enrollment.aggregate([
               {
                    $group: {
                         _id: null,
                         total: { $sum: 1 },
                         completed: {
                              $sum: {
                                   $cond: [
                                        { $ne: ["$completedAt", null] },
                                        1,
                                        0,
                                   ],
                              },
                         },
                         averageProgress: { $avg: "$progressPercentage" },
                    },
               },
          ]),
          Enrollment.aggregate([
               { $match: { enrolledAt: { $gte: last30Days } } },
               {
                    $group: {
                         _id: {
                              $dateToString: {
                                   format: "%Y-%m-%d",
                                   date: "$enrolledAt",
                              },
                         },
                         count: { $sum: 1 },
                    },
               },
               { $sort: { _id: 1 } },
          ]),
          Enrollment.aggregate([
               {
                    $group: {
                         _id: "$courseId",
                         enrollments: { $sum: 1 },
                         completed: {
                              $sum: {
                                   $cond: [
                                        { $ne: ["$completedAt", null] },
                                        1,
                                        0,
                                   ],
                              },
                         },
                    },
               },
               { $sort: { enrollments: -1 } },
               { $limit: 5 },
               {
                    $lookup: {
                         from: "courses",
                         localField: "_id",
                         foreignField: "_id",
                         as: "course",
                    },
               },
               { $unwind: "$course" },
               {
                    $project: {
                         _id: 0,
                         courseId: "$_id",
                         title: "$course.title",
                         enrollments: 1,
                         completed: 1,
                    },
               },
          ]),
     ]);

     const summary = totals[0] || {
          total: 0,
          completed: 0,
          averageProgress: 0,
     };

     res.status(200).json({
          success: true,
          data: {
               total: summary.total,
               completed: summary.completed,
               completionRate: summary.total
                    ? Math.floor((summary.completed / summary.total) * 100)
                    : 0,
               averageProgress: Math.round(summary.averageProgress || 0),
               enrollmentsPerDay: perDay.map((d) => ({
                    date: d._id,
                    count: d.count,
               })),
               topCourses,
          },
     });
};

// GET /api/admin/categories
export const getAdminCategories = async (req, res) => {
     const [categories, counts] = await Promise.all([
          Category.find().sort({ name: 1 }).lean(),
          Course.aggregate([
               { $group: { _id: "$categoryId", count: { $sum: 1 } } },
          ]),
     ]);

     const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
     const withCounts = categories.map((c) => ({
          ...c,
          courseCount: countMap.get(String(c._id)) || 0,
     }));

     res.status(200).json({
          success: true,
          data: { categories: withCounts },
     });
};

// POST /api/admin/categories
export const createCategory = async (req, res) => {
     const category = await Category.create(
          pick(req.body, ["name", "description"]),
     );

     res.status(201).json({
          success: true,
          message: "Category created",
          data: { category },
     });
};

// PATCH /api/admin/categories/:categoryId
export const updateCategory = async (req, res) => {
     const category = await Category.findById(req.params.categoryId);
     if (!category) {
          throw new AppError("Category not found", 404);
     }

     category.set(pick(req.body, ["name", "description"]));
     await category.save();

     res.status(200).json({
          success: true,
          message: "Category updated",
          data: { category },
     });
};

// DELETE /api/admin/categories/:categoryId  (blocked while courses use it)
export const deleteCategory = async (req, res) => {
     const category = await Category.findById(req.params.categoryId);
     if (!category) {
          throw new AppError("Category not found", 404);
     }

     const inUse = await Course.countDocuments({ categoryId: category._id });
     if (inUse > 0) {
          throw new AppError(
               `This category is used by ${inUse} course(s). Move or delete them first.`,
               409,
          );
     }

     await category.deleteOne();

     res.status(200).json({
          success: true,
          message: "Category deleted",
     });
};
