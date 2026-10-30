import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const { default: connectDB } = await import("../config/db.js");
const { default: Category } = await import("../models/Category.js");

const categories = [
     {
          name: "Web Development",
          description: "HTML, CSS, JavaScript, React, Node.js and more",
     },
     {
          name: "Data Science",
          description: "Python, statistics, machine learning and analytics",
     },
     {
          name: "Mobile Development",
          description: "Android, iOS and cross-platform apps",
     },
     { name: "Databases", description: "SQL, MongoDB and database design" },
     {
          name: "Programming Fundamentals",
          description: "Core programming, DSA and problem solving",
     },
     {
          name: "DevOps and Cloud",
          description: "Git, Docker, CI/CD and cloud platforms",
     },
];

const seedCategories = async () => {
     await connectDB();

     for (const item of categories) {
          const exists = await Category.findOne({ name: item.name });
          if (exists) {
               console.log(`Skipped (already exists): ${item.name}`);
          } else {
               await Category.create(item);
               console.log(`Created: ${item.name}`);
          }
     }

     await mongoose.disconnect();
};

seedCategories().catch((error) => {
     console.error("Seeding failed:", error.message);
     process.exit(1);
});
