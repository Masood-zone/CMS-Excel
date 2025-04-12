import type { Request, Response } from "express";
import { studentService } from "../../services/student-service";
import { catchAsync } from "../../utils/catch-async";
import { ApiError } from "../../utils/api-error";

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

   // New endpoint to get owing students by class
   getOwingStudentsByClass: catchAsync(async (req: Request, res: Response) => {
    const classId = Number.parseInt(req.params.classId)
    const owingStudents = await studentService.getOwingStudentsByClassId(classId)
    res.json(owingStudents)
  }),

  // New endpoint to get all owing students
  getAllOwingStudents: catchAsync(async (req: Request, res: Response) => {
    const owingStudents = await studentService.getAllOwingStudents()
    res.json(owingStudents)
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

  getStudentOwing: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const owingDetails = await studentService.getStudentOwingDetails(id);
    res.json(owingDetails);
  }),

  payStudentOwing: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const { amount } = req.body;

    if (!amount || isNaN(Number.parseFloat(amount))) {
      throw new ApiError(400, "Valid payment amount is required");
    }

    const result = await studentService.payStudentOwing(
      id,
      Number.parseFloat(amount)
    );
    res.json(result);
  }),

  delete: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    await studentService.deleteStudent(id);
    res.status(204).send();
  }),
};
