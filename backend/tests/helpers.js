import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Set BEFORE the app is imported, because app.js reads CLIENT_URL when it loads.
// We do not load .env here, so tests can never use your real database.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_that_is_at_least_32_characters_long";
process.env.JWT_EXPIRES_IN = "1d";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/lms_test";

const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/User.js");
const { default: Category } = await import("../src/models/Category.js");
const { default: Course } = await import("../src/models/Course.js");
const { default: Section } = await import("../src/models/Section.js");
const { default: Lesson } = await import("../src/models/Lesson.js");
const { default: generateToken } =
     await import("../src/utils/generateToken.js");

let counter = 0;

export const api = () => request(app);

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const clearDb = async () => {
     for (const model of Object.values(mongoose.models)) {
          await model.deleteMany({});
     }
};

export const setupDb = async () => {
     const uri = process.env.MONGODB_URI;
     if (!uri.endsWith("_test")) {
          throw new Error(
               "Refusing to run tests on a database whose name does not end in _test",
          );
     }
     await mongoose.connect(uri);
     // Make sure unique indexes exist in the fresh test database
     await Promise.all(
          Object.values(mongoose.models).map((model) => model.syncIndexes()),
     );
     await clearDb();
};

export const teardownDb = async () => {
     await clearDb();
     await mongoose.disconnect();
};

// Creates a user directly in the database (needed for instructors and admins)
export const createUser = async (role = "student", overrides = {}) => {
     const n = ++counter;
     const user = await User.create({
          name: `${role} ${n}`,
          email: `${role}${n}@test.com`,
          passwordHash: await bcrypt.hash("password123", 4),
          role,
          ...overrides,
     });
     return { user, token: generateToken(user._id), password: "password123" };
};

// Creates a course with sections and lessons directly in the database.
// Lesson 1 is a preview lesson.
export const createPublishedCourse = async (
     instructor,
     { lessons = 3, price = 0, status = "published" } = {},
) => {
     const n = ++counter;
     const category = await Category.create({ name: `Category ${n}` });
     const course = await Course.create({
          title: `Test Course ${n}`,
          description: "A course used in tests.",
          shortDescription: "Test course",
          instructorId: instructor.user._id,
          categoryId: category._id,
          price,
          status,
          publishedAt: status === "published" ? new Date() : undefined,
     });
     const section = await Section.create({
          courseId: course._id,
          title: "Section 1",
          order: 1,
     });

     const lessonDocs = [];
     for (let i = 1; i <= lessons; i++) {
          lessonDocs.push(
               await Lesson.create({
                    courseId: course._id,
                    sectionId: section._id,
                    title: `Lesson ${i}`,
                    videoUrl: `https://example.com/video${i}`,
                    duration: 5,
                    order: i,
                    isPreview: i === 1,
               }),
          );
     }
     return { course, section, lessons: lessonDocs, category };
};
