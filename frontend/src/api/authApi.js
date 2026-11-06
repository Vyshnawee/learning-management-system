import axiosClient from "./axiosClient.js";

export const registerUser = (data) => axiosClient.post("/auth/register", data);
export const loginUser = (data) => axiosClient.post("/auth/login", data);
export const fetchMe = () => axiosClient.get("/auth/me");
export const updateMyProfile = (data) => axiosClient.patch("/auth/me", data);
export const changeMyPassword = (data) =>
     axiosClient.patch("/auth/change-password", data);
