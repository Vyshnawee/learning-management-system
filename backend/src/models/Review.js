import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
     {
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
          rating: {
               type: Number,
               required: [true, "Rating is required"],
               min: [1, "Rating must be at least 1"],
               max: [5, "Rating cannot exceed 5"],
               validate: {
                    validator: Number.isInteger,
                    message: "Rating must be a whole number",
               },
          },
          comment: {
               type: String,
               trim: true,
               maxlength: [1000, "Comment cannot exceed 1000 characters"],
               default: "",
          },
     },
     { timestamps: true },
);

// One review per student per course
reviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });
reviewSchema.index({ courseId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
