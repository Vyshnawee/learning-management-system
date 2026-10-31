import express from "express";
import {
     createReview,
     getCourseReviews,
     updateReview,
     deleteReview,
} from "../controllers/reviewController.js";
import {
     createReviewValidator,
     updateReviewValidator,
} from "../validators/reviewValidators.js";
import { idParam } from "../validators/commonValidators.js";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
     "/courses/:courseId/reviews",
     protect,
     authorize("student"),
     idParam("courseId"),
     createReviewValidator,
     validate,
     createReview,
);

router.get(
     "/courses/:courseId/reviews",
     idParam("courseId"),
     validate,
     getCourseReviews,
);

router.patch(
     "/reviews/:reviewId",
     protect,
     authorize("student"),
     idParam("reviewId"),
     updateReviewValidator,
     validate,
     updateReview,
);

router.delete(
     "/reviews/:reviewId",
     protect,
     authorize("student", "admin"),
     idParam("reviewId"),
     validate,
     deleteReview,
);

export default router;
