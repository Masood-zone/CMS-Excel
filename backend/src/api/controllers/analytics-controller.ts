import type { Request, Response } from "express";
import { analyticsService } from "../../services/analytics-service";
import { catchAsync } from "../../utils/catch-async";

export const analyticsController = {
  getAdminAnalytics: catchAsync(async (req: Request, res: Response) => {
    const analytics = await analyticsService.getAdminAnalytics();
    res.status(200).json(analytics);
  }),

  getTeacherAnalytics: catchAsync(async (req: Request, res: Response) => {
    const classId = Number.parseInt(req.params.classId);
    const analytics = await analyticsService.getTeacherAnalytics(classId);
    res.status(200).json(analytics);
  }),
};
