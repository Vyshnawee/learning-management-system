import Course from "../models/Course.js";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";
import AppError from "../utils/AppError.js";
import pick from "../utils/pick.js";
import {
     getCourseForManagement,
     getSectionForManagement,
     getLessonForManagement,
} from "../services/courseService.js";
import assertSameIds from "../utils/assertSameIds.js";

const SECTION_FIELDS = ["title", "description"];
const LESSON_FIELDS = [
     "title",
     "description",
     "videoUrl",
     "duration",
     "isPreview",
     "resources",
];

// POST /api/courses/:courseId/sections
export const createSection = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);

     // New section goes to the end
     const last = await Section.findOne({ courseId: course._id }).sort({
          order: -1,
     });
     const order = last ? last.order + 1 : 1;

     const section = await Section.create({
          ...pick(req.body, SECTION_FIELDS),
          courseId: course._id,
          order,
     });

     res.status(201).json({
          success: true,
          message: "Section created",
          data: { section },
     });
};

// GET /api/courses/:courseId/sections  (curriculum: sections with their lessons)
export const getCurriculum = async (req, res) => {
     const course = await Course.findById(req.params.courseId);

     const isManager =
          course &&
          req.user &&
          (req.user.role === "admin" ||
               course.instructorId.equals(req.user._id));

     if (!course || (course.status !== "published" && !isManager)) {
          throw new AppError("Course not found", 404);
     }

     const [sections, lessons] = await Promise.all([
          Section.find({ courseId: course._id }).sort({ order: 1 }).lean(),
          Lesson.find({ courseId: course._id }).sort({ order: 1 }).lean(),
     ]);

     // Video links are only shown to the owner/admin, and for preview lessons.
     // In Phase 4 we will also show them to enrolled students.
     const curriculum = sections.map((section) => {
          const sectionLessons = lessons
               .filter((lesson) => lesson.sectionId.equals(section._id))
               .map((lesson) => {
                    if (!isManager && !lesson.isPreview) {
                         const { videoUrl, resources, ...safeLesson } = lesson;
                         return safeLesson;
                    }
                    return lesson;
               });
          return { ...section, lessons: sectionLessons };
     });

     res.status(200).json({
          success: true,
          data: {
               sections: curriculum,
               totalLessons: lessons.length,
               totalDuration: lessons.reduce(
                    (sum, lesson) => sum + lesson.duration,
                    0,
               ),
          },
     });
};

// PATCH /api/sections/:sectionId
export const updateSection = async (req, res) => {
     const { section } = await getSectionForManagement(
          req.params.sectionId,
          req.user,
     );

     section.set(pick(req.body, SECTION_FIELDS));
     await section.save();

     res.status(200).json({
          success: true,
          message: "Section updated",
          data: { section },
     });
};

// DELETE /api/sections/:sectionId  (also deletes its lessons)
export const deleteSection = async (req, res) => {
     const { section } = await getSectionForManagement(
          req.params.sectionId,
          req.user,
     );

     await Lesson.deleteMany({ sectionId: section._id });
     await section.deleteOne();

     res.status(200).json({
          success: true,
          message: "Section and its lessons deleted",
     });
};

// POST /api/sections/:sectionId/lessons
export const createLesson = async (req, res) => {
     const { section } = await getSectionForManagement(
          req.params.sectionId,
          req.user,
     );

     const last = await Lesson.findOne({ sectionId: section._id }).sort({
          order: -1,
     });
     const order = last ? last.order + 1 : 1;

     // courseId comes from the section, never from the request
     const lesson = await Lesson.create({
          ...pick(req.body, LESSON_FIELDS),
          courseId: section.courseId,
          sectionId: section._id,
          order,
     });

     res.status(201).json({
          success: true,
          message: "Lesson created",
          data: { lesson },
     });
};

// PATCH /api/lessons/:lessonId
export const updateLesson = async (req, res) => {
     const { lesson } = await getLessonForManagement(
          req.params.lessonId,
          req.user,
     );

     lesson.set(pick(req.body, LESSON_FIELDS));
     await lesson.save();

     res.status(200).json({
          success: true,
          message: "Lesson updated",
          data: { lesson },
     });
};

// DELETE /api/lessons/:lessonId
export const deleteLesson = async (req, res) => {
     const { lesson } = await getLessonForManagement(
          req.params.lessonId,
          req.user,
     );

     await lesson.deleteOne();

     res.status(200).json({
          success: true,
          message: "Lesson deleted",
     });
};

// PATCH /api/courses/:courseId/sections/reorder
export const reorderSections = async (req, res) => {
     const course = await getCourseForManagement(req.params.courseId, req.user);
     const { sectionIds } = req.body;

     const sections = await Section.find({ courseId: course._id }).select(
          "_id",
     );
     assertSameIds(
          sectionIds,
          sections.map((s) => s._id),
          "sectionIds",
     );

     await Section.bulkWrite(
          sectionIds.map((id, index) => ({
               updateOne: {
                    filter: { _id: id, courseId: course._id },
                    update: { $set: { order: index + 1 } },
               },
          })),
     );

     const updated = await Section.find({ courseId: course._id }).sort({
          order: 1,
     });

     res.status(200).json({
          success: true,
          message: "Sections reordered",
          data: { sections: updated },
     });
};

// PATCH /api/sections/:sectionId/lessons/reorder
export const reorderLessons = async (req, res) => {
     const { section } = await getSectionForManagement(
          req.params.sectionId,
          req.user,
     );
     const { lessonIds } = req.body;

     const lessons = await Lesson.find({ sectionId: section._id }).select(
          "_id",
     );
     assertSameIds(
          lessonIds,
          lessons.map((l) => l._id),
          "lessonIds",
     );

     await Lesson.bulkWrite(
          lessonIds.map((id, index) => ({
               updateOne: {
                    filter: { _id: id, sectionId: section._id },
                    update: { $set: { order: index + 1 } },
               },
          })),
     );

     const updated = await Lesson.find({ sectionId: section._id }).sort({
          order: 1,
     });

     res.status(200).json({
          success: true,
          message: "Lessons reordered",
          data: { lessons: updated },
     });
};
