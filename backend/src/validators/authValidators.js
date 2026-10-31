import { body } from "express-validator";

export const registerValidator = [
     body("name")
          .trim()
          .notEmpty()
          .withMessage("Name is required")
          .isLength({ min: 2, max: 50 })
          .withMessage("Name must be 2 to 50 characters"),

     body("email")
          .trim()
          .toLowerCase()
          .isEmail()
          .withMessage("Please provide a valid email address"),

     body("password")
          .isLength({ min: 8 })
          .withMessage("Password must be at least 8 characters")
          .matches(/[A-Za-z]/)
          .withMessage("Password must contain a letter")
          .matches(/[0-9]/)
          .withMessage("Password must contain a number"),

     body("role")
          .optional()
          .isIn(["student", "instructor"])
          .withMessage("Role must be student or instructor"),
];

export const loginValidator = [
     body("email")
          .trim()
          .toLowerCase()
          .isEmail()
          .withMessage("Please provide a valid email address"),

     body("password").notEmpty().withMessage("Password is required"),
];

export const changePasswordValidator = [
     body("currentPassword")
          .notEmpty()
          .withMessage("Current password is required"),

     body("newPassword")
          .isLength({ min: 8 })
          .withMessage("New password must be at least 8 characters")
          .matches(/[A-Za-z]/)
          .withMessage("New password must contain a letter")
          .matches(/[0-9]/)
          .withMessage("New password must contain a number")
          .custom((value, { req }) => value !== req.body.currentPassword)
          .withMessage(
               "New password must be different from the current password",
          ),
];

export const updateProfileValidator = [
     body("name")
          .optional()
          .trim()
          .isLength({ min: 2, max: 50 })
          .withMessage("Name must be 2 to 50 characters"),
     body("bio")
          .optional()
          .trim()
          .isLength({ max: 500 })
          .withMessage("Bio cannot exceed 500 characters"),
     body("profileImage")
          .optional({ values: "falsy" })
          .isURL()
          .withMessage("Profile image must be a valid URL"),
];
