import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error-handler";
import { setupRoutes } from "./api/routes/index";
import { config } from "./config/index";
import { setupCronJobs } from "./services/cron/index";
import { logger } from "./utils/logger";

// Initialize express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

// Setup cron jobs
setupCronJobs();

// Handle graceful shutdown to clear any pending timeouts
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

export { app };
