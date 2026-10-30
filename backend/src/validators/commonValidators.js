import { param } from "express-validator";

// Checks that a URL parameter such as :courseId is a valid MongoDB ID
export const idParam = (name) =>
     param(name).isMongoId().withMessage(`${name} is not a valid ID`);
