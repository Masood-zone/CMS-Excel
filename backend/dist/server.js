"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const index_1 = require("./config/index");
const PORT = process.env.PORT || index_1.config.server.port || 3000;
process.on("uncaughtException", (err) => {
    logger_1.logger.error("Uncaught Exception:", err);
    process.exit(1);
});
process.on("unhandledRejection", (err) => {
    logger_1.logger.error("Unhandled Rejection:", err);
    process.exit(1);
});
const server = app_1.app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Server is running on port ${PORT}`);
    logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    logger_1.logger.info(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
});
exports.server = server;
process.on("SIGTERM", () => {
    logger_1.logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Process terminated");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    logger_1.logger.info("SIGINT received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Process terminated");
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map