import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ApiError } from "../utils/api-error";
import { logger } from "../utils/logger";
import { Prisma } from "@prisma/client";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
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

  // Handle custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return next();
  }

  // Handle other errors
  res.status(500).json({
    error: "Internal Server Error",
  });
  return next();
};
