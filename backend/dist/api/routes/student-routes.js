"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const student_controller_1 = require("../controllers/student-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/", student_controller_1.studentController.getAll);
router.get("/:id", student_controller_1.studentController.getById);
router.get("/owing", student_controller_1.studentController.getAllOwingStudents);
router.get("/:id/owing", student_controller_1.studentController.getStudentOwing);
router.post("/:id/pay", student_controller_1.studentController.payStudentOwing);
router.get("/class/:classId/owing", student_controller_1.studentController.getOwingStudentsByClass);
router.get("/class/:classId", student_controller_1.studentController.getClassById);
router.post("/", student_controller_1.studentController.create);
router.put("/:id", student_controller_1.studentController.update);
router.delete("/:id", student_controller_1.studentController.delete);
exports.studentRoutes = router;
//# sourceMappingURL=student-routes.js.map