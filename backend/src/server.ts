import { app } from "./app";
import { logger } from "./utils/logger";
import { config } from "./config/index";

const PORT = process.env.PORT || config.server.port || 3000;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `🌐 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

export { server };
