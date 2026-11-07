import axiosClient from "./axiosClient.js";

export const enrollInCourse = (courseId) =>
     axiosClient.post(`/courses/${courseId}/enroll`);

export const getMyEnrollments = (params, signal) =>
     axiosClient.get("/enrollments/my-courses", { params, signal });
