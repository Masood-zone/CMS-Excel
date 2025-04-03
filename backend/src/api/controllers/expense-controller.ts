import type { Request, Response } from "express";
import { expenseService } from "../../services/expense-service";
import { referenceService } from "../../services/reference-service";
import { catchAsync } from "../../utils/catch-async";

export const expenseController = {
  getAllExpenses: catchAsync(async (req: Request, res: Response) => {
    const expenses = await expenseService.getAllExpenses();
    res.status(200).json(expenses);
  }),

  getExpenseById: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const expense = await expenseService.getExpenseById(id);
    res.status(200).json(expense);
  }),

  createExpense: catchAsync(async (req: Request, res: Response) => {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  }),

  updateExpense: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const expense = await expenseService.updateExpense(id, req.body);
    res.status(200).json(expense);
  }),

  deleteExpense: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    await expenseService.deleteExpense(id);
    res.status(204).end();
  }),

  getAllReferences: catchAsync(async (req: Request, res: Response) => {
    const references = await referenceService.getAllReferences();
    res.status(200).json(references);
  }),

  getReferenceById: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const reference = await referenceService.getReferenceById(id);
    res.status(200).json(reference);
  }),

  createReference: catchAsync(async (req: Request, res: Response) => {
    const reference = await referenceService.createReference(req.body);
    res.status(201).json(reference);
  }),

  updateReference: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const reference = await referenceService.updateReference(id, req.body);
    res.status(200).json(reference);
  }),

  deleteReference: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    await referenceService.deleteReference(id);
    res.status(204).end();
  }),
};
