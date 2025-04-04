"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const settings_controller_1 = require("../controllers/settings-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/amount", settings_controller_1.settingsController.getAmount);
router.post("/amount", settings_controller_1.settingsController.createAmount);
router.patch("/amount", settings_controller_1.settingsController.updateAmount);
exports.settingsRoutes = router;
//# sourceMappingURL=settings-routes.js.map