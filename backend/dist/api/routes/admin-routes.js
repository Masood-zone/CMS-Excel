"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../../middlewares/authenticate");
const admin_controller_1 = require("../controllers/admin-controller");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/", admin_controller_1.adminController.getAdmins);
router.get("/owing-students", admin_controller_1.adminController.getAllOwingStudents);
router.get("/class/:classId/owing-students", admin_controller_1.adminController.getOwingStudentsByClass);
router.get("/:id", admin_controller_1.adminController.getById);
router.post("/", admin_controller_1.adminController.create);
router.patch("/:id", admin_controller_1.adminController.update);
router.delete("/:id", admin_controller_1.adminController.delete);
exports.adminRoutes = router;
//# sourceMappingURL=admin-routes.js.map