import express from "express";
import {
     register,
     login,
     getMe,
     changePassword,
} from "../controllers/authController.js";
import {
     registerValidator,
     loginValidator,
     changePasswordValidator,
} from "../validators/authValidators.js";
import validate from "../middleware/validate.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.get("/me", protect, getMe);
router.patch(
     "/change-password",
     protect,
     changePasswordValidator,
     validate,
     changePassword,
);

export default router;
