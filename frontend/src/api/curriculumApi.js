import axiosClient from "./axiosClient.js";

// Sections
export const createSection = (courseId, data) =>
     axiosClient.post(`/courses/${courseId}/sections`, data);
export const updateSection = (sectionId, data) =>
     axiosClient.patch(`/sections/${sectionId}`, data);
export const deleteSection = (sectionId) =>
     axiosClient.delete(`/sections/${sectionId}`);
export const reorderSections = (courseId, sectionIds) =>
     axiosClient.patch(`/courses/${courseId}/sections/reorder`, { sectionIds });

// Lessons
export const createLesson = (sectionId, data) =>
     axiosClient.post(`/sections/${sectionId}/lessons`, data);
export const updateLesson = (lessonId, data) =>
     axiosClient.patch(`/lessons/${lessonId}`, data);
export const deleteLesson = (lessonId) =>
     axiosClient.delete(`/lessons/${lessonId}`);
export const reorderLessons = (sectionId, lessonIds) =>
     axiosClient.patch(`/sections/${sectionId}/lessons/reorder`, { lessonIds });
