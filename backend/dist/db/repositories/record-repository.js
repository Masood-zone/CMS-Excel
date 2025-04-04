"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordRepository = void 0;
const client_1 = require("../client");
exports.recordRepository = {
    findAll: async () => {
        return client_1.prisma.record.findMany();
    },
    findById: async (id) => {
        return client_1.prisma.record.findUnique({
            where: { id },
        });
    },
    create: async (data) => {
        return client_1.prisma.record.create({
            data,
            include: { student: true },
        });
    },
    update: async (id, data) => {
        return client_1.prisma.record.update({
            where: { id },
            data,
        });
    },
    delete: async (id) => {
        return client_1.prisma.record.delete({
            where: { id },
        });
    },
    findByClassAndDate: async (classId, date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return client_1.prisma.record.findMany({
            where: {
                classId,
                submitedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: { student: true },
        });
    },
    findByTeacherAndDate: async (teacherId, date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return client_1.prisma.record.findMany({
            where: {
                submitedBy: teacherId,
                submitedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                class: true,
                student: true,
            },
        });
    },
    findByTeacherId: async (teacherId) => {
        return client_1.prisma.record.findMany({
            where: { submitedBy: teacherId },
        });
    },
    updateStudentStatus: async (id, data) => {
        return client_1.prisma.record.update({
            where: { id },
            data,
            include: { student: true },
        });
    },
    upsertRecord: async (payedBy, submitedAt, data) => {
        return client_1.prisma.record.upsert({
            where: {
                payedBy_submitedAt: {
                    payedBy,
                    submitedAt,
                },
            },
            update: {
                amount: data.amount,
                hasPaid: data.hasPaid,
                isAbsent: data.isAbsent,
                submitedBy: data.submitedBy,
            },
            create: {
                classId: data.classId,
                payedBy,
                submitedAt,
                amount: data.amount,
                hasPaid: data.hasPaid,
                isAbsent: data.isAbsent,
                submitedBy: data.submitedBy,
                settingsAmount: data.settingsAmount || data.amount,
            },
        });
    },
};
//# sourceMappingURL=record-repository.js.map