"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRoutes = void 0;
const express_1 = __importDefault(require("express"));
const class_controller_1 = require("../controllers/class-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/", class_controller_1.classController.getAll);
router.get("/:id", class_controller_1.classController.getById);
router.post("/", class_controller_1.classController.create);
router.put("/:id", class_controller_1.classController.update);
router.delete("/:id", class_controller_1.classController.delete);
router.put("/:name/assign", class_controller_1.classController.assignTeacher);
router.get("/:id/supervisor", class_controller_1.classController.getClassBySupervisorId);
exports.classRoutes = router;
//# sourceMappingURL=class-routes.js.map