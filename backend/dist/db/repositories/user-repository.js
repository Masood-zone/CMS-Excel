"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const client_1 = require("../client");
exports.userRepository = {
    findAll: async (options) => {
        return client_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                gender: true,
                assigned_class: true,
            },
            where: (options === null || options === void 0 ? void 0 : options.role) ? { role: { in: [options.role] } } : undefined,
        });
    },
    findById: async (id) => {
        return client_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                gender: true,
                assigned_class: true,
            },
        });
    },
    findByEmail: async (email) => {
        return client_1.prisma.user.findUnique({
            where: { email },
        });
    },
    create: async (data) => {
        return client_1.prisma.user.create({
            data,
        });
    },
    update: async (id, data) => {
        return client_1.prisma.user.update({
            where: { id },
            data,
        });
    },
    delete: async (id) => {
        return client_1.prisma.user.delete({
            where: { id },
        });
    },
    findTeachers: async () => {
        return client_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                role: true,
                email: true,
                phone: true,
                gender: true,
                assigned_class: true,
            },
            where: { role: { in: ["Teacher", "TEACHER"] } },
        });
    },
};
//# sourceMappingURL=user-repository.js.map