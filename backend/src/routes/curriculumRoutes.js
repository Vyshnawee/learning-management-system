import express from "express";
import {
     createSection,
     getCurriculum,
     updateSection,
     deleteSection,
     createLesson,
     updateLesson,
     deleteLesson,
     reorderSections,
     reorderLessons,
     getLesson,
} from "../controllers/curriculumController.js";
import {
     createSectionValidator,
     updateSectionValidator,
     createLessonValidator,
     updateLessonValidator,
     reorderSectionsValidator,
     reorderLessonsValidator,
} from "../validators/curriculumValidators.js";
import { idParam } from "../validators/commonValidators.js";
import validate from "../middleware/validate.js";
import {
     protect,
     authorize,
     optionalAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();
const manager = [protect, authorize("instructor", "admin")];

// Sections
router.post(
     "/courses/:courseId/sections",
     ...manager,
     idParam("courseId"),
     createSectionValidator,
     validate,
     createSection,
);
router.get(
     "/courses/:courseId/sections",
     idParam("courseId"),
     validate,
     optionalAuth,
     getCurriculum,
);
router.patch(
     "/sections/:sectionId",
     ...manager,
     idParam("sectionId"),
     updateSectionValidator,
     validate,
     updateSection,
);
router.delete(
     "/sections/:sectionId",
     ...manager,
     idParam("sectionId"),
     validate,
     deleteSection,
);

// Lessons
router.post(
     "/sections/:sectionId/lessons",
     ...manager,
     idParam("sectionId"),
     createLessonValidator,
     validate,
     createLesson,
);
router.patch(
     "/lessons/:lessonId",
     ...manager,
     idParam("lessonId"),
     updateLessonValidator,
     validate,
     updateLesson,
);
router.delete(
     "/lessons/:lessonId",
     ...manager,
     idParam("lessonId"),
     validate,
     deleteLesson,
);

// Reordering
router.patch(
     "/courses/:courseId/sections/reorder",
     ...manager,
     idParam("courseId"),
     reorderSectionsValidator,
     validate,
     reorderSections,
);
router.patch(
     "/sections/:sectionId/lessons/reorder",
     ...manager,
     idParam("sectionId"),
     reorderLessonsValidator,
     validate,
     reorderLessons,
);

router.get(
     "/lessons/:lessonId",
     idParam("lessonId"),
     validate,
     optionalAuth,
     getLesson,
);

export default router;
