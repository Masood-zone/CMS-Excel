"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = void 0;
const settings_service_1 = require("../../services/settings-service");
const catch_async_1 = require("../../utils/catch-async");
exports.settingsController = {
    getAmount: (0, catch_async_1.catchAsync)(async (req, res) => {
        const result = await settings_service_1.settingsService.getAmount();
        res.status(200).json(result);
    }),
    createAmount: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { value } = req.body;
        const result = await settings_service_1.settingsService.createAmount(value);
        res.status(200).json(result);
    }),
    updateAmount: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { value } = req.body;
        const result = await settings_service_1.settingsService.updateAmount(value);
        res.status(200).json(result);
    }),
};
//# sourceMappingURL=settings-controller.js.map