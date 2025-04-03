import express from "express";
import { userController } from "../controllers/user-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

// All user routes are protected
router.use(authenticate);

// User management endpoints
router.get("/", userController.getAll);
router.get("/:id", userController.getById);
router.patch("/:id", userController.update);
router.delete("/:id", userController.delete);

export const userRoutes = router;
