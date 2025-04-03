"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const expense_controller_1 = require("../controllers/expense-controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate);
router.get("/", expense_controller_1.expenseController.getAllReferences);
router.get("/:id", expense_controller_1.expenseController.getReferenceById);
router.post("/", expense_controller_1.expenseController.createReference);
router.put("/:id", expense_controller_1.expenseController.updateReference);
router.delete("/:id", expense_controller_1.expenseController.deleteReference);
exports.referenceRoutes = router;
//# sourceMappingURL=reference-routes.js.map