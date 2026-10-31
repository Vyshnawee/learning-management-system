import express from "express";
import {
     getDashboard,
     getUsers,
     updateUserStatus,
     getAdminCourses,
     updateCourseStatus,
     getEnrollmentStats,
     getAdminCategories,
     createCategory,
     updateCategory,
     deleteCategory,
} from "../controllers/adminController.js";
import {
     listUsersValidator,
     userStatusValidator,
     listAdminCoursesValidator,
     courseStatusValidator,
     categoryValidator,
     updateCategoryValidator,
} from "../validators/adminValidators.js";
import { idParam } from "../validators/commonValidators.js";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route below this line requires a logged-in admin
router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboard);

// Users
router.get("/users", listUsersValidator, validate, getUsers);
router.patch(
     "/users/:userId/status",
     idParam("userId"),
     userStatusValidator,
     validate,
     updateUserStatus,
);

// Courses
router.get("/courses", listAdminCoursesValidator, validate, getAdminCourses);
router.patch(
     "/courses/:courseId/status",
     idParam("courseId"),
     courseStatusValidator,
     validate,
     updateCourseStatus,
);

// Enrollments
router.get("/enrollments", getEnrollmentStats);

// Categories
router.get("/categories", getAdminCategories);
router.post("/categories", categoryValidator, validate, createCategory);
router.patch(
     "/categories/:categoryId",
     idParam("categoryId"),
     updateCategoryValidator,
     validate,
     updateCategory,
);
router.delete(
     "/categories/:categoryId",
     idParam("categoryId"),
     validate,
     deleteCategory,
);

export default router;
