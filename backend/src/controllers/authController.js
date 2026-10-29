import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";

// POST /api/auth/register
export const register = async (req, res) => {
     const { name, email, password, role } = req.body;

     const existingUser = await User.findOne({ email });
     if (existingUser) {
          throw new AppError("Email already registered", 409);
     }

     const passwordHash = await bcrypt.hash(password, 12);

     const user = await User.create({
          name,
          email,
          passwordHash,
          role: role || "student",
     });

     const token = generateToken(user._id);

     res.status(201).json({
          success: true,
          message: "Registration successful",
          data: { user, token },
     });
};

// POST /api/auth/login
export const login = async (req, res) => {
     const { email, password } = req.body;

     const user = await User.findOne({ email }).select("+passwordHash");

     // Same message for "no such email" and "wrong password"
     if (!user || !(await user.comparePassword(password))) {
          throw new AppError("Invalid email or password", 401);
     }

     if (!user.isActive) {
          throw new AppError("Your account has been suspended", 403);
     }

     const token = generateToken(user._id);

     res.status(200).json({
          success: true,
          message: "Login successful",
          data: { user, token },
     });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
     res.status(200).json({
          success: true,
          data: { user: req.user },
     });
};

// PATCH /api/auth/change-password
export const changePassword = async (req, res) => {
     const { currentPassword, newPassword } = req.body;

     // req.user was loaded without the hash, so fetch it again with the hash
     const user = await User.findById(req.user._id).select("+passwordHash");

     if (!(await user.comparePassword(currentPassword))) {
          throw new AppError("Current password is incorrect", 401);
     }

     user.passwordHash = await bcrypt.hash(newPassword, 12);
     await user.save();

     res.status(200).json({
          success: true,
          message: "Password changed successfully",
     });
};
