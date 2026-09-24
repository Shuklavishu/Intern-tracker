import Task from "../models/Task.js";
import Goal from "../models/Goal.js";
import Intern from "../models/Intern.js";

// Recompute and persist goal.progress based on approved tasks linked to it
// ponytail: O(n) scan over tasks for a goal — acceptable at intern scale (<1000 tasks per goal)
async function recomputeGoalProgress(goalId) {
    if (!goalId) return;
    const goal = await Goal.findById(goalId);
    if (!goal) return;

    const approvedTasks = await Task.find({ goal: goalId, status: "Approved" });
    const allLinkedTasks = await Task.find({ goal: goalId });

    if (allLinkedTasks.length === 0) {
        await Goal.findByIdAndUpdate(goalId, { progress: 0, status: "In Progress" });
        return;
    }

    const approvedHours = approvedTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
    const totalHours = goal.totalHours
        || allLinkedTasks.reduce((sum, t) => sum + (t.hours || 0), 0);

    const progress = totalHours > 0
        ? Math.min(100, Math.round((approvedHours / totalHours) * 100))
        : Math.min(100, Math.round((approvedTasks.length / allLinkedTasks.length) * 100));

    const status = progress >= 100 ? "Completed"
        : progress >= 70 ? "Needs Review"
        : "In Progress";

    await Goal.findByIdAndUpdate(goalId, { progress, status });
}

// @desc  Get tasks — Admin/Mentor see all; Intern sees only their own
// @route GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === "intern") {
            filter = { internId: req.user.internId || null, intern: req.user.name };
        }
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Intern logs a task — intern field set from JWT, never from request body
// @route POST /api/tasks  (Intern only)
export const createTask = async (req, res) => {
    try {
        if (req.user.role !== "intern") {
            return res.status(403).json({ message: "Only interns can log tasks." });
        }

        const { title, hours, date, goal } = req.body;

        // Resolve intern record from JWT identity (not client-supplied)
        const internRecord = await Intern.findOne({ email: req.user.email });

        const newTask = new Task({
            intern: req.user.name,
            internId: internRecord?._id || null,
            goal: goal || null,
            title,
            hours: Number(hours) || 4,
            date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            status: "Pending",
        });
        const saved = await newTask.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc  Approve or reject a task — Mentor/Admin only
//        After approval, recompute linked goal progress
// @route PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'." });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found." });

        // Mentor scope check — mentors may only act on interns assigned to them
        if (req.user.role === "mentor") {
            const internRecord = await Intern.findOne({ name: task.intern });
            if (!internRecord || internRecord.mentor !== req.user.name) {
                return res.status(403).json({ message: "You can only review tasks for your assigned interns." });
            }
        }

        task.status = status;
        task.reviewedBy = req.user.name;
        await task.save();

        // Recompute goal progress if this task is linked to a goal
        await recomputeGoalProgress(task.goal);

        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
