import Course from "../models/Course.js";
import Category from "../models/Category.js";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Quiz from "../models/Quiz.js";
import AppError from "../utils/AppError.js";
import pick from "../utils/pick.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { getCourseForManagement } from "../services/courseService.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Certificate from "../models/Certificate.js";
import Review from "../models/Review.js";

// The only fields a client is allowed to set
const EDITABLE_FIELDS = [
     "title",
     "shortDescription",
     "description",
     "categoryId",
     "level",
     "thumbnail",
     "price",
     "learningObjectives",
     "prerequisites",
];

const SORT_OPTIONS = {
     newest: { publishedAt: -1 },
     oldest: { publishedAt: 1 },
     price_asc: { price: 1 },
     price_desc: { price: -1 },
     title: { title: 1 },
     rating: { ratingAverage: -1, ratingCount: -1 },
};

const populateOptions = [
     { path: "instructorId", select: "name profileImage bio" },
     { path: "categoryId", select: "name slug" },
];

// POST /api/courses  (instructor)
export const createCourse = async (req, res) => {
     const data = pick(req.body, EDITABLE_FIELDS);

     const categoryExists = await Category.exists({ _id: data.categoryId });
     if (!categoryExists) {
          throw new AppError("Category not found", 404);
     }

     // instructorId comes from the logged-in user, status defaults to "draft"
     const course = await Course.create({
          ...data,
          instructorId: req.user._id,
     });

     res.status(201).json({
          success: true,
          message: "Course created as draft",
          data: { course },
     });
};

// GET /api/courses  (public: published courses only)
export const getCourses = async (req, res) => {
     const { page, limit, skip } = getPagination(req.query);
     const { search, category, level, sort } = req.query;

     const filter = { status: "published" };
     if (search) filter.$text = { $search: search };
     if (category) filter.categoryId = category;
     if (level) filter.level = level;

     const sortBy = { ...(SORT_OPTIONS[sort] || SORT_OPTIONS.newest), _id: 1 };

     const [courses, total] = await Promise.all([
          Course.find(filter)
               .select("-description")
               .populate(populateOptions)
               .sort(sortBy)
               .skip(skip)
               .limit(limit),
          Course.countDocuments(filter),
     ]);

     res.status(200).json({
          success: true,
          data: { courses },
          pagination: buildPaginationMeta(total, page, limit),
     });
};

// GET /api/courses/mine  (instructor: their own courses, including drafts)
export const getMyCourses = async (req, res) => {
     const { page, limit, skip } = getPagination(req.query);

     const filter = { instructorId: req.user._id };

     const [courses, total] = await Promise.all([
          Course.find(filter)
               .select("-description")
               .populate({ path: "categoryId", select: "name slug" })
               .sort({ updatedAt: -1 })
               .skip(skip)
               .limit(limit),
          Course.countDocuments(filter),
     ]);

     res.status(200).json({
          success: true,
          data: { courses },
          pagination: buildPaginationMeta(total, page, limit),
     });
};

// GET /api/courses/:courseId  (public if published; drafts only for owner/admin)
export const getCourse = async (req, res) => {
     const course = await Course.findById(req.params.courseId);

     const canSeeDraft =
          course &&
          req.user &&
          (req.user.role === "admin" ||
               course.instructorId.equals(req.user._id));

     // Return 404 (not 403) so we don't reveal that a draft exists
     if (!course || (course.status !== "published" && !canSeeDraft)) {
          throw new AppError("Course not found", 404);
     }

     await course.populate(populateOptions);

     res.status(200).json({
          success: true,
          data: { course },
     });
};

// PATCH /api/courses/:courseId  (owner or admin)
export const updateCourse = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);
     const updates = pick(req.body, EDITABLE_FIELDS);

     if (updates.categoryId) {
          const categoryExists = await Category.exists({
               _id: updates.categoryId,
          });
          if (!categoryExists) {
               throw new AppError("Category not found", 404);
          }
     }

     course.set(updates);
     await course.save();

     res.status(200).json({
          success: true,
          message: "Course updated",
          data: { course },
     });
};

// DELETE /api/courses/:courseId  (owner or admin)
export const deleteCourse = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);

     await Lesson.deleteMany({ courseId: course._id });
     await Section.deleteMany({ courseId: course._id });
     await Quiz.deleteMany({ courseId: course._id });
     await Enrollment.deleteMany({ courseId: course._id });
     await QuizAttempt.deleteMany({ courseId: course._id });
     await Certificate.deleteMany({ courseId: course._id });
     await Review.deleteMany({ courseId: course._id });
     // Later we will also delete this course's quizzes and enrollments
     await course.deleteOne();

     res.status(200).json({
          success: true,
          message: "Course deleted",
     });
};

// PATCH /api/courses/:courseId/publish  (owner or admin)
// Body: { "publish": true } publishes, { "publish": false } moves it back to draft
export const publishCourse = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);
     const publish = req.body?.publish ?? true;

     if (course.status === "archived" && req.user.role !== "admin") {
          throw new AppError(
               "Archived courses can only be changed by an admin",
               403,
          );
     }

     if (publish) {
          const lessonCount = await Lesson.countDocuments({
               courseId: course._id,
          });
          if (lessonCount === 0) {
               throw new AppError(
                    "Add at least one lesson before publishing",
                    400,
               );
          }
          course.status = "published";
          course.publishedAt = course.publishedAt || new Date();
     } else {
          course.status = "draft";
     }

     await course.save();

     res.status(200).json({
          success: true,
          message: publish ? "Course published" : "Course moved back to draft",
          data: { course },
     });
};
