import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";

// Recomputes progress from the real lessons in the database and saves it
export const recalculateProgress = async (enrollmentId) => {
     const enrollment = await Enrollment.findById(enrollmentId);

     const [totalLessons, completedCount] = await Promise.all([
          Lesson.countDocuments({ courseId: enrollment.courseId }),
          // Counting through the Lesson collection ignores IDs of lessons that were deleted
          Lesson.countDocuments({
               courseId: enrollment.courseId,
               _id: { $in: enrollment.completedLessonIds },
          }),
     ]);

     const isComplete = totalLessons > 0 && completedCount === totalLessons;

     // floor, not round: 199 of 200 lessons must not show as 100%
     enrollment.progressPercentage =
          totalLessons === 0
               ? 0
               : Math.floor((completedCount / totalLessons) * 100);

     if (isComplete && !enrollment.completedAt) {
          enrollment.completedAt = new Date();
     } else if (!isComplete) {
          enrollment.completedAt = null;
     }

     await enrollment.save();
     return enrollment;
};
