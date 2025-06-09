"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherService = void 0;
const user_repository_1 = require("../db/repositories/user-repository");
const record_repository_1 = require("../db/repositories/record-repository");
const api_error_1 = require("../utils/api-error");
const client_1 = require("../db/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.teacherService = {
    getAllTeachers: async () => {
        const teachers = await user_repository_1.userRepository.findTeachers();
        return { teachers };
    },
    getTeacherById: async (id) => {
        const teacher = await user_repository_1.userRepository.findById(id);
        if (!teacher || !["TEACHER", "Teacher"].includes(teacher.role)) {
            throw new api_error_1.ApiError(404, "Teacher not found");
        }
        return { teacher };
    },
    getTeacherRecords: async (id) => {
        const records = await record_repository_1.recordRepository.findByTeacherId(id);
        if (records.length === 0) {
            throw new api_error_1.ApiError(404, "No records found for this teacher");
        }
        return { data: records };
    },
    createTeacher: async (teacherData) => {
        const { email, name, phone, gender, password } = teacherData;
        if (!name || !phone || !gender) {
            throw new api_error_1.ApiError(400, "Name, gender, and phone are required");
        }
        const newTeacher = await user_repository_1.userRepository.create({
            email,
            name,
            phone,
            role: "TEACHER",
            gender,
            password,
        });
        return {
            status: "Teacher added successfully",
            data: newTeacher,
        };
    },
    getOwingStudentsInTeacherClass: async (teacherId) => {
        const teacherClass = await client_1.prisma.class.findFirst({
            where: { supervisorId: teacherId },
        });
        if (!teacherClass) {
            throw new api_error_1.ApiError(404, "No class found for this teacher");
        }
        const owingStudents = await client_1.prisma.student.findMany({
            where: {
                classId: teacherClass.id,
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
            class: teacherClass,
            owingStudents,
            totalOwing: owingStudents.reduce((sum, student) => sum + student.owing, 0),
            count: owingStudents.length,
        };
    },
    updateTeacher: async (id, teacherData) => {
        const { email, name, phone, gender, password, assigned_class } = teacherData;
        const updatedTeacher = await user_repository_1.userRepository.update(id, {
            email,
            name,
            phone,
            gender,
            password,
            assigned_class: assigned_class
                ? {
                    connect: { id: assigned_class.id },
                }
                : undefined,
        });
        if (!updatedTeacher) {
            throw new api_error_1.ApiError(404, "Teacher not found");
        }
        return {
            status: "Teacher updated successfully",
            data: updatedTeacher,
        };
    },
    deleteTeacher: async (id) => {
        const deletedTeacher = await user_repository_1.userRepository.delete(id);
        if (!deletedTeacher) {
            throw new api_error_1.ApiError(404, "Teacher not found");
        }
        return {
            status: "Teacher deleted successfully",
        };
    },
    getTeachersWithRecordsSummary: async (startDate, endDate) => {
        const teacherRecords = await client_1.prisma.user.findMany({
            where: {
                role: { in: ["TEACHER", "Teacher"] },
            },
            select: {
                id: true,
                name: true,
                records: {
                    where: {
                        submitedAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    select: {
                        amount: true,
                    },
                },
            },
        });
        if (teacherRecords.length === 0) {
            throw new api_error_1.ApiError(404, "No records found for this teacher");
        }
        const formattedRecords = teacherRecords.map((teacher) => ({
            id: teacher.id,
            name: teacher.name,
            totalAmount: teacher.records.reduce((sum, record) => sum + record.amount, 0),
        }));
        return formattedRecords;
    },
    getTeacherRecordsDetail: async (teacherId, startDate, endDate) => {
        const teacherRecords = await client_1.prisma.record.findMany({
            where: {
                submitedBy: teacherId,
                submitedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                student: true,
                class: true,
            },
            orderBy: {
                submitedAt: "asc",
            },
        });
        return teacherRecords;
    },
    getClassBySupervisorId: async (id) => {
        var _a;
        const classData = await client_1.prisma.class.findUnique({
            where: { id },
            select: {
                records: true,
                supervisorId: true,
                supervisor: true,
            },
        });
        if (!classData) {
            throw new api_error_1.ApiError(404, "Class not found");
        }
        const supervisor = await client_1.prisma.user.findUnique({
            where: { id: (_a = classData.supervisorId) !== null && _a !== void 0 ? _a : undefined },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
        return { supervisor };
    },
    resetTeacherPassword: async (id, newPassword) => {
        if (!newPassword) {
            throw new api_error_1.ApiError(400, "New password is required");
        }
        const teacher = await user_repository_1.userRepository.findById(id, true);
        if (!teacher || !["TEACHER", "Teacher"].includes(teacher.role)) {
            throw new api_error_1.ApiError(404, "Teacher not found");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        const updatedTeacher = await user_repository_1.userRepository.update(id, {
            password: hashedPassword,
        });
        if (!updatedTeacher) {
            throw new api_error_1.ApiError(500, "Failed to reset password");
        }
        return {
            status: "Password reset successfully",
            teacherId: id,
        };
    },
};
//# sourceMappingURL=teacher-service.js.map