"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceRepository = void 0;
const client_1 = require("../client");
exports.referenceRepository = {
    findAll: async () => {
        return client_1.prisma.reference.findMany();
    },
    findById: async (id) => {
        return client_1.prisma.reference.findUnique({
            where: { id },
        });
    },
    create: async (data) => {
        return client_1.prisma.reference.create({
            data,
        });
    },
    update: async (id, data) => {
        return client_1.prisma.reference.update({
            where: { id },
            data,
        });
    },
    delete: async (id) => {
        return client_1.prisma.reference.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=reference-repository.js.map