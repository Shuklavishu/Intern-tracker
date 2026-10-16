import express from "express";
import { verifyToken, isMentor, isIntern } from "../middleware/auth.js";
import {
    getTasks,
    createTask,
    approveTask,
    rejectTask,
    updateTaskStatus
} from "../controllers/taskController.js";

const router = express.Router();

// GET all tasks (scoped by role in controller)
router.get("/", verifyToken, getTasks);

// POST new task — Intern only (enforced by middleware and controller)
router.post("/", verifyToken, isIntern, createTask);

// PATCH /api/tasks/:id/approve — Mentor only, scoped to own interns, recalculates goal
router.patch("/:id/approve", verifyToken, isMentor, approveTask);

// PATCH /api/tasks/:id/reject — Mentor only, scoped to own interns, recalculates goal
router.patch("/:id/reject", verifyToken, isMentor, rejectTask);

// Legacy PATCH / PUT status endpoint for backward compatibility
router.patch("/:id/status", verifyToken, isMentor, updateTaskStatus);
router.put("/:id/status", verifyToken, isMentor, updateTaskStatus);

export default router;
