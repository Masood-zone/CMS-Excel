import express from "express";
import { studentController } from "../controllers/student-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.get("/", studentController.getAll);
router.get("/:id", studentController.getById);
router.get("/owing", studentController.getAllOwingStudents);
router.get("/:id/owing", studentController.getStudentOwing);
router.post("/:id/pay", studentController.payStudentOwing);
router.get("/class/:classId/owing", studentController.getOwingStudentsByClass);
router.get("/class/:classId", studentController.getClassById);
router.post("/", studentController.create);
router.put("/:id", studentController.update);
router.delete("/:id", studentController.delete);

export const studentRoutes = router;
