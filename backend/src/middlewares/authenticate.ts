import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "../utils/api-error";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
    if (err) {
      return next(new ApiError(403, "Invalid or expired token"));
    }
    req.user = user;
    next();
  });
};
