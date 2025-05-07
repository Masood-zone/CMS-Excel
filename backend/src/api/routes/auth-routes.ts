import express from "express";
import { authController } from "../controllers/auth-controller";

const router = express.Router();

// Authentication endpoints
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/get-otp", authController.getOtpCode);
router.post("/reset-password", authController.resetPassword);

export const authRoutes = router;
