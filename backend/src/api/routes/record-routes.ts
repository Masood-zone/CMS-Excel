import express from "express";
import { recordController } from "../controllers/record-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.get("/", recordController.getAllRecords);
router.get("/dashboard-summary", recordController.getDashboardSummary);
router.post("/generate-daily", recordController.generateDailyRecords);
router.get("/teachers", recordController.getAllTeacherSubmittedRecords);
router.get("/:classId", recordController.getStudentRecordsByClassAndDate);
router.put("/:id", recordController.update);
router.delete("/:id", recordController.delete);
router.post("/bulk-update-status", recordController.bulkUpdateStudentStatus);
router.post("/submit", recordController.submitTeacherRecord);
router.get("/teacher/:teacherId", recordController.getTeacherSubmittedRecords);
router.put("/:id/status", recordController.updateStudentStatus);

export const recordRoutes = router;
