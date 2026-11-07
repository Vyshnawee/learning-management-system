import axiosClient from "./axiosClient.js";

export const getMyCertificates = (signal) =>
     axiosClient.get("/certificates/my-certificates", { signal });

// Public: used by the verification page
export const getCertificate = (certificateId, signal) =>
     axiosClient.get(`/certificates/${certificateId}`, { signal });

export const issueCertificate = (courseId) =>
     axiosClient.post(`/courses/${courseId}/certificate`);
