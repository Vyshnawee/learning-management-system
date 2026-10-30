import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
     {
          courseId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Course",
               required: true,
          },
          sectionId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Section",
               required: true,
          },
          title: {
               type: String,
               required: [true, "Lesson title is required"],
               trim: true,
               minlength: [2, "Lesson title must be at least 2 characters"],
               maxlength: [100, "Lesson title cannot exceed 100 characters"],
          },
          description: {
               type: String,
               trim: true,
               maxlength: [1000, "Description cannot exceed 1000 characters"],
               default: "",
          },
          videoUrl: {
               type: String,
               required: [true, "Video URL is required"],
               trim: true,
          },
          // Duration in minutes
          duration: {
               type: Number,
               min: [0, "Duration cannot be negative"],
               default: 0,
          },
          order: {
               type: Number,
               required: true,
               min: 1,
          },
          isPreview: {
               type: Boolean,
               default: false,
          },
          resources: {
               type: [
                    {
                         title: {
                              type: String,
                              required: true,
                              trim: true,
                              maxlength: 100,
                         },
                         url: { type: String, required: true, trim: true },
                         _id: false,
                    },
               ],
               default: [],
          },
     },
     { timestamps: true },
);

lessonSchema.index({ sectionId: 1, order: 1 });
lessonSchema.index({ courseId: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
