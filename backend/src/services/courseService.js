import Course from "../models/Course.js";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import AppError from "../utils/AppError.js";
import Quiz from "../models/Quiz.js";

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

// True if the user is the course owner or an admin
export const isCourseManager = (course, user) =>
     !!user && (user.role === "admin" || course.instructorId.equals(user._id));

// True if the user may see full lesson content (video links, resources):
// the owner, an admin, or a student enrolled in this course
export const canAccessLessonContent = async (course, user) => {
     if (!user) return false;
     if (isCourseManager(course, user)) return true;
     if (user.role !== "student") return false;

     const enrollment = await Enrollment.exists({
          studentId: user._id,
          courseId: course._id,
     });
     return !!enrollment;
};

// Finds a quiz and checks the user owns its course (or is admin)
export const getQuizForManagement = async (quizId, user) => {
     const quiz = await Quiz.findById(quizId);
     if (!quiz) {
          throw new AppError("Quiz not found", 404);
     }
     const course = await getCourseForManagement(quiz.courseId, user);
     return { quiz, course };
};
