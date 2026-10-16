import LeaveRequest from "../models/LeaveRequest.js";
import Intern from "../models/Intern.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// @desc Get all leave requests (scoped: admin sees all, mentor sees own interns, intern sees own)
// @route GET /api/leaves
export const getLeaves = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "mentor") {
            const myInterns = await Intern.find({
                mentor: { $regex: new RegExp(`^${req.user.name}$`, "i") }
            }).select("_id");
            const internIds = myInterns.map((i) => i._id);
            filter = { intern: { $in: internIds } };
        } else if (req.user.role === "intern") {
            const internRecord = await Intern.findOne({
                $or: [
                    { email: req.user.email?.toLowerCase() },
                    { name: { $regex: new RegExp(`^${req.user.name}$`, "i") } }
                ]
            });
            if (!internRecord) return res.json([]);
            filter = { intern: internRecord._id };
        }

        const leaves = await LeaveRequest.find(filter)
            .populate("intern", "name email dept mentor avatar")
            .sort({ createdAt: -1 });

        const mapped = leaves.map((l) => {
            const obj = l.toObject();
            if (obj.intern && typeof obj.intern === "object") {
                obj.internName = obj.intern.name;
                obj.internId = obj.intern._id;
                obj.intern = obj.intern.name;
            }
            return obj;
        });

        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Create a leave request — Intern only
// @route POST /api/leaves
export const createLeave = async (req, res) => {
    try {
        if (req.user.role !== "intern") {
            return res.status(403).json({ error: "Only interns can submit leave requests." });
        }

        const { startDate, endDate, reason } = req.body;

        if (!startDate || !endDate || !reason?.trim()) {
            return res.status(400).json({ error: "Start date, end date, and reason are required." });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: "Dates must be in YYYY-MM-DD format." });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: "Start date cannot be after end date." });
        }

        const internRecord = await Intern.findOne({
            $or: [
                { email: req.user.email?.toLowerCase() },
                { name: { $regex: new RegExp(`^${req.user.name}$`, "i") } }
            ]
        });

        if (!internRecord) {
            return res.status(404).json({ error: "Intern profile not found." });
        }

        const newLeave = new LeaveRequest({
            intern: internRecord._id,
            startDate,
            endDate,
            reason: reason.trim(),
            status: "Pending"
        });

        const saved = await newLeave.save();
        const populated = await LeaveRequest.findById(saved._id).populate("intern", "name email dept mentor avatar");

        const obj = populated.toObject();
        obj.internName = internRecord.name;
        obj.internId = internRecord._id;
        obj.intern = internRecord.name;

        // Trigger in-app notification to assigned mentor & admin
        try {
            if (internRecord.mentor && internRecord.mentor !== "Unassigned") {
                const mentorUser = await User.findOne({
                    name: { $regex: new RegExp(`^${internRecord.mentor}$`, "i") }
                });
                if (mentorUser) {
                    await createNotification({
                        recipientEmail: mentorUser.email,
                        recipientRole: "mentor",
                        title: "Leave Request Submitted",
                        message: `${internRecord.name} submitted a leave request (${startDate} to ${endDate})`,
                        type: "leave_requested",
                        linkTab: "requests"
                    });
                }
            }
            // Admin notification
            await createNotification({
                recipientRole: "admin",
                title: "Leave Request Submitted",
                message: `${internRecord.name} requested leave (${startDate} to ${endDate})`,
                type: "leave_requested",
                linkTab: "requests"
            });
        } catch (notifErr) {
            console.error("Leave request notification error:", notifErr.message);
        }

        res.status(201).json(obj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc Approve a leave request — Admin or Mentor
//       Must NOT read or write intern.status
// @route PATCH /api/leaves/:id/approve
export const approveLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ error: "Leave request not found." });
        }

        const internRecord = await Intern.findById(leave.intern);

        // Mentor ownership check
        if (req.user.role === "mentor") {
            if (!internRecord || (internRecord.mentor || "").trim().toLowerCase() !== (req.user.name || "").trim().toLowerCase()) {
                return res.status(403).json({ error: "You can only approve leave requests for your assigned interns." });
            }
        }

        leave.status = "Approved";
        await leave.save();

        const populated = await LeaveRequest.findById(leave._id).populate("intern", "name email dept mentor avatar");
        const obj = populated.toObject();
        if (obj.intern && typeof obj.intern === "object") {
            obj.internName = obj.intern.name;
            obj.internId = obj.intern._id;
            obj.intern = obj.intern.name;
        }

        // Notify intern
        if (internRecord?.email) {
            try {
                await createNotification({
                    recipientEmail: internRecord.email,
                    recipientRole: "intern",
                    title: "Leave Request Approved",
                    message: `${req.user.name} approved your leave request (${leave.startDate} to ${leave.endDate})`,
                    type: "leave_approved",
                    linkTab: "requests"
                });
            } catch (notifErr) {
                console.error("Leave approve notification error:", notifErr.message);
            }
        }

        res.json(obj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Deny a leave request — Admin or Mentor
//       Must NOT read or write intern.status
// @route PATCH /api/leaves/:id/deny
export const denyLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ error: "Leave request not found." });
        }

        const internRecord = await Intern.findById(leave.intern);

        // Mentor ownership check
        if (req.user.role === "mentor") {
            if (!internRecord || (internRecord.mentor || "").trim().toLowerCase() !== (req.user.name || "").trim().toLowerCase()) {
                return res.status(403).json({ error: "You can only deny leave requests for your assigned interns." });
            }
        }

        leave.status = "Denied";
        await leave.save();

        const populated = await LeaveRequest.findById(leave._id).populate("intern", "name email dept mentor avatar");
        const obj = populated.toObject();
        if (obj.intern && typeof obj.intern === "object") {
            obj.internName = obj.intern.name;
            obj.internId = obj.intern._id;
            obj.intern = obj.intern.name;
        }

        // Notify intern
        if (internRecord?.email) {
            try {
                await createNotification({
                    recipientEmail: internRecord.email,
                    recipientRole: "intern",
                    title: "Leave Request Denied",
                    message: `${req.user.name} denied your leave request (${leave.startDate} to ${leave.endDate})`,
                    type: "leave_denied",
                    linkTab: "requests"
                });
            } catch (notifErr) {
                console.error("Leave deny notification error:", notifErr.message);
            }
        }

        res.json(obj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
