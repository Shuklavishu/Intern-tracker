import Request from "../models/Request.js";
import Goal from "../models/Goal.js";
import Intern from "../models/Intern.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// @desc Get all requests
// @route GET /api/requests
export const getRequests = async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Submit leave/extension request
// @route POST /api/requests
export const createRequest = async (req, res) => {
    try {
        const newReq = new Request(req.body);
        const saved = await newReq.save();

        // Send notifications if it is a goal date extension request
        try {
            const internName = saved.intern || saved.internName;
            if (saved.type === "Goal Date Extension") {
                const internDoc = await Intern.findOne({
                    $or: [
                        { name: { $regex: new RegExp(`^${internName}$`, "i") } }
                    ]
                });
                if (internDoc?.mentor && internDoc.mentor !== "Unassigned") {
                    const mentorUser = await User.findOne({
                        name: { $regex: new RegExp(`^${internDoc.mentor}$`, "i") }
                    });
                    if (mentorUser?.email) {
                        await createNotification({
                            recipientEmail: mentorUser.email,
                            recipientRole: "mentor",
                            title: "Goal Date Extension Requested",
                            message: `${internName} requested a deadline extension for "${saved.goalTitle || 'Goal'}" to ${saved.extendedDate || saved.date}`,
                            type: "general",
                            linkTab: "requests"
                        });
                    }
                }
                // Admin notification
                await createNotification({
                    recipientRole: "admin",
                    title: "Goal Date Extension Requested",
                    message: `${internName} requested a deadline extension for "${saved.goalTitle || 'Goal'}" to ${saved.extendedDate || saved.date}`,
                    type: "general",
                    linkTab: "requests"
                });
            }
        } catch (notifErr) {
            console.error("Request create notification error:", notifErr.message);
        }

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc Approve or Reject request
// @route PUT /api/requests/:id/status
export const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ error: "Request not found." });
        }

        // If approved and it is a Goal Date Extension, automatically update the Goal's due date
        if (status === "Approved" && (updated.type === "Goal Date Extension" || updated.type?.toLowerCase().includes("extension"))) {
            const newDate = updated.extendedDate || updated.endDate || updated.date;
            if (newDate) {
                let updatedGoal = null;
                if (updated.goalId) {
                    updatedGoal = await Goal.findByIdAndUpdate(updated.goalId, { due: newDate }, { new: true });
                }
                if (!updatedGoal && updated.goalTitle) {
                    updatedGoal = await Goal.findOneAndUpdate({ title: updated.goalTitle }, { due: newDate }, { new: true });
                }

                if (updatedGoal) {
                    const internDoc = await Intern.findById(updatedGoal.intern);
                    if (internDoc?.email) {
                        try {
                            await createNotification({
                                recipientEmail: internDoc.email,
                                recipientRole: "intern",
                                title: "Goal Extension Approved",
                                message: `Your goal extension for "${updatedGoal.title}" was approved. New deadline: ${newDate}`,
                                type: "goal_extended",
                                linkTab: "goals"
                            });
                        } catch (notifErr) {
                            console.error("Goal extension approved notification error:", notifErr.message);
                        }
                    }
                }
            }
        } else if (status === "Rejected" && (updated.type === "Goal Date Extension" || updated.type?.toLowerCase().includes("extension"))) {
            const internName = updated.intern || updated.internName;
            const internDoc = await Intern.findOne({
                $or: [{ name: { $regex: new RegExp(`^${internName}$`, "i") } }]
            });
            if (internDoc?.email) {
                try {
                    await createNotification({
                        recipientEmail: internDoc.email,
                        recipientRole: "intern",
                        title: "Goal Extension Denied",
                        message: `Your request to extend the deadline for "${updated.goalTitle || 'Goal'}" was denied.`,
                        type: "general",
                        linkTab: "requests"
                    });
                } catch (notifErr) {
                    console.error("Goal extension denied notification error:", notifErr.message);
                }
            }
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
