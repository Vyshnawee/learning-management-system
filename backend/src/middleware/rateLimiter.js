import rateLimit from "express-rate-limit";

// For login and register: max 10 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 10,
     standardHeaders: true,
     legacyHeaders: false,
     skip: () => process.env.NODE_ENV === "test",
     message: {
          success: false,
          message: "Too many attempts. Please try again after 15 minutes.",
     },
});

// For the whole API: max 300 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 300,
     standardHeaders: true,
     legacyHeaders: false,
     skip: () => process.env.NODE_ENV === "test",
     message: {
          success: false,
          message: "Too many requests. Please slow down.",
     },
});
