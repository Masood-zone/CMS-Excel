import express from "express";
import { analyticsController } from "../controllers/analytics-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.get("/admin-dashboard", analyticsController.getAdminAnalytics);
router.get("/teachers/:classId", analyticsController.getTeacherAnalytics);

export const analyticsRoutes = router;
