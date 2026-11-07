import axiosClient from "./axiosClient.js";

export const getCourseReviews = (courseId, params, signal) =>
     axiosClient.get(`/courses/${courseId}/reviews`, { params, signal });

export const getMyReview = (courseId, signal) =>
     axiosClient.get(`/courses/${courseId}/reviews/mine`, { signal });

// data: { rating, comment }
export const createReview = (courseId, data) =>
     axiosClient.post(`/courses/${courseId}/reviews`, data);

export const updateReview = (reviewId, data) =>
     axiosClient.patch(`/reviews/${reviewId}`, data);

export const deleteReview = (reviewId) =>
     axiosClient.delete(`/reviews/${reviewId}`);
