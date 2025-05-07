"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth-controller");
const router = express_1.default.Router();
router.post("/signup", auth_controller_1.authController.signup);
router.post("/login", auth_controller_1.authController.login);
router.post("/get-otp", auth_controller_1.authController.getOtpCode);
router.post("/reset-password", auth_controller_1.authController.resetPassword);
exports.authRoutes = router;
//# sourceMappingURL=auth-routes.js.map