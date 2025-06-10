import type { Request, Response } from "express";
import { analyticsService } from "../../services/analytics-service";
import { catchAsync } from "../../utils/catch-async";

export const analyticsController = {
  getAdminAnalytics: catchAsync(async (req: Request, res: Response) => {
    const termId = req.query.termId ? Number(req.query.termId) : undefined;
    const analytics = await analyticsService.getAdminAnalytics(termId);
    res.status(200).json(analytics);
  }),

  getTeacherAnalytics: catchAsync(async (req: Request, res: Response) => {
    const classId = Number.parseInt(req.params.classId);
    const termId = req.query.termId ? Number(req.query.termId) : undefined;
    const analytics = await analyticsService.getTeacherAnalytics(
      classId,
      termId
    );
    res.status(200).json(analytics);
  }),

  getAllTermsAnalytics: catchAsync(async (_req: Request, res: Response) => {
    const analytics = await analyticsService.getAllTermsAnalytics();
    res.status(200).json(analytics);
  }),
};
