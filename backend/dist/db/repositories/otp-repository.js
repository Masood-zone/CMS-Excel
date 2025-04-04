"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpRepository = void 0;
const client_1 = require("../client");
exports.otpRepository = {
    findByCode: async (code) => {
        return client_1.prisma.otpCodes.findFirst({
            where: { code },
        });
    },
    findByUserId: async (userId) => {
        return client_1.prisma.otpCodes.findFirst({
            where: { userId },
        });
    },
    create: async (data) => {
        return client_1.prisma.otpCodes.create({
            data,
        });
    },
    update: async (id, data) => {
        return client_1.prisma.otpCodes.update({
            where: { id },
            data,
        });
    },
};
//# sourceMappingURL=otp-repository.js.map