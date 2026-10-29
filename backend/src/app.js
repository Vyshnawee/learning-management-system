import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(
     cors({
          origin: process.env.CLIENT_URL,
          credentials: true,
     }),
);
app.use(express.json());

// Health-check route
app.get("/api/health", (req, res) => {
     res.status(200).json({
          success: true,
          message: "LMS API is running",
          timestamp: new Date().toISOString(),
     });
});

// 404 handler: runs when no route matched
app.use((req, res) => {
     res.status(404).json({
          success: false,
          message: `Route not found: ${req.method} ${req.originalUrl}`,
     });
});

// Basic error handler: runs when something throws an error
app.use((err, req, res, next) => {
     console.error(err);
     res.status(err.statusCode || 500).json({
          success: false,
          message: err.message || "Internal server error",
     });
});

export default app;
