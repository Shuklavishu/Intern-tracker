import Goal from "../models/Goal.js";
import Intern from "../models/Intern.js";
import Task from "../models/Task.js";

// @desc  Get goals — Admin sees all; Mentor sees goals for their interns; Intern sees only theirs
// @route GET /api/goals
export const getGoals = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === "intern") {
            filter = { intern: req.user.name };
        } else if (req.user.role === "mentor") {
            const myInterns = await Intern.find({ mentor: req.user.name }).select("name");
            const names = myInterns.map((i) => i.name);
            filter = { intern: { $in: names } };
        }
        const goals = await Goal.find(filter).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Create a goal — Mentor/Admin only. Mentor can only target their own assigned interns.
// @route POST /api/goals
export const createGoal = async (req, res) => {
    try {
        const { intern: internName, title, due, totalHours } = req.body;

        if (!internName || !title || !due) {
            return res.status(400).json({ message: "intern, title, and due are required." });
        }

        // Mentor scope check
        if (req.user.role === "mentor") {
            const internRecord = await Intern.findOne({ name: internName });
            if (!internRecord || internRecord.mentor !== req.user.name) {
                return res.status(403).json({ message: "You can only set goals for your assigned interns." });
            }
        }

        const internRecord = await Intern.findOne({ name: internName });

        const newGoal = new Goal({
            intern: internName,
            internId: internRecord?._id || null,
            setBy: req.user.name,
            title,
            due,
            totalHours: totalHours ? Number(totalHours) : null,
            progress: 0,
            status: "In Progress",
        });

        const saved = await newGoal.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc  Get a single goal with its linked tasks (for detail view)
// @route GET /api/goals/:id/tasks
export const getGoalTasks = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: "Goal not found." });

        const tasks = await Task.find({ goal: req.params.id }).sort({ createdAt: -1 });
        res.json({ goal, tasks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc  Mentor/Admin can mark goal status (e.g. "Needs Review") — progress is read-only (auto-calculated)
// @route PATCH /api/goals/:id/status
export const updateGoalStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["In Progress", "Needs Review", "Completed"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
        }

        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: "Goal not found." });

        if (req.user.role === "mentor") {
            const internRecord = await Intern.findOne({ name: goal.intern });
            if (!internRecord || internRecord.mentor !== req.user.name) {
                return res.status(403).json({ message: "You can only update goals for your assigned interns." });
            }
        }

        goal.status = status;
        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
