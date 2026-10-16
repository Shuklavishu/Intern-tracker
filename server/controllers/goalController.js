import mongoose from "mongoose";
import Goal from "../models/Goal.js";
import Intern from "../models/Intern.js";
import Task from "../models/Task.js";
import Request from "../models/Request.js";
import { createNotification } from "./notificationController.js";

/**
 * Shared helper to recalculate goal progress from approved tasks.
 * Progress = (sum of hours on Approved tasks ÷ goal's targetHours) × 100, capped at 100
 * At 100, sets status to Completed, otherwise In Progress.
 */
export async function recalculateGoal(goalId) {
    if (!goalId) return null;
    const goal = await Goal.findById(goalId);
    if (!goal) return null;

    const approvedTasks = await Task.find({ goal: goalId, status: "Approved" });
    const approvedHours = approvedTasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0);

    const targetHours = Number(goal.targetHours) || 1;
    const rawProgress = (approvedHours / targetHours) * 100;
    const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));

    const status = progress >= 100 || goal.status === "Completed" ? "Completed" : "In Progress";

    goal.progress = progress;
    goal.status = status;
    await goal.save();

    return goal;
}

// @desc  Update goal status (e.g. Completed / In Progress) — Mentor only
// @route PATCH /api/goals/:id/status
export const updateGoalStatus = async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({ message: "Only mentors can update goal status." });
        }

        const { status } = req.body;
        if (!status || !["In Progress", "Completed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'In Progress' or 'Completed'." });
        }

        const goal = await Goal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: "Goal not found." });
        }

        goal.status = status;
        if (status === "Completed") {
            goal.progress = 100;
        }
        await goal.save();

        const populated = await Goal.findById(goal._id)
            .populate("intern", "name email dept mentor avatar")
            .populate("setBy", "name email role");

        const obj = populated.toObject();
        if (obj.intern && typeof obj.intern === "object") {
            obj.internName = obj.intern.name;
            obj.internId = obj.intern._id;
        }
        if (obj.setBy && typeof obj.setBy === "object") {
            obj.setByName = obj.setBy.name;
        }

        res.json(obj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Get goals — Admin sees all (read-only); Mentor sees own interns only
// @route GET /api/goals
export const getGoals = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "mentor") {
            const myInterns = await Intern.find({
                mentor: { $regex: new RegExp(`^${req.user.name}$`, "i") }
            }).select("_id");
            const internIds = myInterns.map((i) => i._id);
            filter = { intern: { $in: internIds } };
        } else if (req.user.role === "intern") {
            const internRecord = await Intern.findOne({
                $or: [
                    { email: req.user.email?.toLowerCase() },
                    { name: { $regex: new RegExp(`^${req.user.name}$`, "i") } }
                ]
            });
            if (!internRecord) return res.json([]);
            filter = { intern: internRecord._id };
        }
        // Admin: filter is empty -> all goals (read-only)

        const goals = await Goal.find(filter)
            .populate("intern", "name email dept mentor avatar")
            .populate("setBy", "name email role")
            .sort({ createdAt: -1 });

        const allInterns = await Intern.find().select("_id name");
        const internMap = new Map();
        allInterns.forEach((i) => internMap.set(String(i._id), i.name));

        // Normalize format for frontend compatibility (both g.internName and g.intern string)
        const mapped = goals.map((g) => {
            const obj = g.toObject();
            let resolvedName = "";
            let resolvedId = null;

            if (obj.intern && typeof obj.intern === "object") {
                resolvedName = obj.intern.name;
                resolvedId = obj.intern._id;
            } else if (obj.intern && internMap.has(String(obj.intern))) {
                resolvedName = internMap.get(String(obj.intern));
                resolvedId = obj.intern;
            } else if (obj.internId && internMap.has(String(obj.internId))) {
                resolvedName = internMap.get(String(obj.internId));
                resolvedId = obj.internId;
            }

            obj.internName = resolvedName || (typeof obj.intern === "string" ? obj.intern : "") || "Intern";
            obj.internId = resolvedId || obj.internId || (obj.intern?._id || obj.intern);
            obj.intern = obj.internName; // String name for table and filter matching!

            if (obj.setBy && typeof obj.setBy === "object") {
                obj.setByName = obj.setBy.name;
            }
            return obj;
        });

        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Get intern's own goals with tasks attached — Intern only
// @route GET /api/goals/mine
export const getMyGoals = async (req, res) => {
    try {
        if (req.user.role !== "intern") {
            return res.status(403).json({ message: "Only interns can access /api/goals/mine." });
        }

        const internRecord = await Intern.findOne({
            $or: [
                { email: req.user.email?.toLowerCase() },
                { name: { $regex: new RegExp(`^${req.user.name}$`, "i") } }
            ]
        });

        if (!internRecord) {
            return res.json([]);
        }

        const goals = await Goal.find({ intern: internRecord._id })
            .populate("intern", "name email dept mentor avatar")
            .populate("setBy", "name email role")
            .sort({ createdAt: -1 });

        const goalIds = goals.map((g) => g._id);
        const tasks = await Task.find({ goal: { $in: goalIds } }).sort({ createdAt: -1 });

        const goalsWithTasks = goals.map((g) => {
            const obj = g.toObject();
            obj.tasks = tasks.filter((t) => String(t.goal) === String(g._id));
            if (obj.intern && typeof obj.intern === "object") {
                obj.internName = obj.intern.name;
                obj.internId = obj.intern._id;
            }
            if (obj.setBy && typeof obj.setBy === "object") {
                obj.setByName = obj.setBy.name;
            }
            return obj;
        });

        res.json(goalsWithTasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Create a goal — Mentor only, for their own assigned interns
// @route POST /api/goals
export const createGoal = async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({ message: "Only mentors can create goals." });
        }

        const { intern: internRef, internId, title, description = "", due, targetHours, totalHours } = req.body;
        const targetHoursVal = Number(targetHours || totalHours);

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Goal title is required." });
        }
        if (!due || !due.trim()) {
            return res.status(400).json({ message: "Due date is required." });
        }
        if (!targetHoursVal || targetHoursVal <= 0) {
            return res.status(400).json({ message: "Valid targetHours (> 0) is required." });
        }

        // Resolve intern record
        const targetId = internId || internRef;
        let internRecord = null;
        if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
            internRecord = await Intern.findById(targetId);
        }
        if (!internRecord && internRef) {
            internRecord = await Intern.findOne({
                name: { $regex: new RegExp(`^${internRef}$`, "i") }
            });
        }

        if (!internRecord) {
            return res.status(404).json({ message: "Assigned intern not found." });
        }

        // Mentor scope check — Mentor may only set goals for their own assigned interns
        const isAssigned = (internRecord.mentor || "").toLowerCase() === (req.user.name || "").toLowerCase();
        if (!isAssigned) {
            return res.status(403).json({ message: "You can only set goals for your assigned interns." });
        }

        const newGoal = new Goal({
            intern: internRecord._id,
            setBy: req.user.id || req.user._id,
            title: title.trim(),
            description: description.trim(),
            due: due.trim(),
            targetHours: targetHoursVal,
            progress: 0,
            status: "In Progress"
        });

        const saved = await newGoal.save();
        const populated = await Goal.findById(saved._id)
            .populate("intern", "name email dept mentor avatar")
            .populate("setBy", "name email role");

        const obj = populated.toObject();
        obj.internName = internRecord.name;
        obj.internId = internRecord._id;
        obj.setByName = req.user.name;

        // Trigger in-app notification to intern
        if (internRecord.email) {
            try {
                await createNotification({
                    recipientEmail: internRecord.email,
                    recipientRole: "intern",
                    title: "New Goal Assigned",
                    message: `${req.user.name} assigned you a new goal: "${newGoal.title}" (Due: ${newGoal.due})`,
                    type: "goal_created",
                    linkTab: "goals"
                });
            } catch (notifErr) {
                console.error("Goal creation notification error:", notifErr.message);
            }
        }

        res.status(201).json(obj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc  Get a single goal with its linked tasks
// @route GET /api/goals/:id/tasks
export const getGoalTasks = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id)
            .populate("intern", "name email dept mentor")
            .populate("setBy", "name email");
        if (!goal) return res.status(404).json({ message: "Goal not found." });

        const tasks = await Task.find({ goal: req.params.id }).sort({ createdAt: -1 });
        res.json({ goal, tasks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Extend/update goal due date — Mentor or Admin
// @route PATCH /api/goals/:id/due-date
export const extendGoalDueDate = async (req, res) => {
    try {
        const { due } = req.body;
        if (!due || !due.trim()) {
            return res.status(400).json({ message: "Valid due date is required." });
        }

        const goal = await Goal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: "Goal not found." });
        }

        // Scope check: If mentor, ensure assigned
        if (req.user.role === "mentor") {
            const internRecord = await Intern.findById(goal.intern);
            if (internRecord && (internRecord.mentor || "").toLowerCase().trim() !== (req.user.name || "").toLowerCase().trim()) {
                return res.status(403).json({ message: "You can only extend goals for your assigned interns." });
            }
        }

        const oldDue = goal.due;
        goal.due = due.trim();
        await goal.save();

        // If there were any Pending Goal Date Extension requests for this goal, mark them Approved
        try {
            await Request.updateMany(
                {
                    $or: [
                        { goalId: goal._id, status: "Pending" },
                        { goalTitle: goal.title, status: "Pending" }
                    ]
                },
                { status: "Approved" }
            );
        } catch (rErr) {
            console.error("Error auto-updating extension requests:", rErr.message);
        }

        const populated = await Goal.findById(goal._id)
            .populate("intern", "name email dept mentor avatar")
            .populate("setBy", "name email role");

        const obj = populated.toObject();
        if (obj.intern && typeof obj.intern === "object") {
            obj.internName = obj.intern.name;
            obj.internId = obj.intern._id;
        }
        if (obj.setBy && typeof obj.setBy === "object") {
            obj.setByName = obj.setBy.name;
        }

        // Notify intern
        const internRecord = await Intern.findById(goal.intern);
        if (internRecord?.email) {
            try {
                await createNotification({
                    recipientEmail: internRecord.email,
                    recipientRole: "intern",
                    title: "Goal Deadline Extended",
                    message: `Deadline for "${goal.title}" was extended from ${oldDue} to ${goal.due}`,
                    type: "goal_extended",
                    linkTab: "goals"
                });
            } catch (notifErr) {
                console.error("Goal extension notification error:", notifErr.message);
            }
        }

        res.json(obj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
