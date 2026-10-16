import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import { checkEmailUnique } from "../utils/checkEmail.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

// @desc Login User (Admin, Mentor, or Intern)
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const emailRegex = /^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Must explicitly select +password since select: false in User Schema
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Compare entered password with hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Generate JWT Token containing user role from DB (never chosen by user)
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Set token in HTTP-only Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        });

        // Return user info including verified DB role to frontend
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Logout User
// @route POST /api/auth/logout
export const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully." });
};

// @desc Register Staff (Mentor or Admin) — Admin only
// @route POST /api/auth/register-staff
export const registerStaff = async (req, res) => {
    try {
        const { name, email, password, role, dept, jobTitle } = req.body;

        // Accepts only the roles mentor and admin
        if (!role || (role !== "mentor" && role !== "admin")) {
            return res.status(400).json({
                error: "Invalid role. Only 'mentor' and 'admin' staff roles can be registered here."
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Name is required." });
        }
        const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
        if (!nameRegex.test(name.trim())) {
            return res.status(400).json({
                error: "Name must be 2-50 characters containing only letters, spaces, dots, or hyphens."
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is required." });
        }
        const emailRegex = /^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if an existing User, Intern, or Mentor already uses this email
        const emailCheck = await checkEmailUnique(normalizedEmail);
        if (emailCheck.isTaken) {
            return res.status(400).json({ error: emailCheck.message || "This email is already in use by another person. Email must be unique for all people." });
        }

        // Create User (password hashed via pre-save hook)
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role
        });
        await newUser.save();

        // If creating a mentor, also create the linked Mentor profile
        let createdMentorProfile = null;
        if (role === "mentor") {
            try {
                createdMentorProfile = await Mentor.create({
                    name: name.trim(),
                    email: normalizedEmail,
                    dept: dept || "Engineering",
                    role: jobTitle || "Staff Mentor"
                });
            } catch (mentorErr) {
                console.warn("Could not create linked Mentor record:", mentorErr.message);
            }
        }

        res.status(201).json({
            message: `Staff member (${role}) registered successfully.`,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
            mentor: createdMentorProfile
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "This email address is already in use by another person. Email must be unique for all people." });
        }
        res.status(500).json({ error: err.message });
    }
};
