import mongoose from "mongoose";
import crypto from "crypto";
import slugify from "../utils/slugify.js";

const courseSchema = new mongoose.Schema(
     {
          title: {
               type: String,
               required: [true, "Course title is required"],
               trim: true,
               minlength: [5, "Title must be at least 5 characters"],
               maxlength: [100, "Title cannot exceed 100 characters"],
          },
          slug: {
               type: String,
               unique: true,
               lowercase: true,
          },
          description: {
               type: String,
               required: [true, "Description is required"],
               trim: true,
               maxlength: [5000, "Description cannot exceed 5000 characters"],
          },
          shortDescription: {
               type: String,
               required: [true, "Short description is required"],
               trim: true,
               maxlength: [
                    200,
                    "Short description cannot exceed 200 characters",
               ],
          },
          instructorId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true,
          },
          categoryId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Category",
               required: [true, "Category is required"],
          },
          thumbnail: {
               type: String,
               default: "",
          },
          level: {
               type: String,
               enum: {
                    values: ["beginner", "intermediate", "advanced"],
                    message: "Level must be beginner, intermediate, or advanced",
               },
               default: "beginner",
          },
          learningObjectives: {
               type: [String],
               default: [],
          },
          prerequisites: {
               type: [String],
               default: [],
          },
          price: {
               type: Number,
               min: [0, "Price cannot be negative"],
               default: 0,
          },
          status: {
               type: String,
               enum: ["draft", "published", "archived"],
               default: "draft",
          },
          publishedAt: {
               type: Date,
          },
          ratingAverage: {
               type: Number,
               min: 0,
               max: 5,
               default: 0,
          },
          ratingCount: {
               type: Number,
               min: 0,
               default: 0,
          },
     },
     { timestamps: true },
);

courseSchema.index({ status: 1, ratingAverage: -1 });
// Create a unique slug from the title when the course is first created
courseSchema.pre("validate", function () {
     if (this.isNew && this.title) {
          const suffix = crypto.randomBytes(3).toString("hex");
          this.slug = `${slugify(this.title)}-${suffix}`;
     }
});

// Indexes for the queries we will run most often
courseSchema.index({
     title: "text",
     shortDescription: "text",
     description: "text",
});
courseSchema.index({ instructorId: 1 });
courseSchema.index({ status: 1, categoryId: 1 });
courseSchema.index({ status: 1, createdAt: -1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;
