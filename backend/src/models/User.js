import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: [true, "Name is required"],
               trim: true,
               minlength: [2, "Name must be at least 2 characters"],
               maxlength: [50, "Name cannot exceed 50 characters"],
          },
          email: {
               type: String,
               required: [true, "Email is required"],
               unique: true,
               lowercase: true,
               trim: true,
               match: [
                    /^\S+@\S+\.\S+$/,
                    "Please provide a valid email address",
               ],
          },
          passwordHash: {
               type: String,
               required: [true, "Password hash is required"],
               select: false,
          },
          role: {
               type: String,
               enum: {
                    values: ["student", "instructor", "admin"],
                    message: "Role must be student, instructor, or admin",
               },
               default: "student",
          },
          profileImage: {
               type: String,
               default: "",
          },
          bio: {
               type: String,
               trim: true,
               maxlength: [500, "Bio cannot exceed 500 characters"],
               default: "",
          },
          isActive: {
               type: Boolean,
               default: true,
          },
     },
     { timestamps: true },
);

// Compare a plain-text password with the stored hash
userSchema.methods.comparePassword = function (plainPassword) {
     return bcrypt.compare(plainPassword, this.passwordHash);
};

// Never include passwordHash when a user is converted to JSON
userSchema.set("toJSON", {
     transform: (doc, ret) => {
          delete ret.passwordHash;
          delete ret.__v;
          return ret;
     },
});

const User = mongoose.model("User", userSchema);

export default User;
