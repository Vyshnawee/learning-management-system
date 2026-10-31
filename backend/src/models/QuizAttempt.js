import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
     {
          quizId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Quiz",
               required: true,
          },
          // Copied from the quiz so we can ask "has this student passed every quiz of this course?"
          courseId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Course",
               required: true,
          },
          studentId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true,
          },
          answers: [
               {
                    questionId: {
                         type: mongoose.Schema.Types.ObjectId,
                         required: true,
                    },
                    selectedOption: { type: Number, required: true, min: 0 },
                    _id: false,
               },
          ],
          score: { type: Number, required: true, min: 0 },
          totalPoints: { type: Number, required: true, min: 1 },
          percentage: { type: Number, required: true, min: 0, max: 100 },
          passed: { type: Boolean, required: true },
          attemptedAt: { type: Date, default: Date.now },
     },
     { timestamps: true },
);

quizAttemptSchema.index({ quizId: 1, studentId: 1, attemptedAt: -1 });
quizAttemptSchema.index({ courseId: 1, studentId: 1, passed: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
