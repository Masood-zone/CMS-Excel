import type { Request, Response } from "express";
import { teacherService } from "../../services/teacher-service";
import { catchAsync } from "../../utils/catch-async";
import { ApiError } from "../../utils/api-error";

export const teacherController = {
  getAllTeachers: catchAsync(async (req: Request, res: Response) => {
    const result = await teacherService.getAllTeachers();
    res.status(200).json(result);
  }),

  getTeachersById: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, "Invalid teacher ID");
    }
    const result = await teacherService.getTeacherById(id);
    res.status(200).json(result);
  }),

  getOwingStudentsInClass: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, "Invalid teacher ID");
    }
    const result = await teacherService.getOwingStudentsInTeacherClass(id);
    res.json(result);
  }),

  getTeacherRecords: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, "Invalid teacher ID");
    }
    const result = await teacherService.getTeacherRecords(id);
    res.json(result);
  }),

  createTeacher: catchAsync(async (req: Request, res: Response) => {
    const result = await teacherService.createTeacher(req.body);
    res.status(201).json(result);
  }),

  updateTeacher: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!parseInt(id)) {
      console.log("ID is a number", id);
      throw new ApiError(400, "Invalid teacher ID");
    }
    const result = await teacherService.updateTeacher(parseInt(id), req.body);
    res.json(result);
  }),

  deleteTeacher: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, "Invalid teacher ID");
    }
    const result = await teacherService.deleteTeacher(id);
    res.json(result);
  }),

  getTeachersWithRecordsSummary: catchAsync(
    async (req: Request, res: Response) => {
      const { from, to } = req.query;

      if (!from || !to) {
        throw new ApiError(400, "Start and end dates are required");
      }

      const startDate = new Date(from as string);
      const endDate = new Date(to as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError(400, "Invalid date format");
      }

      const result = await teacherService.getTeachersWithRecordsSummary(
        startDate,
        endDate
      );
      res.status(200).json(result);
    }
  ),

  getTeacherRecordsDetail: catchAsync(async (req: Request, res: Response) => {
    const { teacherId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      throw new ApiError(400, "Start and end dates are required");
    }

    const startDate = new Date(from as string);
    const endDate = new Date(to as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }

    const result = await teacherService.getTeacherRecordsDetail(
      Number.parseInt(teacherId),
      startDate,
      endDate
    );
    res.status(200).json(result);
  }),

  getClassBySupervisorId: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, "Invalid supervisor ID");
    }
    const result = await teacherService.getClassBySupervisorId(id);
    res.json(result);
  }),
  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password } = req.body;

    const result = await teacherService.resetTeacherPassword(
      Number(id),
      password
    );

    res.status(200).json(result);
  }),
};
