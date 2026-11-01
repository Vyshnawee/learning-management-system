import express from "express";
import cors from "cors";
import helmet from "helmet";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import sanitizeBody from "./middleware/sanitize.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import curriculumRoutes from "./routes/curriculumRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

// Security headers
app.use(helmet());

app.use(
     cors({
          origin: process.env.CLIENT_URL,
          credentials: true,
     }),
);

// Body parsing, with an explicit size limit
app.use(express.json({ limit: "100kb" }));
app.use(sanitizeBody);

// Limit requests to the whole API
app.use("/api", apiLimiter);

// Health-check route
app.get("/api/health", (req, res) => {
     res.status(200).json({
          success: true,
          message: "LMS API is running",
          timestamp: new Date().toISOString(),
     });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", curriculumRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", quizRoutes);
app.use("/api", certificateRoutes);
app.use("/api", reviewRoutes);
app.use("/api", analyticsRoutes);

// These two must stay at the bottom, after all routes
app.use(notFound);
app.use(errorHandler);

export default app;
