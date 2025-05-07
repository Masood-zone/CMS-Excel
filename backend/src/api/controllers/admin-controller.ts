import type { Request, Response } from "express";
import { adminService } from "../../services/admin-service";
import { catchAsync } from "../../utils/catch-async";
import { ApiError } from "../../utils/api-error";

export const adminController = {
  getAdmins: async (req: Request, res: Response) => {
    const admins = await adminService.getAllAdmins();
    res.json(admins);
  },

  getById: async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const admin = await adminService.getAdminById(id);
    res.json(admin);
  },

  // New endpoint to get all owing students
  getAllOwingStudents: catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAllOwingStudents();
    res.json(result);
  }),

  // New endpoint to get owing students by class
  getOwingStudentsByClass: catchAsync(async (req: Request, res: Response) => {
    const classId = Number.parseInt(req.params.classId);
    if (isNaN(classId)) {
      throw new ApiError(400, "Invalid class ID");
    }
    const result = await adminService.getOwingStudentsByClass(classId);
    res.json(result);
  }),

  create: async (req: Request, res: Response) => {
    const newAdmin = await adminService.createAdmin(req.body);
    res.status(201).json(newAdmin);
  },

  update: async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const updatedAdmin = await adminService.updateAdmin(id, req.body);
    res.json(updatedAdmin);
  },

  delete: async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    await adminService.deleteAdmin(id);
    res.status(204).send();
  },
};
