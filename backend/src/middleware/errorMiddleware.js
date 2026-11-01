import AppError from "../utils/AppError.js";

// Runs when no route matched
export const notFound = (req, res, next) => {
     next(
          new AppError(
               `Route not found: ${req.method} ${req.originalUrl}`,
               404,
          ),
     );
};

// Central error handler: every error in the app ends up here
export const errorHandler = (err, req, res, next) => {
     let statusCode = err.statusCode || 500;
     let message = err.message || "Internal server error";
     let errors;

     // Mongoose validation error (e.g. required field missing)
     if (err.name === "ValidationError") {
          statusCode = 400;
          message = "Validation failed";
          errors = Object.values(err.errors).map((e) => ({
               field: e.path,
               message: e.message,
          }));
     }

     // Invalid MongoDB ID (e.g. /api/courses/abc)
     if (err.name === "CastError") {
          statusCode = 400;
          message = `Invalid ${err.path}: ${err.value}`;
     }

     // Duplicate key (e.g. email already registered)
     if (err.code === 11000) {
          statusCode = 409;
          const field = Object.keys(err.keyValue || {})[0] || "value";
          message = `${field} already exists`;
     }

     // JWT errors
     if (err.name === "JsonWebTokenError") {
          statusCode = 401;
          message = "Invalid token. Please log in again.";
     }
     if (err.name === "TokenExpiredError") {
          statusCode = 401;
          message = "Your session has expired. Please log in again.";
     }

     // Malformed JSON in the request body
     // Request body too large
     if (err.type === "entity.too.large") {
          statusCode = 413;
          message = "Request body is too large";
     }

     if (err.type === "entity.parse.failed") {
          statusCode = 400;
          message = "Invalid JSON in request body";
     }

     // Unexpected bug: log it, and hide details in production
     if (statusCode === 500) {
          console.error(err);
          if (process.env.NODE_ENV === "production") {
               message = "Internal server error";
          }
     }

     res.status(statusCode).json({
          success: false,
          message,
          ...(errors && { errors }),
          ...(process.env.NODE_ENV === "development" &&
               statusCode === 500 && { stack: err.stack }),
     });
};
