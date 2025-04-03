import express from "express";
import { classController } from "../controllers/class-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.get("/", classController.getAll);
router.get("/:id", classController.getById);
router.post("/", classController.create);
router.put("/:id", classController.update);
router.delete("/:id", classController.delete);
router.put("/:name/assign", classController.assignTeacher);
router.get("/:id/supervisor", classController.getClassBySupervisorId);

export const classRoutes = router;
