import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import { recalculateProgress } from "../services/progressService.js";
import AppError from "../utils/AppError.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { getCourseForManagement } from "../services/courseService.js";

// POST /api/courses/:courseId/enroll  (student)
export const enrollInCourse = async (req, res) => {
     const course = await Course.findById(req.params.courseId);

     // Drafts are hidden, so a draft looks like a missing course
     if (!course || course.status !== "published") {
          throw new AppError("Course not found", 404);
     }

     // We have no payment system yet, so only free courses can be enrolled in
     if (course.price > 0) {
          throw new AppError(
               "Paid courses are not available for enrollment yet",
               400,
          );
     }

     try {
          const enrollment = await Enrollment.create({
               studentId: req.user._id,
               courseId: course._id,
          });

          res.status(201).json({
               success: true,
               message: "Enrolled successfully",
               data: { enrollment },
          });
     } catch (error) {
          // The unique index (studentId + courseId) rejected a duplicate
          if (error.code === 11000) {
               throw new AppError(
                    "You are already enrolled in this course",
                    409,
               );
          }
          throw error;
     }
};

// GET /api/enrollments/my-courses  (student)
export const getMyEnrollments = async (req, res) => {
     const { page, limit, skip } = getPagination(req.query);
     const filter = { studentId: req.user._id };

     const [enrollments, total] = await Promise.all([
          Enrollment.find(filter)
               .select("-completedLessonIds")
               .populate({
                    path: "courseId",
                    select: "title slug shortDescription thumbnail level status instructorId",
                    populate: {
                         path: "instructorId",
                         select: "name profileImage",
                    },
               })
               .sort({ enrolledAt: -1 })
               .skip(skip)
               .limit(limit),
          Enrollment.countDocuments(filter),
     ]);

     res.status(200).json({
          success: true,
          data: { enrollments },
          pagination: buildPaginationMeta(total, page, limit),
     });
};

// GET /api/courses/:courseId/enrollments  (course owner or admin)
export const getCourseEnrollments = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);
     const { page, limit, skip } = getPagination(req.query, 20);
     const filter = { courseId: course._id };

     const [enrollments, total, completedCount] = await Promise.all([
          Enrollment.find(filter)
               .select("-completedLessonIds")
               .populate({
                    path: "studentId",
                    select: "name email profileImage",
               })
               .sort({ enrolledAt: -1 })
               .skip(skip)
               .limit(limit),
          Enrollment.countDocuments(filter),
          Enrollment.countDocuments({ ...filter, completedAt: { $ne: null } }),
     ]);

     res.status(200).json({
          success: true,
          data: { enrollments, completedCount },
          pagination: buildPaginationMeta(total, page, limit),
     });
};

// GET /api/enrollments/:enrollmentId  (the student, the course owner, or admin)
export const getEnrollment = async (req, res) => {
     const enrollment = await Enrollment.findById(
          req.params.enrollmentId,
     ).populate({
          path: "courseId",
          select: "title slug thumbnail instructorId",
     });

     const allowed =
          enrollment &&
          (enrollment.studentId.equals(req.user._id) ||
               enrollment.courseId.instructorId.equals(req.user._id) ||
               req.user.role === "admin");

     // 404 instead of 403, so we don't reveal that the enrollment exists
     if (!allowed) {
          throw new AppError("Enrollment not found", 404);
     }

     res.status(200).json({
          success: true,
          data: { enrollment },
     });
};

// PATCH /api/enrollments/:enrollmentId/progress  (the enrolled student only)
// Body: { "lessonId": "...", "completed": true }   ("completed" defaults to true)
export const updateProgress = async (req, res) => {
     const { lessonId, completed = true } = req.body;

     const enrollment = await Enrollment.findById(req.params.enrollmentId);

     // 404 for someone else's enrollment, so we don't reveal that it exists
     if (!enrollment || !enrollment.studentId.equals(req.user._id)) {
          throw new AppError("Enrollment not found", 404);
     }

     // The lesson must belong to the course of this enrollment
     const lesson = await Lesson.findOne({
          _id: lessonId,
          courseId: enrollment.courseId,
     });
     if (!lesson) {
          throw new AppError("Lesson not found in this course", 404);
     }

     // Atomic update: safe even if two requests arrive at the same moment
     const update = { $set: { lastAccessedLessonId: lesson._id } };
     update[completed ? "$addToSet" : "$pull"] = {
          completedLessonIds: lesson._id,
     };
     await Enrollment.updateOne({ _id: enrollment._id }, update);

     const updated = await recalculateProgress(enrollment._id);

     res.status(200).json({
          success: true,
          message: completed
               ? "Lesson marked as completed"
               : "Lesson marked as not completed",
          data: {
               progressPercentage: updated.progressPercentage,
               completedLessonIds: updated.completedLessonIds,
               lastAccessedLessonId: updated.lastAccessedLessonId,
               completedAt: updated.completedAt,
               isCompleted: !!updated.completedAt,
          },
     });
};
