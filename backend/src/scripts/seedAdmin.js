import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

const { default: connectDB } = await import("../config/db.js");
const { default: User } = await import("../models/User.js");

const seedAdmin = async () => {
     const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

     if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
          throw new Error(
               "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env",
          );
     }

     await connectDB();

     const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
     if (existing) {
          console.log("Admin already exists. Nothing to do.");
     } else {
          const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
          await User.create({
               name: ADMIN_NAME,
               email: ADMIN_EMAIL,
               passwordHash,
               role: "admin",
          });
          console.log(`Admin created: ${ADMIN_EMAIL}`);
     }

     await mongoose.disconnect();
};

seedAdmin().catch((error) => {
     console.error("Seeding failed:", error.message);
     process.exit(1);
});
