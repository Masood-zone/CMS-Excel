"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_handler_1 = require("./middlewares/error-handler");
const index_1 = require("./api/routes/index");
const index_2 = require("./config/index");
const index_3 = require("./services/cron/index");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)(index_2.config.cors));
app.use(express_1.default.json());
(0, index_1.setupRoutes)(app);
app.use(error_handler_1.errorHandler);
(0, index_3.setupCronJobs)();
process.on("SIGTERM", () => {
    logger_1.logger.info("SIGTERM received, shutting down gracefully");
    process.exit(0);
});
process.on("SIGINT", () => {
    logger_1.logger.info("SIGINT received, shutting down gracefully");
    process.exit(0);
});
//# sourceMappingURL=app.js.map