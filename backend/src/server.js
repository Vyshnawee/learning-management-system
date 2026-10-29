import dotenv from "dotenv";

// Load .env FIRST, before importing files that read process.env
dotenv.config();

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
