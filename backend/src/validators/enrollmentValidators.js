import { body } from "express-validator";

export const progressValidator = [
     body("lessonId").isMongoId().withMessage("A valid lessonId is required"),
     body("completed")
          .optional()
          .isBoolean()
          .withMessage("completed must be true or false")
          .toBoolean(),
];
