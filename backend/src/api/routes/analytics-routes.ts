import express from "express";
import { analyticsController } from "../controllers/analytics-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

// GET /analytics/admin-dashboard?termId=1
router.get("/admin-dashboard", analyticsController.getAdminAnalytics);
// GET /analytics/teachers/:classId?termId=1
router.get("/teachers/:classId", analyticsController.getTeacherAnalytics);
// GET /analytics/terms - analytics for all terms
router.get("/terms", analyticsController.getAllTermsAnalytics);

export const analyticsRoutes = router;
