import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import curriculumRoutes from "./routes/curriculumRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

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
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", curriculumRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", quizRoutes);
app.use("/api", certificateRoutes);
app.use("/api", reviewRoutes);
app.use("/api/admin", adminRoutes);

// These two must stay at the bottom, after all routes
app.use(notFound);
app.use(errorHandler);

export default app;
