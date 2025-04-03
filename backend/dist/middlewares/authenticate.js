"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const api_error_1 = require("../utils/api-error");
const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return next(new api_error_1.ApiError(401, "Authentication required"));
    }
    jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret, (err, user) => {
        if (err) {
            return next(new api_error_1.ApiError(403, "Invalid or expired token"));
        }
        req.user = user;
        next();
    });
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map