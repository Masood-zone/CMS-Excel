"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../../services/auth-service");
const catch_async_1 = require("../../utils/catch-async");
const mailer_service_1 = require("../../services/mailer-service");
const mailer_service_2 = require("../../services/mailer-service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.authController = {
    signup: (0, catch_async_1.catchAsync)(async (req, res) => {
        const user = await auth_service_1.authService.signup(req.body);
        res.status(201).json({
            message: "User created successfully",
            data: user,
        });
    }),
    login: (0, catch_async_1.catchAsync)(async (req, res) => {
        const result = await auth_service_1.authService.login(req.body);
        res.json(result);
    }),
    getOtpCode: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { email } = req.body;
        const data = await (0, mailer_service_1.sendOtpMail)(email);
        return res.status(201).json({
            message: "OTP successfully sent.",
            data,
        });
    }),
    resetPassword: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { code, password } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const result = await (0, mailer_service_2.findOTPAndUpdateUser)(code, hashedPassword);
        return res.status(201).json({
            message: "Password updated successfully",
            data: result,
        });
    }),
};
//# sourceMappingURL=auth-controller.js.map