import express from "express";
import { settingsController } from "../controllers/settings-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.get("/amount", settingsController.getAmount);
router.post("/amount", settingsController.createAmount);
router.patch("/amount", settingsController.updateAmount);

export const settingsRoutes = router;
