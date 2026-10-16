import mongoose from "mongoose";
import Task from "../models/Task.js";
import Goal from "../models/Goal.js";
import Intern from "../models/Intern.js";
import User from "../models/User.js";
import { recalculateGoal } from "./goalController.js";
import { createNotification } from "./notificationController.js";

// @desc  Get tasks — Admin sees all; Mentor sees own assigned interns; Intern sees own only
// @route GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "mentor") {
            const myInterns = await Intern.find({
                mentor: { $regex: new RegExp(`^${req.user.name}$`, "i") }
            }).select("_id");
            const internIds = myInterns.map((i) => i._id);
            filter = {
                $or: [
                    { intern: { $in: internIds } },
                    { internId: { $in: internIds } }
                ]
            };
        } else if (req.user.role === "intern") {
            const internRecord = await Intern.findOne({
                $or: [
                    { email: req.user.email?.toLowerCase() },
                    { name: { $regex: new RegExp(`^${req.user.name}$`, "i") } }
                ]
            });
            if (!internRecord) return res.json([]);
            filter = {
                $or: [
                    { intern: internRecord._id },
                    { internId: internRecord._id }
                ]
            };
        }
        // Admin: all tasks

        const tasks = await Task.find(filter)
            .populate("intern", "name email dept mentor avatar")
            .populate("goal", "title due targetHours progress status")
            .sort({ createdAt: -1 });

        const allInterns = await Intern.find().select("_id name");
        const internMap = new Map();
        allInterns.forEach((i) => internMap.set(String(i._id), i.name));

        const mapped = tasks.map((t) => {
            const obj = t.toObject();
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
            obj.intern = obj.internName; // Keep string name for UI compatibility

            return obj;
        });

        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Intern logs a task — intern identity from JWT session, requires goalId, title, hours
//        Server verifies goal belongs to logged-in intern & rejects Completed goals
// @route POST /api/tasks (Intern only)
export const createTask = async (req, res) => {
    try {
        if (req.user.role !== "intern") {
            return res.status(403).json({ message: "Only interns can log tasks." });
        }

        // Resolve intern identity strictly from login session
        const internRecord = await Intern.findOne({
            $or: [
                { email: req.user.email?.toLowerCase() },
                { name: { $regex: new RegExp(`^${req.user.name}$`, "i") } }
            ]
        });

        if (!internRecord) {
            return res.status(404).json({ error: "Intern profile not found." });
        }

        // Only interns with status Active can log tasks
        if (internRecord.status !== "Active") {
            return res.status(403).json({ error: `You can't log tasks while your status is ${internRecord.status}.` });
        }

        const { title, hours, date, goalId, goal: goalRef } = req.body;
        const targetGoalId = goalId || goalRef;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Task title is required." });
        }

        const numHours = Number(hours);
        if (!numHours || numHours < 0.5) {
            return res.status(400).json({ error: "Valid hours (minimum 0.5) is required." });
        }

        if (!targetGoalId || !mongoose.Types.ObjectId.isValid(targetGoalId)) {
            return res.status(400).json({ error: "A valid goalId is required. Every task must belong to a goal." });
        }

        // Verify goal exists
        const goal = await Goal.findById(targetGoalId);
        if (!goal) {
            return res.status(404).json({ error: "Goal not found." });
        }

        // Verify goal belongs to the logged-in intern (Tampered request -> 404)
        if (String(goal.intern) !== String(internRecord._id)) {
            return res.status(404).json({ error: "Goal not found for this intern." });
        }

        // Reject Completed goals (Goal hits 100% -> reject new tasks server-side)
        if (goal.status === "Completed" || (goal.progress || 0) >= 100) {
            return res.status(400).json({ error: "Cannot log tasks to a completed goal." });
        }

        const newTask = new Task({
            intern: internRecord._id,
            goal: goal._id,
            title: title.trim(),
            hours: numHours,
            date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            status: "Pending",
        });

        const saved = await newTask.save();
        const populated = await Task.findById(saved._id)
            .populate("intern", "name email dept mentor avatar")
            .populate("goal", "title due targetHours progress status");

        const obj = populated.toObject();
        obj.internName = internRecord.name;
        obj.internId = internRecord._id;
        obj.intern = internRecord.name;

        // Trigger in-app notification to assigned mentor
        if (internRecord.mentor && internRecord.mentor !== "Unassigned") {
            try {
                const mentorUser = await User.findOne({
                    name: { $regex: new RegExp(`^${internRecord.mentor}$`, "i") }
                });
                if (mentorUser) {
                    await createNotification({
                        recipientEmail: mentorUser.email,
                        recipientRole: "mentor",
                        title: "New Task Submitted",
                        message: `${internRecord.name} submitted a new task: "${newTask.title}" (${numHours} hrs)`,
                        type: "task_created",
                        linkTab: "tasks"
                    });
                }
            } catch (notifErr) {
                console.error("Task submission notification error:", notifErr.message);
            }
        }

        res.status(201).json(obj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc  Approve a task — Mentor only, scoped to own assigned interns, calls recalculateGoal
// @route PATCH /api/tasks/:id/approve
export const approveTask = async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({ message: "Only mentors can approve tasks." });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found." });

        const internRecord = await Intern.findById(task.intern);
        if (!internRecord || (internRecord.mentor || "").toLowerCase() !== (req.user.name || "").toLowerCase()) {
            return res.status(403).json({ message: "You can only approve tasks for your assigned interns." });
        }

        task.status = "Approved";
        task.reviewedBy = req.user.name;
        await task.save();

        const updatedGoal = await recalculateGoal(task.goal);

        const populated = await Task.findById(task._id)
            .populate("intern", "name email dept mentor")
            .populate("goal", "title due targetHours progress status");

        const obj = populated.toObject();
        obj.internName = internRecord.name;
        obj.intern = internRecord.name;
        obj.goalProgress = updatedGoal?.progress;
        obj.goalStatus = updatedGoal?.status;

        // Trigger in-app notification to intern
        if (internRecord.email) {
            try {
                await createNotification({
                    recipientEmail: internRecord.email,
                    recipientRole: "intern",
                    title: "Task Approved",
                    message: `${req.user.name} approved your task: "${task.title}"`,
                    type: "task_approved",
                    linkTab: "tasks"
                });
            } catch (notifErr) {
                console.error("Task approve notification error:", notifErr.message);
            }
        }

        res.json(obj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc  Reject a task — Mentor only, scoped to own assigned interns, calls recalculateGoal
// @route PATCH /api/tasks/:id/reject
export const rejectTask = async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({ message: "Only mentors can reject tasks." });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found." });

        const internRecord = await Intern.findById(task.intern);
        if (!internRecord || (internRecord.mentor || "").toLowerCase() !== (req.user.name || "").toLowerCase()) {
            return res.status(403).json({ message: "You can only reject tasks for your assigned interns." });
        }

        const { reason, rejectionReason } = req.body || {};
        const resolvedReason = (reason || rejectionReason || "").trim() || "Requirements not met";

        task.status = "Rejected";
        task.reviewedBy = req.user.name;
        task.rejectionReason = resolvedReason;
        await task.save();

        const updatedGoal = await recalculateGoal(task.goal);

        const populated = await Task.findById(task._id)
            .populate("intern", "name email dept mentor")
            .populate("goal", "title due targetHours progress status");

        const obj = populated.toObject();
        obj.internName = internRecord.name;
        obj.intern = internRecord.name;
        obj.rejectionReason = resolvedReason;
        obj.goalProgress = updatedGoal?.progress;
        obj.goalStatus = updatedGoal?.status;

        // Trigger in-app notification to intern with rejection reason
        if (internRecord.email) {
            try {
                await createNotification({
                    recipientEmail: internRecord.email,
                    recipientRole: "intern",
                    title: "Task Rejected",
                    message: `${req.user.name} rejected your task: "${task.title}" (Reason: ${resolvedReason})`,
                    type: "task_rejected",
                    linkTab: "tasks",
                    rejectionReason: resolvedReason
                });
            } catch (notifErr) {
                console.error("Task reject notification error:", notifErr.message);
            }
        }

        res.json(obj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc  Legacy updateTaskStatus fallback for backwards compatibility
// @route PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res) => {
    const { status } = req.body;
    if (status === "Approved") return approveTask(req, res);
    if (status === "Rejected") return rejectTask(req, res);
    return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'." });
};
