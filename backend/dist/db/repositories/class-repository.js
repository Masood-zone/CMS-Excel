"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRepository = void 0;
const client_1 = require("../client");
exports.classRepository = {
    findAll: async () => {
        return client_1.prisma.class.findMany();
    },
    findById: async (id) => {
        return client_1.prisma.class.findUnique({
            where: { id },
            include: { supervisor: true, students: true },
        });
    },
    findBySupervisorId: async (supervisorId) => {
        return client_1.prisma.class.findFirst({
            where: { supervisorId },
        });
    },
    create: async (data) => {
        return client_1.prisma.class.create({
            data,
        });
    },
    update: async (id, data) => {
        return client_1.prisma.class.update({
            where: { id },
            data,
        });
    },
    delete: async (id) => {
        return client_1.prisma.class.delete({
            where: { id },
        });
    },
    assignTeacher: async (name, teacherId) => {
        return client_1.prisma.class.update({
            where: { name },
            data: {
                supervisorId: teacherId,
            },
        });
    },
};
//# sourceMappingURL=class-repository.js.map