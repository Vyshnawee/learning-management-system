import express from "express";
import {
     getCourseAnalytics,
     getInstructorDashboard,
} from "../controllers/analyticsController.js";
import { idParam } from "../validators/commonValidators.js";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
     "/courses/:courseId/analytics",
     protect,
     authorize("instructor", "admin"),
     idParam("courseId"),
     validate,
     getCourseAnalytics,
);

router.get(
     "/instructor/dashboard",
     protect,
     authorize("instructor"),
     getInstructorDashboard,
);

export default router;
