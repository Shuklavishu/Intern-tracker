import express from "express";
import { loginUser, logoutUser, registerStaff } from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public login & logout (role is strictly from DB, never accepted from request)
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Admin-only staff registration for mentors and other admins (NO public register endpoint)
router.post("/register-staff", verifyToken, isAdmin, registerStaff);

export default router;
