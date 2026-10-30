import { body } from "express-validator";

export const createSectionValidator = [
     body("title")
          .trim()
          .isLength({ min: 2, max: 100 })
          .withMessage("Section title must be 2 to 100 characters"),
     body("description")
          .optional()
          .trim()
          .isLength({ max: 500 })
          .withMessage("Description cannot exceed 500 characters"),
];

export const updateSectionValidator = [
     body("title")
          .optional()
          .trim()
          .isLength({ min: 2, max: 100 })
          .withMessage("Section title must be 2 to 100 characters"),
     body("description")
          .optional()
          .trim()
          .isLength({ max: 500 })
          .withMessage("Description cannot exceed 500 characters"),
];

const resourceRules = [
     body("resources")
          .optional()
          .isArray({ max: 10 })
          .withMessage("resources must be a list with at most 10 items"),
     body("resources.*.title")
          .trim()
          .notEmpty()
          .withMessage("Each resource needs a title")
          .isLength({ max: 100 })
          .withMessage("Resource title cannot exceed 100 characters"),
     body("resources.*.url")
          .isURL()
          .withMessage("Each resource needs a valid URL"),
];

export const createLessonValidator = [
     body("title")
          .trim()
          .isLength({ min: 2, max: 100 })
          .withMessage("Lesson title must be 2 to 100 characters"),
     body("description")
          .optional()
          .trim()
          .isLength({ max: 1000 })
          .withMessage("Description cannot exceed 1000 characters"),
     body("videoUrl")
          .trim()
          .isURL()
          .withMessage("A valid video URL is required"),
     body("duration")
          .optional()
          .isInt({ min: 0 })
          .withMessage("Duration must be a whole number of minutes, 0 or more"),
     body("isPreview")
          .optional()
          .isBoolean()
          .withMessage("isPreview must be true or false")
          .toBoolean(),
     ...resourceRules,
];

export const updateLessonValidator = [
     body("title")
          .optional()
          .trim()
          .isLength({ min: 2, max: 100 })
          .withMessage("Lesson title must be 2 to 100 characters"),
     body("description")
          .optional()
          .trim()
          .isLength({ max: 1000 })
          .withMessage("Description cannot exceed 1000 characters"),
     body("videoUrl")
          .optional()
          .trim()
          .isURL()
          .withMessage("Video URL must be valid"),
     body("duration")
          .optional()
          .isInt({ min: 0 })
          .withMessage("Duration must be a whole number of minutes, 0 or more"),
     body("isPreview")
          .optional()
          .isBoolean()
          .withMessage("isPreview must be true or false")
          .toBoolean(),
     ...resourceRules,
];

export const reorderSectionsValidator = [
     body("sectionIds")
          .isArray({ min: 1, max: 200 })
          .withMessage("sectionIds must be a non-empty list"),
     body("sectionIds.*")
          .isMongoId()
          .withMessage("Every item in sectionIds must be a valid ID"),
];

export const reorderLessonsValidator = [
     body("lessonIds")
          .isArray({ min: 1, max: 200 })
          .withMessage("lessonIds must be a non-empty list"),
     body("lessonIds.*")
          .isMongoId()
          .withMessage("Every item in lessonIds must be a valid ID"),
];
