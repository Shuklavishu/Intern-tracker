import express from "express";
import { verifyToken, isMentor, isAdminOrMentor } from "../middleware/auth.js";
import { getGoals, getMyGoals, createGoal, getGoalTasks, updateGoalStatus, extendGoalDueDate } from "../controllers/goalController.js";

const router = express.Router();

// GET all goals — Admin sees all (read-only); Mentor sees own interns only
router.get("/", verifyToken, getGoals);

// GET /api/goals/mine — Intern only, returns their goals with tasks attached
router.get("/mine", verifyToken, getMyGoals);

// POST /api/goals — Mentor only (Admin calling directly rejected with 403 by isMentor middleware)
router.post("/", verifyToken, isMentor, createGoal);

// PATCH /api/goals/:id/status — Mentor only (mark Completed or In Progress)
router.patch("/:id/status", verifyToken, isMentor, updateGoalStatus);

// PATCH /api/goals/:id/due-date — Mentor or Admin (extend goal due date)
router.patch("/:id/due-date", verifyToken, isAdminOrMentor, extendGoalDueDate);

// GET a goal's linked tasks
router.get("/:id/tasks", verifyToken, getGoalTasks);

export default router;
