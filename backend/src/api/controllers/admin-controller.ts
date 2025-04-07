import type { Request, Response } from "express";
import { adminService } from "../../services/admin-service";

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
