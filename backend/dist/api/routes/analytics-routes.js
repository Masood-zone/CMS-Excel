"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controllers/analytics-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/admin-dashboard", analytics_controller_1.analyticsController.getAdminAnalytics);
router.get("/teachers/:classId", analytics_controller_1.analyticsController.getTeacherAnalytics);
exports.analyticsRoutes = router;
//# sourceMappingURL=analytics-routes.js.map