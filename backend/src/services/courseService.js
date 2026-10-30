import Course from "../models/Course.js";
import AppError from "../utils/AppError.js";

// Finds a course and checks the user may manage it (owner or admin)
export const getCourseForManagement = async (courseId, user) => {
     const course = await Course.findById(courseId);

     if (!course) {
          throw new AppError("Course not found", 404);
     }

     const isOwner = course.instructorId.equals(user._id);
     if (!isOwner && user.role !== "admin") {
          throw new AppError("You can only manage your own courses", 403);
     }

     return course;
};

import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";

// Finds a section and checks the user owns its course (or is admin)
export const getSectionForManagement = async (sectionId, user) => {
     const section = await Section.findById(sectionId);
     if (!section) {
          throw new AppError("Section not found", 404);
     }
     const course = await getCourseForManagement(section.courseId, user);
     return { section, course };
};

// Finds a lesson and checks the user owns its course (or is admin)
export const getLessonForManagement = async (lessonId, user) => {
     const lesson = await Lesson.findById(lessonId);
     if (!lesson) {
          throw new AppError("Lesson not found", 404);
     }
     const course = await getCourseForManagement(lesson.courseId, user);
     return { lesson, course };
};
