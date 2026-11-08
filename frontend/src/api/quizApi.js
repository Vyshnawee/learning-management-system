import axiosClient from "./axiosClient.js";

export const getCourseQuizzes = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}/quizzes`, { signal });

export const getQuiz = (quizId, signal) =>
     axiosClient.get(`/quizzes/${quizId}`, { signal });

export const getMyQuizResults = (quizId, signal) =>
     axiosClient.get(`/quizzes/${quizId}/attempts/my-results`, { signal });

// data: { answers: [{ questionId, selectedOption }] }
export const submitAttempt = (quizId, data) =>
     axiosClient.post(`/quizzes/${quizId}/attempts`, data);

// Instructor: data = { title, description, passingScore, questions: [...] }
export const createQuiz = (courseId, data) =>
     axiosClient.post(`/courses/${courseId}/quizzes`, data);
export const updateQuiz = (quizId, data) =>
     axiosClient.patch(`/quizzes/${quizId}`, data);
export const deleteQuiz = (quizId) => axiosClient.delete(`/quizzes/${quizId}`);
