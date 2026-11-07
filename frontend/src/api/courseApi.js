import axiosClient from "./axiosClient.js";

// params: { page, limit, search, category, level, sort }
export const getCourses = (params, signal) =>
     axiosClient.get("/courses", { params, signal });

export const getCategories = () => axiosClient.get("/categories");

export const getCourse = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}`, { signal });

export const getCurriculum = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}/sections`, { signal });

// publish = true makes the course public, false moves it back to draft
export const publishCourse = (courseId, publish) =>
     axiosClient.patch(`/courses/${courseId}/publish`, { publish });

export const deleteCourse = (courseId) =>
     axiosClient.delete(`/courses/${courseId}`);

// data: { title, shortDescription, description, categoryId, level, thumbnail, learningObjectives, prerequisites }
export const createCourse = (data) => axiosClient.post("/courses", data);

export const updateCourse = (courseId, data) =>
     axiosClient.patch(`/courses/${courseId}`, data);
