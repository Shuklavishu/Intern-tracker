import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

// @desc Login User (Admin, Mentor, or Intern)
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
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

        // Generate JWT Token containing user role
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

        // Return user info including role to frontend
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
