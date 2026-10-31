import mongoose from "mongoose";
import Review from "../models/Review.js";
import Course from "../models/Course.js";

// Recomputes the course's average rating and review count from the real reviews
export const updateCourseRating = async (courseId) => {
     const [stats] = await Review.aggregate([
          { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
          {
               $group: {
                    _id: "$courseId",
                    average: { $avg: "$rating" },
                    count: { $sum: 1 },
               },
          },
     ]);

     await Course.updateOne(
          { _id: courseId },
          {
               ratingAverage: stats ? Math.round(stats.average * 10) / 10 : 0,
               ratingCount: stats ? stats.count : 0,
          },
     );
};
