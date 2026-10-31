import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
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
          certificateId: { type: String, required: true, unique: true },
          issuedAt: { type: Date, default: Date.now },
     },
     { timestamps: true },
);

// One certificate per student per course
certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
