import { body, query } from "express-validator";

export const listUsersValidator = [
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
     query("role")
          .optional()
          .isIn(["student", "instructor", "admin"])
          .withMessage("role must be student, instructor, or admin"),
     query("status")
          .optional()
          .isIn(["active", "suspended"])
          .withMessage("status must be active or suspended"),
];

export const userStatusValidator = [
     body("isActive")
          .exists()
          .withMessage("isActive is required")
          .isBoolean()
          .withMessage("isActive must be true or false")
          .toBoolean(),
];

export const listAdminCoursesValidator = [
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
     query("status")
          .optional()
          .isIn(["draft", "published", "archived"])
          .withMessage("status must be draft, published, or archived"),
     query("category")
          .optional()
          .isMongoId()
          .withMessage("category must be a valid ID"),
];

export const courseStatusValidator = [
     body("status")
          .isIn(["draft", "published", "archived"])
          .withMessage("status must be draft, published, or archived"),
];

export const categoryValidator = [
     body("name")
          .trim()
          .isLength({ min: 2, max: 50 })
          .withMessage("Category name must be 2 to 50 characters"),
     body("description")
          .optional()
          .trim()
          .isLength({ max: 300 })
          .withMessage("Description cannot exceed 300 characters"),
];

export const updateCategoryValidator = [
     body("name")
          .optional()
          .trim()
          .isLength({ min: 2, max: 50 })
          .withMessage("Category name must be 2 to 50 characters"),
     body("description")
          .optional()
          .trim()
          .isLength({ max: 300 })
          .withMessage("Description cannot exceed 300 characters"),
];
