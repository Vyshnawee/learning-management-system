import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
     questionText: {
          type: String,
          required: [true, "Question text is required"],
          trim: true,
          maxlength: [500, "Question cannot exceed 500 characters"],
     },
     questionType: {
          type: String,
          enum: ["multiple_choice"],
          default: "multiple_choice",
     },
     options: {
          type: [{ type: String, trim: true, maxlength: 200 }],
          validate: {
               validator: (value) => value.length >= 2 && value.length <= 6,
               message: "A question needs 2 to 6 options",
          },
     },
     // Position of the correct option in the options list (starting at 0)
     correctAnswer: {
          type: Number,
          required: [true, "Correct answer is required"],
          min: 0,
          validate: {
               validator: function (value) {
                    return (
                         Number.isInteger(value) && value < this.options.length
                    );
               },
               message: "correctAnswer must point to one of the options",
          },
     },
     points: {
          type: Number,
          min: [1, "Points must be at least 1"],
          default: 1,
     },
});

const quizSchema = new mongoose.Schema(
     {
          courseId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Course",
               required: true,
          },
          sectionId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Section",
               default: null,
          },
          title: {
               type: String,
               required: [true, "Quiz title is required"],
               trim: true,
               minlength: [2, "Quiz title must be at least 2 characters"],
               maxlength: [100, "Quiz title cannot exceed 100 characters"],
          },
          description: {
               type: String,
               trim: true,
               maxlength: [500, "Description cannot exceed 500 characters"],
               default: "",
          },
          // Percentage needed to pass
          passingScore: {
               type: Number,
               min: 0,
               max: 100,
               default: 60,
          },
          questions: {
               type: [questionSchema],
               validate: {
                    validator: (value) => value.length >= 1,
                    message: "A quiz needs at least one question",
               },
          },
          createdBy: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true,
          },
     },
     { timestamps: true },
);

quizSchema.index({ courseId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
