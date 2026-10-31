import express from "express";
import {
     enrollInCourse,
     getMyEnrollments,
     getCourseEnrollments,
     getEnrollment,
     updateProgress,
} from "../controllers/enrollmentController.js";
import { idParam } from "../validators/commonValidators.js";
import { progressValidator } from "../validators/enrollmentValidators.js";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
     "/courses/:courseId/enroll",
     protect,
     authorize("student"),
     idParam("courseId"),
     validate,
     enrollInCourse,
);

router.get(
     "/courses/:courseId/enrollments",
     protect,
     authorize("instructor", "admin"),
     idParam("courseId"),
     validate,
     getCourseEnrollments,
);

// "my-courses" must be above "/:enrollmentId", or Express would treat it as an ID
router.get(
     "/enrollments/my-courses",
     protect,
     authorize("student"),
     getMyEnrollments,
);

router.get(
     "/enrollments/:enrollmentId",
     protect,
     idParam("enrollmentId"),
     validate,
     getEnrollment,
);

router.patch(
     "/enrollments/:enrollmentId/progress",
     protect,
     authorize("student"),
     idParam("enrollmentId"),
     progressValidator,
     validate,
     updateProgress,
);

export default router;
