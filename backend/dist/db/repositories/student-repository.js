"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRepository = void 0;
const client_1 = require("../client");
exports.studentRepository = {
    findAll: async () => {
        return client_1.prisma.student.findMany({
            include: { class: true },
        });
    },
    findById: async (id) => {
        return client_1.prisma.student.findUnique({
            where: { id },
            include: {
                class: true,
            },
        });
    },
    findByClassId: async (classId) => {
        return client_1.prisma.student.findMany({
            where: { classId },
        });
    },
    create: async (data) => {
        return client_1.prisma.student.create({
            data,
        });
    },
    update: async (id, data) => {
        return client_1.prisma.student.update({
            where: { id },
            data,
        });
    },
    delete: async (id) => {
        return client_1.prisma.student.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=student-repository.js.map