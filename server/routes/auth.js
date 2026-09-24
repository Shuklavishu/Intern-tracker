import express from "express";
import { loginUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

// Login Endpoint (For Admin, Mentors, and Interns)
router.post("/login", loginUser);

// Logout Endpoint
router.post("/logout", logoutUser);

export default router;
