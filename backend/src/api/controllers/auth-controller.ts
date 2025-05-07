import type { Request, Response } from "express";
import { authService } from "../../services/auth-service";
import { catchAsync } from "../../utils/catch-async";
import { sendOtpMail } from "../../services/mailer-service";
import { findOTPAndUpdateUser } from "../../services/mailer-service";
import bcrypt from "bcryptjs";

export const authController = {
  signup: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.signup(req.body);
    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(result);
  }),

  getOtpCode: catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const data = await sendOtpMail(email);
    return res.status(201).json({
      message: "OTP successfully sent.",
      data,
    });
  }),

  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const { code, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await findOTPAndUpdateUser(code, hashedPassword);
    return res.status(201).json({
      message: "Password updated successfully",
      data: result,
    });
  }),
};
