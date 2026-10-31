import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
     {
          studentId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true,
          },
          courseId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Course",
               required: true,
          },
          enrolledAt: {
               type: Date,
               default: Date.now,
          },
          completedLessonIds: [
               {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Lesson",
               },
          ],
          lastAccessedLessonId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Lesson",
               default: null,
          },
          progressPercentage: {
               type: Number,
               min: 0,
               max: 100,
               default: 0,
          },
          completedAt: {
               type: Date,
               default: null,
          },
     },
     { timestamps: true },
);

// One student can enroll in a course only once
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
// "All students of this course"
enrollmentSchema.index({ courseId: 1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
