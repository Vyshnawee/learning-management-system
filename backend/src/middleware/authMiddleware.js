import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

// Checks that the request has a valid token, and attaches the user to req.user
export const protect = async (req, res, next) => {
     const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new AppError("Not logged in. Please provide a token.", 401);
     }

     const token = authHeader.split(" ")[1];

     // Throws JsonWebTokenError or TokenExpiredError if the token is bad
     const decoded = jwt.verify(token, process.env.JWT_SECRET);

     const user = await User.findById(decoded.id);

     if (!user) {
          throw new AppError("The user for this token no longer exists", 401);
     }

     if (!user.isActive) {
          throw new AppError("Your account has been suspended", 403);
     }

     req.user = user;
     next();
};

// Allows only the listed roles, e.g. authorize("admin", "instructor")
export const authorize = (...roles) => {
     return (req, res, next) => {
          if (!roles.includes(req.user.role)) {
               throw new AppError(
                    "You do not have permission to perform this action",
                    403,
               );
          }
          next();
     };
};

// Like protect, but never blocks: sets req.user if the token is valid, otherwise continues
export const optionalAuth = async (req, res, next) => {
     const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return next();
     }

     try {
          const decoded = jwt.verify(
               authHeader.split(" ")[1],
               process.env.JWT_SECRET,
          );
          const user = await User.findById(decoded.id);
          if (user && user.isActive) {
               req.user = user;
          }
     } catch (error) {
          // Invalid or expired token: treat the visitor as not logged in
     }

     next();
};
