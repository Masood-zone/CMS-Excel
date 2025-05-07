import type { Request, Response } from "express";
import { recordService } from "../../services/record-service";
import { catchAsync } from "../../utils/catch-async";
import { ApiError } from "../../utils/api-error";

export const recordController = {
  getAllRecords: catchAsync(async (req: Request, res: Response) => {
    const records = await recordService.getAllRecords();
    res.status(200).json(records);
  }),

  getDashboardSummary: catchAsync(async (req: Request, res: Response) => {
    const summary = await recordService.getDashboardSummary();
    res.status(200).json(summary);
  }),

  generateDailyRecords: catchAsync(async (req: Request, res: Response) => {
    const classId = req.params.classId
      ? Number.parseInt(req.params.classId)
      : undefined;
    const date = new Date(req.query.date as string);

    if (isNaN(date.getTime())) {
      throw new ApiError(400, "Invalid date");
    }

    const result = await recordService.generateDailyRecords({ classId, date });

    res.status(200).json({
      message: "Daily records generated successfully",
      ...result,
    });
  }),

  getByClassAndDate: catchAsync(async (req: Request, res: Response) => {
    const classId = Number.parseInt(req.params.classId);
    const date = new Date(req.query.date as string);

    if (isNaN(classId) || isNaN(date.getTime())) {
      throw new ApiError(400, "Invalid classId or date");
    }

    const records = await recordService.getRecordsByClass(classId, date);
    res.status(200).json(records);
  }),

  getStudentRecordsByClassAndDate: catchAsync(
    async (req: Request, res: Response) => {
      const classId = Number.parseInt(req.params.classId);
      const date = new Date(req.query.date as string);

      if (isNaN(classId) || isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid classId or date");
      }

      const records = await recordService.getStudentRecordsByClassAndDate(
        classId,
        date
      );
      res.status(200).json(records);
    }
  ),

  getAllTeacherSubmittedRecords: catchAsync(
    async (req: Request, res: Response) => {
      const date = new Date(req.query.date as string);
      if (isNaN(date.getTime())) {
        throw new ApiError(400, "Date is required and must be a valid date");
      }

      const records = await recordService.getAllTeacherSubmittedRecords(date);
      res.json(records);
    }
  ),

  getTeacherSubmittedRecords: catchAsync(
    async (req: Request, res: Response) => {
      const teacherId = Number.parseInt(req.params.teacherId);
      const date = new Date(req.query.date as string);

      if (isNaN(teacherId) || isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid teacherId or date");
      }

      const records = await recordService.getTeacherSubmittedRecords(
        teacherId,
        date
      );
      res.status(200).json(records);
    }
  ),

  submitTeacherRecord: catchAsync(async (req: Request, res: Response) => {
    const updatedRecords = await recordService.submitTeacherRecord(req.body);
    res.status(201).json(updatedRecords);
  }),

  updateStudentStatus: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hasPaid, isAbsent, paymentAmount } = req.body;

    const updatedRecord = await recordService.updateStudentStatus(
      Number.parseInt(id),
      {
        hasPaid,
        isAbsent,
        paymentAmount: paymentAmount
          ? Number.parseFloat(paymentAmount)
          : undefined,
      }
    );

    res.status(200).json(updatedRecord);
  }),
  bulkUpdateStudentStatus: catchAsync(async (req: Request, res: Response) => {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      throw new ApiError(
        400,
        "Invalid request: records must be a non-empty array"
      );
    }

    const updatedRecords = await recordService.bulkUpdateStudentStatus(records);

    res.status(200).json({
      message: `Successfully updated ${updatedRecords.length} records`,
      records: updatedRecords,
    });
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedRecord = await recordService.updateRecord(
      Number.parseInt(id),
      req.body
    );
    res.json(updatedRecord);
  }),

  delete: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await recordService.deleteRecord(Number.parseInt(id));
    res.status(204).send();
  }),
};
