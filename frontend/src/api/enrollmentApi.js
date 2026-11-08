import axiosClient from "./axiosClient.js";

export const enrollInCourse = (courseId) =>
     axiosClient.post(`/courses/${courseId}/enroll`);

export const getMyEnrollments = (params, signal) =>
     axiosClient.get("/enrollments/my-courses", { params, signal });

export const getEnrollment = (enrollmentId, signal) =>
     axiosClient.get(`/enrollments/${enrollmentId}`, { signal });

export const updateProgress = (enrollmentId, data) =>
     axiosClient.patch(`/enrollments/${enrollmentId}/progress`, data);

export const setLastLesson = (enrollmentId, lessonId) =>
     axiosClient.patch(`/enrollments/${enrollmentId}/last-lesson`, {
          lessonId,
     });

export const getCourseEnrollments = (courseId, params, signal) =>
     axiosClient.get(`/courses/${courseId}/enrollments`, { params, signal });
