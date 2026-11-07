import axiosClient from "./axiosClient.js";

export const getCourseReviews = (courseId, params, signal) =>
     axiosClient.get(`/courses/${courseId}/reviews`, { params, signal });
