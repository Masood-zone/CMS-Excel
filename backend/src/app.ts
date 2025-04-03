import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error-handler";
import { setupRoutes } from "./api/routes";
import { config } from "./config";
import { setupCronJobs } from "./services/cron";

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

export { app };
