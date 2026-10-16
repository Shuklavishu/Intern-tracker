import express from "express";
import { verifyToken, isAdminOrMentor } from "../middleware/auth.js";
import { getLeaves, createLeave, approveLeave, denyLeave } from "../controllers/leaveController.js";

const router = express.Router();

router.get("/", verifyToken, getLeaves);
router.post("/", verifyToken, createLeave);
router.patch("/:id/approve", verifyToken, isAdminOrMentor, approveLeave);
router.patch("/:id/deny", verifyToken, isAdminOrMentor, denyLeave);

export default router;
