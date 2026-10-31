import { body } from "express-validator";

// isUpdate = true makes every top-level field optional
const buildQuizRules = (isUpdate) => {
     const field = (name) => (isUpdate ? body(name).optional() : body(name));

     return [
          field("title")
               .trim()
               .isLength({ min: 2, max: 100 })
               .withMessage("Quiz title must be 2 to 100 characters"),

          body("description")
               .optional()
               .trim()
               .isLength({ max: 500 })
               .withMessage("Description cannot exceed 500 characters"),

          body("passingScore")
               .optional()
               .isInt({ min: 0, max: 100 })
               .withMessage(
                    "passingScore must be a whole number from 0 to 100",
               ),

          body("sectionId")
               .optional()
               .isMongoId()
               .withMessage("sectionId must be a valid ID"),

          field("questions")
               .isArray({ min: 1, max: 50 })
               .withMessage("questions must be a list of 1 to 50 questions"),

          body("questions.*.questionText")
               .trim()
               .notEmpty()
               .withMessage("Each question needs text")
               .isLength({ max: 500 })
               .withMessage("Question text cannot exceed 500 characters"),

          body("questions.*.options")
               .isArray({ min: 2, max: 6 })
               .withMessage("Each question needs 2 to 6 options"),

          body("questions.*.options.*")
               .isString()
               .withMessage("Each option must be text")
               .trim()
               .notEmpty()
               .withMessage("Options cannot be empty")
               .isLength({ max: 200 })
               .withMessage("An option cannot exceed 200 characters"),

          body("questions.*.points")
               .optional()
               .isInt({ min: 1, max: 100 })
               .withMessage("points must be a whole number from 1 to 100"),

          // correctAnswer must be a valid position inside that question's options
          body("questions").custom((questions) => {
               if (!Array.isArray(questions)) return true; // the isArray rule reports this
               questions.forEach((q, i) => {
                    const optionCount = Array.isArray(q?.options)
                         ? q.options.length
                         : 0;
                    if (
                         !Number.isInteger(q?.correctAnswer) ||
                         q.correctAnswer < 0 ||
                         q.correctAnswer >= optionCount
                    ) {
                         throw new Error(
                              `Question ${i + 1}: correctAnswer must be the position of one of its options`,
                         );
                    }
               });
               return true;
          }),
     ];
};

export const attemptValidator = [
     body("answers")
          .isArray({ min: 1, max: 50 })
          .withMessage("answers must be a list of 1 to 50 items"),
     body("answers.*.questionId")
          .isMongoId()
          .withMessage("Each answer needs a valid questionId"),
     body("answers.*.selectedOption")
          .isInt({ min: 0, max: 5 })
          .withMessage("selectedOption must be a whole number from 0 to 5")
          .toInt(),
];

export const createQuizValidator = buildQuizRules(false);
export const updateQuizValidator = buildQuizRules(true);
