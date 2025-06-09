"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordRoutes = void 0;
const express_1 = __importDefault(require("express"));
const record_controller_1 = require("../controllers/record-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/", record_controller_1.recordController.getAllRecords);
router.get("/dashboard-summary", record_controller_1.recordController.getDashboardSummary);
router.post("/generate-daily", record_controller_1.recordController.generateDailyRecords);
router.get("/teachers", record_controller_1.recordController.getAllTeacherSubmittedRecords);
router.get("/:classId", record_controller_1.recordController.getStudentRecordsByClassAndDate);
router.put("/:id", record_controller_1.recordController.update);
router.delete("/:id", record_controller_1.recordController.delete);
router.post("/bulk-update-status", record_controller_1.recordController.bulkUpdateStudentStatus);
router.post("/submit", record_controller_1.recordController.submitTeacherRecord);
router.get("/teacher/:teacherId", record_controller_1.recordController.getTeacherSubmittedRecords);
router.put("/:id/status", record_controller_1.recordController.updateStudentStatus);
exports.recordRoutes = router;
//# sourceMappingURL=record-routes.js.map