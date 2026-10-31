import express from "express";
import {
     createQuiz,
     getCourseQuizzes,
     getQuiz,
     updateQuiz,
     deleteQuiz,
     attemptQuiz,
     getMyQuizResults,
} from "../controllers/quizController.js";
import {
     createQuizValidator,
     updateQuizValidator,
     attemptValidator,
} from "../validators/quizValidators.js";
import { idParam } from "../validators/commonValidators.js";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
     "/courses/:courseId/quizzes",
     protect,
     authorize("instructor", "admin"),
     idParam("courseId"),
     createQuizValidator,
     validate,
     createQuiz,
);

router.get(
     "/courses/:courseId/quizzes",
     protect,
     idParam("courseId"),
     validate,
     getCourseQuizzes,
);

router.get("/quizzes/:quizId", protect, idParam("quizId"), validate, getQuiz);

router.patch(
     "/quizzes/:quizId",
     protect,
     authorize("instructor", "admin"),
     idParam("quizId"),
     updateQuizValidator,
     validate,
     updateQuiz,
);

router.delete(
     "/quizzes/:quizId",
     protect,
     authorize("instructor", "admin"),
     idParam("quizId"),
     validate,
     deleteQuiz,
);

router.post(
     "/quizzes/:quizId/attempts",
     protect,
     authorize("student"),
     idParam("quizId"),
     attemptValidator,
     validate,
     attemptQuiz,
);

router.get(
     "/quizzes/:quizId/attempts/my-results",
     protect,
     authorize("student"),
     idParam("quizId"),
     validate,
     getMyQuizResults,
);

export default router;
