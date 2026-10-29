import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

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

app.use("/api/auth", authRoutes);

// These two must stay at the bottom, after all routes
app.use(notFound);
app.use(errorHandler);

export default app;
