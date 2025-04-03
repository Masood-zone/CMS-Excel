import type { Request, Response } from "express";
import { studentService } from "../../services/student-service";
import { catchAsync } from "../../utils/catch-async";

export const studentController = {
  getAll: catchAsync(async (req: Request, res: Response) => {
    const students = await studentService.getAllStudents();
    res.json(students);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const student = await studentService.getStudentById(id);
    res.json(student);
  }),

  getClassById: catchAsync(async (req: Request, res: Response) => {
    const classId = Number.parseInt(req.params.classId);
    const students = await studentService.getStudentsByClassId(classId);
    res.json(students);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const newStudent = await studentService.createStudent(req.body);
    res.status(201).json(newStudent);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const updatedStudent = await studentService.updateStudent(id, req.body);
    res.json(updatedStudent);
  }),

  delete: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    await studentService.deleteStudent(id);
    res.status(204).send();
  }),
};
