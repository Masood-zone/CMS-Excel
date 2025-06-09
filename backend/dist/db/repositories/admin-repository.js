"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRepository = void 0;
const client_1 = require("../client");
exports.adminRepository = {
    findAllAdmins: async () => {
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
            where: {
                role: { in: ["SUPER_ADMIN", "ADMIN"] },
            },
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
            data: Object.assign(Object.assign({}, data), { role: "SUPER_ADMIN" }),
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
};
//# sourceMappingURL=admin-repository.js.map