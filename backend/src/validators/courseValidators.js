import { body, query } from "express-validator";

const levels = ["beginner", "intermediate", "advanced"];

// A list of short strings, e.g. learningObjectives
const stringList = (field) => [
     body(field)
          .optional()
          .isArray({ max: 20 })
          .withMessage(`${field} must be a list with at most 20 items`),
     body(`${field}.*`)
          .isString()
          .withMessage(`Each item in ${field} must be text`)
          .trim()
          .notEmpty()
          .withMessage(`Items in ${field} cannot be empty`)
          .isLength({ max: 200 })
          .withMessage(`Items in ${field} cannot exceed 200 characters`),
];

export const createCourseValidator = [
     body("title")
          .trim()
          .isLength({ min: 5, max: 100 })
          .withMessage("Title must be 5 to 100 characters"),

     body("shortDescription")
          .trim()
          .notEmpty()
          .withMessage("Short description is required")
          .isLength({ max: 200 })
          .withMessage("Short description cannot exceed 200 characters"),

     body("description")
          .trim()
          .notEmpty()
          .withMessage("Description is required")
          .isLength({ max: 5000 })
          .withMessage("Description cannot exceed 5000 characters"),

     body("categoryId")
          .isMongoId()
          .withMessage("A valid categoryId is required"),

     body("level")
          .optional()
          .isIn(levels)
          .withMessage("Level must be beginner, intermediate, or advanced"),

     body("thumbnail")
          .optional({ values: "falsy" })
          .isURL()
          .withMessage("Thumbnail must be a valid URL"),

     body("price")
          .optional()
          .isFloat({ min: 0 })
          .withMessage("Price must be 0 or more"),

     ...stringList("learningObjectives"),
     ...stringList("prerequisites"),
];

// Same fields, but every one is optional (used for editing)
export const updateCourseValidator = [
     body("title")
          .optional()
          .trim()
          .isLength({ min: 5, max: 100 })
          .withMessage("Title must be 5 to 100 characters"),

     body("shortDescription")
          .optional()
          .trim()
          .notEmpty()
          .withMessage("Short description cannot be empty")
          .isLength({ max: 200 })
          .withMessage("Short description cannot exceed 200 characters"),

     body("description")
          .optional()
          .trim()
          .notEmpty()
          .withMessage("Description cannot be empty")
          .isLength({ max: 5000 })
          .withMessage("Description cannot exceed 5000 characters"),

     body("categoryId")
          .optional()
          .isMongoId()
          .withMessage("categoryId must be a valid ID"),

     body("level")
          .optional()
          .isIn(levels)
          .withMessage("Level must be beginner, intermediate, or advanced"),

     body("thumbnail")
          .optional({ values: "falsy" })
          .isURL()
          .withMessage("Thumbnail must be a valid URL"),

     body("price")
          .optional()
          .isFloat({ min: 0 })
          .withMessage("Price must be 0 or more"),

     ...stringList("learningObjectives"),
     ...stringList("prerequisites"),
];

export const listCoursesValidator = [
     query("page")
          .optional()
          .isInt({ min: 1 })
          .withMessage("page must be a number 1 or more"),
     query("limit")
          .optional()
          .isInt({ min: 1, max: 50 })
          .withMessage("limit must be between 1 and 50"),
     query("search")
          .optional()
          .isString()
          .isLength({ max: 100 })
          .withMessage("search is too long"),
     query("category")
          .optional()
          .isMongoId()
          .withMessage("category must be a valid ID"),
     query("level").optional().isIn(levels).withMessage("Invalid level"),
     query("sort")
          .optional()
          .isIn(["newest", "oldest", "price_asc", "price_desc", "title"])
          .withMessage("Invalid sort option"),
];

export const publishValidator = [
     body("publish")
          .optional()
          .isBoolean()
          .withMessage("publish must be true or false")
          .toBoolean(),
];
