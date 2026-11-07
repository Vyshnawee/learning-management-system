import axiosClient from "./axiosClient.js";

export const getInstructorDashboard = (signal) =>
     axiosClient.get("/instructor/dashboard", { signal });
