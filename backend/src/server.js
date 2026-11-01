import dotenv from "dotenv";

// Load .env FIRST, before importing files that read process.env
dotenv.config();
// Refuse to start if a required setting is missing
const required = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
     console.error(
          `Missing required environment variables: ${missing.join(", ")}`,
     );
     process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
     console.error("JWT_SECRET must be at least 32 characters long");
     process.exit(1);
}

const { default: connectDB } = await import("./config/db.js");
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
     try {
          await connectDB();

          app.listen(PORT, () => {
               console.log(
                    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
               );
               console.log(`Health check: http://localhost:${PORT}/api/health`);
          });
     } catch (error) {
          console.error("Failed to start server:", error.message);
          process.exit(1);
     }
};

startServer();
