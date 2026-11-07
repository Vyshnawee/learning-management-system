import axiosClient from "./axiosClient.js";

export const getCourseQuizzes = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}/quizzes`, { signal });
