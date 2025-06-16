import express from "express";
import { importController } from "../controllers/import-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.use(authenticate);

router.post(
  "/:id/students",
  importController.uploadMiddleware,
  importController.importStudents
);

export const importRoutes = router;
