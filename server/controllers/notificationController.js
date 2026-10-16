import Notification from "../models/Notification.js";

/**
 * Internal helper to create a notification from any controller
 */
export async function createNotification({
    recipientEmail = null,
    recipientRole = null,
    title,
    message,
    type = "general",
    linkTab = "",
    rejectionReason = ""
}) {
    try {
        if (!title || !message) return null;
        const notif = new Notification({
            recipientEmail: recipientEmail ? recipientEmail.trim().toLowerCase() : null,
            recipientRole: recipientRole || null,
            title: title.trim(),
            message: message.trim(),
            type,
            linkTab,
            rejectionReason
        });
        return await notif.save();
    } catch (err) {
        console.error("Failed to create notification:", err.message);
        return null;
    }
}

// @desc Get user notifications (scoped to logged-in user email or role)
// @route GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const userEmail = (req.user?.email || "").trim().toLowerCase();
        const userRole = (req.user?.role || "").trim().toLowerCase();

        const query = {
            $or: [
                ...(userEmail ? [{ recipientEmail: userEmail }] : []),
                ...(userRole ? [{ recipientRole: userRole }] : []),
                { recipientRole: "all" }
            ]
        };

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Mark a notification as read
// @route PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ error: "Notification not found." });
        }
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Mark all notifications for the user as read
// @route PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
    try {
        const userEmail = (req.user?.email || "").trim().toLowerCase();
        const userRole = (req.user?.role || "").trim().toLowerCase();

        const query = {
            read: false,
            $or: [
                ...(userEmail ? [{ recipientEmail: userEmail }] : []),
                ...(userRole ? [{ recipientRole: userRole }] : []),
                { recipientRole: "all" }
            ]
        };

        const result = await Notification.updateMany(query, { read: true });
        res.json({ message: "All notifications marked as read.", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Delete a notification
// @route DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
    try {
        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Notification not found." });
        }
        res.json({ message: "Notification deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
