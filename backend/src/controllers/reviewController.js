import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import AppError from "../utils/AppError.js";
import pick from "../utils/pick.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { updateCourseRating } from "../services/reviewService.js";

const REVIEW_FIELDS = ["rating", "comment"];

// POST /api/courses/:courseId/reviews  (enrolled student)
export const createReview = async (req, res) => {
     const course = await Course.findById(req.params.courseId);
     if (!course || course.status !== "published") {
          throw new AppError("Course not found", 404);
     }

     const enrollment = await Enrollment.findOne({
          studentId: req.user._id,
          courseId: course._id,
     });
     if (!enrollment) {
          throw new AppError(
               "Only enrolled students can review this course",
               403,
          );
     }
     if (enrollment.completedLessonIds.length === 0) {
          throw new AppError(
               "Complete at least one lesson before reviewing",
               403,
          );
     }

     try {
          const review = await Review.create({
               ...pick(req.body, REVIEW_FIELDS),
               courseId: course._id,
               studentId: req.user._id,
          });

          await updateCourseRating(course._id);

          res.status(201).json({
               success: true,
               message: "Review submitted",
               data: { review },
          });
     } catch (error) {
          if (error.code === 11000) {
               throw new AppError(
                    "You have already reviewed this course. Edit your review instead.",
                    409,
               );
          }
          throw error;
     }
};

// GET /api/courses/:courseId/reviews  (public, for published courses)
export const getCourseReviews = async (req, res) => {
     const course = await Course.findById(req.params.courseId).select(
          "status ratingAverage ratingCount",
     );
     if (!course || course.status !== "published") {
          throw new AppError("Course not found", 404);
     }

     const { page, limit, skip } = getPagination(req.query, 10);
     const filter = { courseId: course._id };

     const [reviews, total] = await Promise.all([
          Review.find(filter)
               .populate({ path: "studentId", select: "name profileImage" })
               .sort({ createdAt: -1 })
               .skip(skip)
               .limit(limit),
          Review.countDocuments(filter),
     ]);

     res.status(200).json({
          success: true,
          data: {
               reviews,
               ratingAverage: course.ratingAverage,
               ratingCount: course.ratingCount,
          },
          pagination: buildPaginationMeta(total, page, limit),
     });
};

// PATCH /api/reviews/:reviewId  (the author only)
export const updateReview = async (req, res) => {
     const review = await Review.findById(req.params.reviewId);

     // 404 for other people's reviews, so we don't reveal who wrote what
     if (!review || !review.studentId.equals(req.user._id)) {
          throw new AppError("Review not found", 404);
     }

     review.set(pick(req.body, REVIEW_FIELDS));
     await review.save();
     await updateCourseRating(review.courseId);

     res.status(200).json({
          success: true,
          message: "Review updated",
          data: { review },
     });
};

// DELETE /api/reviews/:reviewId  (the author or an admin)
export const deleteReview = async (req, res) => {
     const review = await Review.findById(req.params.reviewId);

     const allowed =
          review &&
          (review.studentId.equals(req.user._id) || req.user.role === "admin");
     if (!allowed) {
          throw new AppError("Review not found", 404);
     }

     await review.deleteOne();
     await updateCourseRating(review.courseId);

     res.status(200).json({
          success: true,
          message: "Review deleted",
     });
};
