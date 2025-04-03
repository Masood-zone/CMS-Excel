"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = void 0;
const settings_repository_1 = require("../db/repositories/settings-repository");
const api_error_1 = require("../utils/api-error");
exports.settingsService = {
    getAmount: async () => {
        const setting = await settings_repository_1.settingsRepository.findByName("amount");
        return { data: setting };
    },
    createAmount: async (value) => {
        const amount = Number.parseFloat(value);
        if (isNaN(amount)) {
            throw new api_error_1.ApiError(400, "Invalid amount: must be a number");
        }
        const setting = await settings_repository_1.settingsRepository.create({
            name: "amount",
            value: amount.toString(),
        });
        return { data: setting };
    },
    updateAmount: async (value) => {
        const amount = Number.parseFloat(value);
        if (isNaN(amount)) {
            throw new api_error_1.ApiError(400, "Invalid amount: must be a number");
        }
        const setting = await settings_repository_1.settingsRepository.update("amount", amount.toString());
        return { data: setting };
    },
};
//# sourceMappingURL=settings-service.js.map