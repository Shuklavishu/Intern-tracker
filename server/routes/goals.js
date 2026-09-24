import express from "express";
import { verifyToken, isAdminOrMentor } from "../middleware/auth.js";
import { getGoals, createGoal, getGoalTasks, updateGoalStatus } from "../controllers/goalController.js";

const router = express.Router();

// GET all goals (scoped by role in controller)
router.get("/", verifyToken, getGoals);

// POST new goal — Mentor/Admin only
router.post("/", verifyToken, isAdminOrMentor, createGoal);

// GET a goal's tasks (rollup view)
router.get("/:id/tasks", verifyToken, getGoalTasks);

// PATCH goal status — Mentor/Admin only (progress is auto-calculated, NOT patchable here)
router.patch("/:id/status", verifyToken, isAdminOrMentor, updateGoalStatus);

// Legacy PUT /progress alias — now returns 405 to prevent interns from manually setting progress
router.put("/:id/progress", verifyToken, (req, res) => {
    if (req.user.role === "intern") {
        return res.status(403).json({ message: "Interns cannot manually update goal progress. Progress is calculated from approved tasks." });
    }
    // For admin/mentor: redirect to status update instead
    return res.status(400).json({ message: "Use PATCH /api/goals/:id/status to update goal status. Progress is auto-calculated from approved tasks." });
});

export default router;
