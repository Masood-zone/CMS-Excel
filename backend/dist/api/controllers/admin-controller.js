"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const admin_service_1 = require("../../services/admin-service");
const catch_async_1 = require("../../utils/catch-async");
const api_error_1 = require("../../utils/api-error");
exports.adminController = {
    getAdmins: async (req, res) => {
        const admins = await admin_service_1.adminService.getAllAdmins();
        res.json(admins);
    },
    getById: async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const admin = await admin_service_1.adminService.getAdminById(id);
        res.json(admin);
    },
    getAllOwingStudents: (0, catch_async_1.catchAsync)(async (req, res) => {
        const result = await admin_service_1.adminService.getAllOwingStudents();
        res.json(result);
    }),
    getOwingStudentsByClass: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classId = Number.parseInt(req.params.classId);
        if (isNaN(classId)) {
            throw new api_error_1.ApiError(400, "Invalid class ID");
        }
        const result = await admin_service_1.adminService.getOwingStudentsByClass(classId);
        res.json(result);
    }),
    create: async (req, res) => {
        const newAdmin = await admin_service_1.adminService.createAdmin(req.body);
        res.status(201).json(newAdmin);
    },
    update: async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const updatedAdmin = await admin_service_1.adminService.updateAdmin(id, req.body);
        res.json(updatedAdmin);
    },
    delete: async (req, res) => {
        const id = Number.parseInt(req.params.id);
        await admin_service_1.adminService.deleteAdmin(id);
        res.status(204).send();
    },
};
//# sourceMappingURL=admin-controller.js.map