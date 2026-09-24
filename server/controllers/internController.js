import Intern from "../models/Intern.js";
import User from "../models/User.js";

// @desc Get all interns
// @route GET /api/interns
export const getInterns = async (req, res) => {
    try {
        const interns = await Intern.find().sort({ createdAt: -1 });
        res.json(interns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Add new intern (Admin Onboards Intern & Provisions Login Account)
// @route POST /api/interns
export const createIntern = async (req, res) => {
    try {
        const newIntern = new Intern(req.body);
        const savedIntern = await newIntern.save();

        // Automatically provision a User login account for the newly added intern if not existing
        if (savedIntern.email) {
            const existingUser = await User.findOne({ email: savedIntern.email.toLowerCase() });
            if (!existingUser) {
                const newUser = new User({
                    name: savedIntern.name,
                    email: savedIntern.email.toLowerCase(),
                    password: req.body.password || "password123", // Default password for new intern
                    role: "intern"
                });
                await newUser.save();
            }
        }

        res.status(201).json(savedIntern);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc Update intern profile / score / mentor
// @route PUT /api/interns/:id
export const updateIntern = async (req, res) => {
    try {
        const intern = await Intern.findById(req.params.id);
        if (!intern) return res.status(404).json({ error: "Intern not found" });

        const updateData = { ...req.body };
        if (updateData.score !== undefined && !updateData.scoreHistory) {
            const currentMonth = new Date().toLocaleString("en-US", { month: "short" });
            const history = Array.isArray(intern.scoreHistory) ? [...intern.scoreHistory] : [];
            const idx = history.findIndex((h) => h.label === currentMonth);
            const newScore = Number(Number(updateData.score).toFixed(1));

            if (idx >= 0) {
                history[idx].score = newScore;
            } else {
                history.push({
                    label: currentMonth,
                    score: newScore,
                    benchmark: 7.8,
                    tasks: 20
                });
            }
            updateData.scoreHistory = history;
        }

        const updated = await Intern.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc Delete intern
// @route DELETE /api/interns/:id
export const deleteIntern = async (req, res) => {
    try {
        const intern = await Intern.findByIdAndDelete(req.params.id);
        if (intern && intern.email) {
            // Also remove their user login account
            await User.findOneAndDelete({ email: intern.email.toLowerCase() });
        }
        res.json({ message: "Intern and associated account removed successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
