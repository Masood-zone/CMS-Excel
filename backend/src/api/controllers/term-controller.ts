import { Request, Response } from "express";
import type { NextFunction } from "express";
import { prisma } from "../../db/client";
import { catchAsync } from "../../utils/catch-async";
import { ApiError } from "../../utils/api-error";

export const termController = {
  // List all terms
  getTerms: catchAsync(async (req: Request, res: Response) => {
    const terms = await prisma.term.findMany({
      orderBy: [{ year: "desc" }, { startDate: "desc" }],
    });
    res.json(terms);
  }),

  // Get active term
  getActiveTerm: catchAsync(async (req: Request, res: Response) => {
    const term = await prisma.term.findFirst({ where: { isActive: true } });
    if (!term) throw new ApiError(404, "No active term found");
    res.json(term);
  }),

  // Create a new term (ADMIN/SUPER_ADMIN only)
  createTerm: catchAsync(async (req: Request, res: Response) => {
    const { name, year, startDate, endDate, isActive } = req.body;
    if (!name || !year || !startDate || !endDate)
      throw new ApiError(400, "Missing required fields");
    if (isActive) {
      // Deactivate all other terms
      await prisma.term.updateMany({ data: { isActive: false } });
    }
    const term = await prisma.term.create({
      data: {
        name,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: !!isActive,
      },
    });
    res.status(201).json(term);
  }),

  // Activate a term (ADMIN/SUPER_ADMIN only)
  activateTerm: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Deactivate all terms
    await prisma.term.updateMany({ data: { isActive: false } });
    // Activate the selected term
    const term = await prisma.term.update({
      where: { id: Number(id) },
      data: { isActive: true },
    });
    res.json(term);
  }),

  // Deactivate a term (ADMIN/SUPER_ADMIN only)
  deactivateTerm: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const term = await prisma.term.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    res.json(term);
  }),

  // Update a term (ADMIN/SUPER_ADMIN only)
  updateTerm: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, year, startDate, endDate } = req.body;
    const term = await prisma.term.update({
      where: { id: Number(id) },
      data: {
        name,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.json(term);
  }),

  // Delete a term (ADMIN/SUPER_ADMIN only)
  deleteTerm: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.term.delete({ where: { id: Number(id) } });
    res.status(204).send();
  }),
};

// Middleware to enforce active term for record/expense creation
export const requireActiveTerm = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const now = new Date();
    const activeTerm = await prisma.term.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    if (!activeTerm) {
      throw new ApiError(
        403,
        "No active term. Please contact admin to create or activate a term."
      );
    }
    // Attach activeTerm to request for downstream use
    (req as any).activeTerm = activeTerm;
    next();
  }
);
