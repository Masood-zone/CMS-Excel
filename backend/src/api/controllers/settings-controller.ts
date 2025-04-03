import type { Request, Response } from "express";
import { settingsService } from "../../services/settings-service";
import { catchAsync } from "../../utils/catch-async";

export const settingsController = {
  getAmount: catchAsync(async (req: Request, res: Response) => {
    const result = await settingsService.getAmount();
    res.status(200).json(result);
  }),

  createAmount: catchAsync(async (req: Request, res: Response) => {
    const { value } = req.body;
    const result = await settingsService.createAmount(value);
    res.status(200).json(result);
  }),

  updateAmount: catchAsync(async (req: Request, res: Response) => {
    const { value } = req.body;
    const result = await settingsService.updateAmount(value);
    res.status(200).json(result);
  }),
};
