"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/", user_controller_1.userController.getAll);
router.get("/:id", user_controller_1.userController.getById);
router.patch("/:id", user_controller_1.userController.update);
router.delete("/:id", user_controller_1.userController.delete);
exports.userRoutes = router;
//# sourceMappingURL=user-routes.js.map