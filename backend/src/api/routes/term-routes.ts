import express from "express";
import { termController } from "../controllers/term-controller";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

// All term routes require authentication
router.use(authenticate);

// List all terms
router.get("/", termController.getTerms);
// Get active term
router.get("/active", termController.getActiveTerm);
// Create a new term
router.post("/", termController.createTerm);
// Activate a term
router.patch("/:id/activate", termController.activateTerm);
// Deactivate a term
router.patch("/:id/deactivate", termController.deactivateTerm);
// Update a term
router.put("/:id", termController.updateTerm);
// Delete a term
router.delete("/:id", termController.deleteTerm);

export const termRoutes = router;
