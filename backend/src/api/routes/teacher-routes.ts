import express from "express";
import { teacherController } from "../controllers/teacher-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.get("/", teacherController.getAllTeachers);
router.get("/summary", teacherController.getTeachersWithRecordsSummary);
router.get("/:teacherId/detail", teacherController.getTeacherRecordsDetail);
router.get("/:id", teacherController.getTeachersById);
router.get("/:id/owing-students", teacherController.getOwingStudentsInClass);
router.get("/:id/records", teacherController.getTeacherRecords);
router.post("/", teacherController.createTeacher);
router.patch("/:id", teacherController.updateTeacher);
router.delete("/:id", teacherController.deleteTeacher);
router.post("/:id/reset-password", teacherController.resetPassword);
router.get("/:id/class", teacherController.getClassBySupervisorId);

export const teacherRoutes = router;
