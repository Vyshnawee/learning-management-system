import axios from "axios";
import { getToken, clearToken } from "../utils/token.js";

// Other parts of the app listen for this event to log the user out
export const AUTH_LOGOUT_EVENT = "auth:logout";

const axiosClient = axios.create({
     baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
     headers: { "Content-Type": "application/json" },
     timeout: 15000,
});

// Before every request: attach the token if we have one
axiosClient.interceptors.request.use((config) => {
     const token = getToken();
     if (token) {
          config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
});

// On these URLs a 401 means "wrong input", not "session expired"
const NO_LOGOUT_URLS = [
     "/auth/login",
     "/auth/register",
     "/auth/change-password",
];

axiosClient.interceptors.response.use(
     // Success: return only the response body { success, message, data, pagination }
     (response) => response.data,

     // Failure
     (error) => {
          const status = error.response?.status;
          const message = error.response?.data?.message || "";
          const url = error.config?.url || "";

          const isAuthForm = NO_LOGOUT_URLS.some((path) => url.includes(path));
          const sessionProblem =
               status === 401 ||
               (status === 403 && message.toLowerCase().includes("suspended"));

          if (sessionProblem && !isAuthForm && getToken()) {
               clearToken();
               window.dispatchEvent(
                    new CustomEvent(AUTH_LOGOUT_EVENT, { detail: { message } }),
               );
          }

          return Promise.reject(error);
     },
);

export default axiosClient;
