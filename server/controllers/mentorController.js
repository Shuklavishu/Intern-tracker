import Mentor from "../models/Mentor.js";
import User from "../models/User.js";
import { checkEmailUnique } from "../utils/checkEmail.js";

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
        const emailRegex = /^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i;
        if (!req.body.email || !emailRegex.test(req.body.email.trim())) {
            return res.status(400).json({ error: "Invalid or missing email address." });
        }

        const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
        if (req.body.name && !nameRegex.test(req.body.name.trim())) {
            return res.status(400).json({ error: "Invalid name format. Only letters, spaces, and hyphens allowed (2-50 characters)." });
        }

        const normalizedEmail = req.body.email.toLowerCase().trim();
        const emailCheck = await checkEmailUnique(normalizedEmail);
        if (emailCheck.isTaken) {
            return res.status(400).json({ error: emailCheck.message || "This email is already in use by another person. Email must be unique for all people." });
        }

        const newMentor = new Mentor({
            ...req.body,
            email: normalizedEmail
        });
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
        if (err.code === 11000) {
            return res.status(400).json({ error: "This email address is already in use by another person. Email must be unique for all people." });
        }
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
