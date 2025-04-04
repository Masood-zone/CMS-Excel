"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const client_1 = require("../db/client");
exports.analyticsService = {
    getAdminAnalytics: async () => {
        const [totalTeachers, totalStudents, totalClasses, settingsAmount] = await Promise.all([
            client_1.prisma.user.count({
                where: { role: { in: ["TEACHER", "Teacher"] } },
            }),
            client_1.prisma.student.count(),
            client_1.prisma.class.count(),
            client_1.prisma.settings.findFirst({
                where: { name: "amount" },
                select: { value: true },
            }),
        ]);
        const amount = settingsAmount ? Number.parseInt(settingsAmount.value) : 0;
        const totalCollections = totalStudents * amount;
        return {
            totalTeachers,
            totalStudents,
            totalCollections,
            totalClasses,
        };
    },
    getTeacherAnalytics: async (classId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [settingsAmount, totalStudents, paidStudents, unpaidStudents] = await Promise.all([
            client_1.prisma.settings.findFirst({
                where: { name: "amount" },
                select: { value: true },
            }),
            client_1.prisma.student.count({
                where: { classId },
            }),
            client_1.prisma.record.count({
                where: {
                    classId,
                    submitedAt: { gte: today },
                    hasPaid: true,
                },
            }),
            client_1.prisma.record.count({
                where: {
                    classId,
                    submitedAt: { gte: today },
                    hasPaid: false,
                },
            }),
        ]);
        const amount = settingsAmount ? Number.parseInt(settingsAmount.value) : 0;
        const totalAmount = totalStudents * amount;
        const paidAmount = paidStudents * amount;
        const unpaidAmount = unpaidStudents * amount;
        return {
            totalAmount,
            totalStudents,
            paidStudents: {
                count: paidStudents,
                amount: paidAmount,
            },
            unpaidStudents: {
                count: unpaidStudents,
                amount: unpaidAmount,
            },
        };
    },
};
//# sourceMappingURL=analytics-service.js.map