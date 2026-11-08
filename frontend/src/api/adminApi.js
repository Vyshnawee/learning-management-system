import axiosClient from "./axiosClient.js";

export const getAdminDashboard = (signal) =>
     axiosClient.get("/admin/dashboard", { signal });
export const getAdminEnrollmentStats = (signal) =>
     axiosClient.get("/admin/enrollments", { signal });

// Users
export const getAdminUsers = (params, signal) =>
     axiosClient.get("/admin/users", { params, signal });
export const setUserActive = (userId, isActive) =>
     axiosClient.patch(`/admin/users/${userId}/status`, { isActive });

// Courses
export const getAdminCourses = (params, signal) =>
     axiosClient.get("/admin/courses", { params, signal });
export const setCourseStatus = (courseId, status) =>
     axiosClient.patch(`/admin/courses/${courseId}/status`, { status });

// Categories
export const getAdminCategories = (signal) =>
     axiosClient.get("/admin/categories", { signal });
export const createCategory = (data) =>
     axiosClient.post("/admin/categories", data);
export const updateCategory = (categoryId, data) =>
     axiosClient.patch(`/admin/categories/${categoryId}`, data);
export const deleteCategory = (categoryId) =>
     axiosClient.delete(`/admin/categories/${categoryId}`);
