"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRepository = void 0;
const client_1 = require("../client");
exports.settingsRepository = {
    findByName: async (name) => {
        return client_1.prisma.settings.findFirst({
            where: { name },
        });
    },
    create: async (data) => {
        return client_1.prisma.settings.create({
            data,
        });
    },
    update: async (name, value) => {
        return client_1.prisma.settings.updateMany({
            where: { name },
            data: { value },
        });
    },
};
//# sourceMappingURL=settings-repository.js.map