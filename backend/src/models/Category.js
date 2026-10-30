import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

const categorySchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: [true, "Category name is required"],
               unique: true,
               trim: true,
               minlength: [2, "Category name must be at least 2 characters"],
               maxlength: [50, "Category name cannot exceed 50 characters"],
          },
          slug: {
               type: String,
               unique: true,
               lowercase: true,
          },
          description: {
               type: String,
               trim: true,
               maxlength: [300, "Description cannot exceed 300 characters"],
               default: "",
          },
     },
     { timestamps: true },
);

// Create the slug from the name before validation runs
categorySchema.pre("validate", function () {
     if (this.isModified("name")) {
          this.slug = slugify(this.name);
     }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
