import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
     {
          courseId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Course",
               required: true,
          },
          title: {
               type: String,
               required: [true, "Section title is required"],
               trim: true,
               minlength: [2, "Section title must be at least 2 characters"],
               maxlength: [100, "Section title cannot exceed 100 characters"],
          },
          description: {
               type: String,
               trim: true,
               maxlength: [500, "Description cannot exceed 500 characters"],
               default: "",
          },
          order: {
               type: Number,
               required: true,
               min: 1,
          },
     },
     { timestamps: true },
);

// "All sections of a course, in order"
sectionSchema.index({ courseId: 1, order: 1 });

const Section = mongoose.model("Section", sectionSchema);

export default Section;
