import axiosClient from "./axiosClient.js";

export const getMyCertificates = (signal) =>
     axiosClient.get("/certificates/my-certificates", { signal });
