"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const admin_repository_1 = require("../db/repositories/admin-repository");
const api_error_1 = require("../utils/api-error");
const client_1 = require("../db/client");
exports.adminService = {
    getAllAdmins: async () => {
        return admin_repository_1.adminRepository.findAllAdmins();
    },
    getAdminById: async (id) => {
        const admin = await admin_repository_1.adminRepository.findById(id);
        if (!admin) {
            throw new api_error_1.ApiError(404, "Admin not found");
        }
        return admin;
    },
    getAllOwingStudents: async () => {
        const owingStudents = await client_1.prisma.student.findMany({
            where: {
                owing: {
                    gt: 0,
                },
            },
            orderBy: {
                owing: "desc",
            },
            include: {
                class: true,
            },
        });
        return {
            owingStudents,
            totalOwing: owingStudents.reduce((sum, student) => sum + student.owing, 0),
            count: owingStudents.length,
        };
    },
    getOwingStudentsByClass: async (classId) => {
        const classData = await client_1.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            throw new api_error_1.ApiError(404, "Class not found");
        }
        const owingStudents = await client_1.prisma.student.findMany({
            where: {
                classId,
                owing: {
                    gt: 0,
                },
            },
            orderBy: {
                owing: "desc",
            },
            include: {
                class: true,
            },
        });
        return {
            class: classData,
            owingStudents,
            totalOwing: owingStudents.reduce((sum, student) => sum + student.owing, 0),
            count: owingStudents.length,
        };
    },
    getAdminByEmail: async (email) => {
        const admin = await admin_repository_1.adminRepository.findByEmail(email);
        if (!admin) {
            throw new api_error_1.ApiError(404, "Admin not found");
        }
        return admin;
    },
    createAdmin: async (adminData) => {
        const { email, name, phone, role, gender, password } = adminData;
        const existingAdmin = await admin_repository_1.adminRepository.findByEmail(email);
        if (existingAdmin) {
            throw new api_error_1.ApiError(409, "Admin already exists");
        }
        return admin_repository_1.adminRepository.create({
            email,
            name,
            phone,
            role,
            gender,
            password,
        });
    },
    updateAdmin: async (id, adminData) => {
        const { email, name, phone, role, gender, assigned_class } = adminData;
        return admin_repository_1.adminRepository.update(id, {
            email,
            name,
            phone,
            role,
            gender,
        });
    },
    deleteAdmin: async (id) => {
        return admin_repository_1.adminRepository.delete(id);
    },
};
//# sourceMappingURL=admin-service.js.map