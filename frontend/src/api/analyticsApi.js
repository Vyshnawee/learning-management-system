import axiosClient from "./axiosClient.js";

export const getCourseAnalytics = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}/analytics`, { signal });
