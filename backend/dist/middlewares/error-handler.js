"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const api_error_1 = require("../utils/api-error");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(err);
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            res.status(409).json({
                error: "A record with this unique constraint already exists",
            });
            return next();
        }
        if (err.code === "P2025") {
            res.status(404).json({
                error: "Record not found",
            });
            return next();
        }
    }
    if (err instanceof api_error_1.ApiError) {
        res.status(err.statusCode).json({
            error: err.message,
        });
        return next();
    }
    res.status(500).json({
        error: "Internal Server Error",
    });
    return next();
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.js.map