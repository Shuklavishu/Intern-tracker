import Mentor from "../models/Mentor.js";
import User from "../models/User.js";

// @desc Get all mentors
// @route GET /api/mentors
export const getMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find().sort({ createdAt: -1 });
        res.json(mentors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Add new mentor (Admin Onboards Mentor & Provisions Login Account)
// @route POST /api/mentors
export const createMentor = async (req, res) => {
    try {
        const newMentor = new Mentor(req.body);
        const savedMentor = await newMentor.save();

        // Automatically provision a User login account for the newly added mentor if not existing
        if (savedMentor.email) {
            const existingUser = await User.findOne({ email: savedMentor.email.toLowerCase() });
            if (!existingUser) {
                const newUser = new User({
                    name: savedMentor.name,
                    email: savedMentor.email.toLowerCase(),
                    password: req.body.password || "password123", // Default password for new mentor
                    role: "mentor"
                });
                await newUser.save();
            }
        }

        res.status(201).json(savedMentor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc Delete mentor
// @route DELETE /api/mentors/:id
export const deleteMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findByIdAndDelete(req.params.id);
        if (mentor && mentor.email) {
            await User.findOneAndDelete({ email: mentor.email.toLowerCase() });
        }
        res.json({ message: "Mentor removed successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
