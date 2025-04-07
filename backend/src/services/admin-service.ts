import { create } from "domain";
import { adminRepository } from "../db/repositories/admin-repository";
import { ApiError } from "../utils/api-error";

export const adminService = {
  getAllAdmins: async () => {
    return adminRepository.findAll();
  },

  getAdminById: async (id: number) => {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }
    return admin;
  },

  getAdminByEmail: async (email: string) => {
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }
    return admin;
  },

  createAdmin: async (adminData: {
    email: string;
    name?: string;
    phone?: string;
    role: string;
    gender?: string;
    password?: string;
  }) => {
    const { email, name, phone, role, gender, password } = adminData;
    const existingAdmin = await adminRepository.findByEmail(email);
    if (existingAdmin) {
      throw new ApiError(409, "Admin already exists");
    }
    return adminRepository.create({
      email,
      name,
      phone,
      role,
      gender,
      password,
    });
  },
  updateAdmin: async (
    id: number,
    adminData: {
      email?: string;
      name?: string;
      phone?: string;
      role?: string;
      gender?: string;
      assigned_class?: string;
    }
  ) => {
    const { email, name, phone, role, gender, assigned_class } = adminData;

    return adminRepository.update(id, {
      email,
      name,
      phone,
      role,
      gender,
    });
  },

  deleteAdmin: async (id: number) => {
    return adminRepository.delete(id);
  },
};
