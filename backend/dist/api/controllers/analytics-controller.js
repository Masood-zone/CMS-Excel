"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("../../services/analytics-service");
const catch_async_1 = require("../../utils/catch-async");
exports.analyticsController = {
    getAdminAnalytics: (0, catch_async_1.catchAsync)(async (req, res) => {
        const analytics = await analytics_service_1.analyticsService.getAdminAnalytics();
        res.status(200).json(analytics);
    }),
    getTeacherAnalytics: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classId = Number.parseInt(req.params.classId);
        const analytics = await analytics_service_1.analyticsService.getTeacherAnalytics(classId);
        res.status(200).json(analytics);
    }),
};
//# sourceMappingURL=analytics-controller.js.map