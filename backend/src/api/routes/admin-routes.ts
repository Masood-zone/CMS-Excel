import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { adminController } from "../controllers/admin-controller"

const router = express.Router()

// All admin routes are protected
router.use(authenticate)

// Admin management endpoints
router.get("/", adminController.getAdmins)
router.get("/owing-students", adminController.getAllOwingStudents) // New route for all owing students
router.get("/class/:classId/owing-students", adminController.getOwingStudentsByClass) // New route for owing students by class
router.get("/:id", adminController.getById)
router.post("/", adminController.create)
router.patch("/:id", adminController.update)
router.delete("/:id", adminController.delete)

export const adminRoutes = router
