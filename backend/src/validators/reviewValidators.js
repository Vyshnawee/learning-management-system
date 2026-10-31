import { body } from "express-validator";

export const createReviewValidator = [
     body("rating")
          .isInt({ min: 1, max: 5 })
          .withMessage("Rating must be a whole number from 1 to 5")
          .toInt(),
     body("comment")
          .optional()
          .trim()
          .isLength({ max: 1000 })
          .withMessage("Comment cannot exceed 1000 characters"),
];

export const updateReviewValidator = [
     body("rating")
          .optional()
          .isInt({ min: 1, max: 5 })
          .withMessage("Rating must be a whole number from 1 to 5")
          .toInt(),
     body("comment")
          .optional()
          .trim()
          .isLength({ max: 1000 })
          .withMessage("Comment cannot exceed 1000 characters"),
];
