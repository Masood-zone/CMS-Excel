import express from "express";
import { expenseController } from "../controllers/expense-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

// Expense routes
router.get("/", expenseController.getAllExpenses);
router.get("/:id", expenseController.getExpenseById);
router.post("/", expenseController.createExpense);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

// Reference routes
router.get("/", expenseController.getAllReferences);
router.get("/:id", expenseController.getReferenceById);
router.post("/", expenseController.createReference);
router.put("/:id", expenseController.updateReference);
router.delete("/:id", expenseController.deleteReference);

export const expenseRoutes = router;
