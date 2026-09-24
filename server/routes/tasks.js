import express from "express";
import { verifyToken, isAdminOrMentor } from "../middleware/auth.js";
import { getTasks, createTask, updateTaskStatus } from "../controllers/taskController.js";

const router = express.Router();

// GET all tasks (scoped by role in controller)
router.get("/", verifyToken, getTasks);

// POST new task — Intern only (enforced in controller)
router.post("/", verifyToken, createTask);

// PATCH approve/reject — Mentor/Admin only (enforced in controller + middleware)
router.patch("/:id/status", verifyToken, isAdminOrMentor, updateTaskStatus);

// Legacy PUT alias for backward compatibility with existing frontend calls
router.put("/:id/status", verifyToken, isAdminOrMentor, updateTaskStatus);

export default router;
