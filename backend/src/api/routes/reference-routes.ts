import express from "express";
import { expenseController } from "../controllers/expense-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.get("/", expenseController.getAllReferences);
router.get("/:id", expenseController.getReferenceById);
router.post("/", expenseController.createReference);
router.put("/:id", expenseController.updateReference);
router.delete("/:id", expenseController.deleteReference);

export const referenceRoutes = router;
