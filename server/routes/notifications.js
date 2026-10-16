import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

// GET all notifications for the authenticated user
router.get("/", verifyToken, getNotifications);

// PATCH mark all as read
router.patch("/read-all", verifyToken, markAllAsRead);

// PATCH mark a specific notification as read
router.patch("/:id/read", verifyToken, markAsRead);

// DELETE a notification
router.delete("/:id", verifyToken, deleteNotification);

export default router;
