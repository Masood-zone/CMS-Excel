import type { Request, Response } from "express";
import { classService } from "../../services/class-service";
import { catchAsync } from "../../utils/catch-async";

export const classController = {
  getAll: catchAsync(async (req: Request, res: Response) => {
    const classes = await classService.getAllClasses();
    res.json(classes);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const classItem = await classService.getClassById(id);
    res.json(classItem);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const newClass = await classService.createClass(req.body);
    res.status(201).json(newClass);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const updatedClass = await classService.updateClass(id, req.body);
    res.json(updatedClass);
  }),

  delete: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    await classService.deleteClass(id);
    res.status(204).send();
  }),

  assignTeacher: catchAsync(async (req: Request, res: Response) => {
    const { name } = req.params;
    const { teacher_email } = req.body;
    const updatedClass = await classService.assignTeacher(name, teacher_email);
    res.status(200).json({
      message: "Teacher assigned successfully",
      updatedClass,
    });
  }),

  getClassBySupervisorId: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const classItem = await classService.getClassBySupervisorId(id);
    res.json({ supervisor: classItem });
  }),
};
