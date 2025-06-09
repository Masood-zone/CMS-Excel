"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherRoutes = void 0;
const express_1 = __importDefault(require("express"));
const teacher_controller_1 = require("../controllers/teacher-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/", teacher_controller_1.teacherController.getAllTeachers);
router.get("/summary", teacher_controller_1.teacherController.getTeachersWithRecordsSummary);
router.get("/:teacherId/detail", teacher_controller_1.teacherController.getTeacherRecordsDetail);
router.get("/:id", teacher_controller_1.teacherController.getTeachersById);
router.get("/:id/owing-students", teacher_controller_1.teacherController.getOwingStudentsInClass);
router.get("/:id/records", teacher_controller_1.teacherController.getTeacherRecords);
router.post("/", teacher_controller_1.teacherController.createTeacher);
router.patch("/:id", teacher_controller_1.teacherController.updateTeacher);
router.delete("/:id", teacher_controller_1.teacherController.deleteTeacher);
router.post("/:id/reset-password", teacher_controller_1.teacherController.resetPassword);
router.get("/:id/class", teacher_controller_1.teacherController.getClassBySupervisorId);
exports.teacherRoutes = router;
//# sourceMappingURL=teacher-routes.js.map