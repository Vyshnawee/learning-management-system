import express from "express";
import {
     createCourse,
     getCourses,
     getMyCourses,
     getCourse,
     updateCourse,
     deleteCourse,
     publishCourse,
} from "../controllers/courseController.js";
import {
     createCourseValidator,
     updateCourseValidator,
     listCoursesValidator,
     publishValidator,
} from "../validators/courseValidators.js";
import { idParam } from "../validators/commonValidators.js";
import validate from "../middleware/validate.js";
import {
     protect,
     authorize,
     optionalAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listCoursesValidator, validate, getCourses);

// "/mine" must be above "/:courseId", or Express would treat "mine" as an ID
router.get(
     "/mine",
     protect,
     authorize("instructor"),
     listCoursesValidator,
     validate,
     getMyCourses,
);

router.post(
     "/",
     protect,
     authorize("instructor"),
     createCourseValidator,
     validate,
     createCourse,
);

router.get(
     "/:courseId",
     idParam("courseId"),
     validate,
     optionalAuth,
     getCourse,
);

router.patch(
     "/:courseId",
     protect,
     authorize("instructor", "admin"),
     idParam("courseId"),
     updateCourseValidator,
     validate,
     updateCourse,
);

router.delete(
     "/:courseId",
     protect,
     authorize("instructor", "admin"),
     idParam("courseId"),
     validate,
     deleteCourse,
);

router.patch(
     "/:courseId/publish",
     protect,
     authorize("instructor", "admin"),
     idParam("courseId"),
     publishValidator,
     validate,
     publishCourse,
);

export default router;
