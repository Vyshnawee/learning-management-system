import axiosClient from "./axiosClient.js";

// params: { page, limit, search, category, level, sort }
export const getCourses = (params, signal) =>
     axiosClient.get("/courses", { params, signal });

export const getCategories = () => axiosClient.get("/categories");

export const getCourse = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}`, { signal });

export const getCurriculum = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}/sections`, { signal });
