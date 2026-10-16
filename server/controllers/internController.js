import Intern from "../models/Intern.js";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import { internshipInfo, parseYMD } from "../utils/internshipInfo.js";
import { createNotification } from "./notificationController.js";
import { checkEmailUnique } from "../utils/checkEmail.js";

// @desc Get all interns (attaches computed internshipInfo on read)
// @route GET /api/interns
export const getInterns = async (req, res) => {
    try {
        let filter = {};
        if (req.user && req.user.role === "mentor") {
            filter = { mentor: { $regex: new RegExp(`^${req.user.name}$`, "i") } };
        } else if (req.user && req.user.role === "intern") {
            filter = {
                $or: [
                    { email: req.user.email?.toLowerCase() },
                    { name: { $regex: new RegExp(`^${req.user.name}$`, "i") } }
                ]
            };
        }
        const interns = await Intern.find(filter).sort({ createdAt: -1 });
        const mapped = interns.map((i) => {
            const obj = i.toObject();
            obj.internshipInfo = internshipInfo(i);
            return obj;
        });
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Add new intern (Admin only — creates User & Intern profile together; deletes User if profile fails)
// @route POST /api/interns
export const createIntern = async (req, res) => {
    try {
        const { name, email, password, startDate, endDate, dept, department, mentor, contact } = req.body;

        // Required fields: name, email, temporary password, internship start date and end date
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Intern name is required." });
        }
        const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
        if (!nameRegex.test(name.trim())) {
            return res.status(400).json({ error: "Invalid name format. Only letters, spaces, and hyphens allowed (2-50 characters)." });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Intern email is required." });
        }
        const emailRegex = /^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        if (!password || String(password).trim().length < 6) {
            return res.status(400).json({ error: "Temporary password is required (minimum 6 characters)." });
        }

        // Date validation: YYYY-MM-DD strings, valid calendar dates, endDate >= startDate
        if (!startDate || typeof startDate !== "string") {
            return res.status(400).json({ error: "Internship start date is required (YYYY-MM-DD)." });
        }
        if (!endDate || typeof endDate !== "string") {
            return res.status(400).json({ error: "Internship end date is required (YYYY-MM-DD)." });
        }

        const startParsed = parseYMD(startDate.trim());
        if (!startParsed) {
            return res.status(400).json({ error: "Invalid start date format. Must be a valid YYYY-MM-DD calendar date." });
        }

        const endParsed = parseYMD(endDate.trim());
        if (!endParsed) {
            return res.status(400).json({ error: "Invalid end date format. Must be a valid YYYY-MM-DD calendar date." });
        }

        if (endParsed.utcMs < startParsed.utcMs) {
            return res.status(400).json({ error: "End date cannot be before start date." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if an existing User, Intern, or Mentor already uses this email
        const emailCheck = await checkEmailUnique(normalizedEmail);
        if (emailCheck.isTaken) {
            return res.status(400).json({ error: emailCheck.message || "This email is already in use by another person. Email must be unique for all people." });
        }

        const internDept = (dept || department || "General").trim();

        // Intern can only be assigned to a mentor from the same department
        if (mentor && mentor !== "Unassigned") {
            const mentorDoc = await Mentor.findOne({ name: mentor.trim() });
            if (mentorDoc && mentorDoc.dept && mentorDoc.dept.toLowerCase().trim() !== internDept.toLowerCase().trim()) {
                return res.status(400).json({
                    error: `Intern can only be assigned to a mentor from the same department (${mentorDoc.dept} vs ${internDept}).`
                });
            }
        }

        // 1. Create User with role fixed to "intern"
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: String(password).trim(),
            role: "intern"
        });
        await newUser.save();

        // 2. Create linked Intern profile
        let savedIntern;
        try {
            const newIntern = new Intern({
                name: name.trim(),
                email: normalizedEmail,
                startDate: startDate.trim(),
                endDate: endDate.trim(),
                dept: dept || department || "General",
                mentor: mentor || "Unassigned",
                contact: contact ? contact.trim() : "",
                status: "Active"
            });
            savedIntern = await newIntern.save();
        } catch (profileErr) {
            // Rollback: delete just-created User so no orphaned login account is left behind
            await User.findByIdAndDelete(newUser._id);
            if (profileErr.code === 11000) {
                return res.status(400).json({ error: "This email address is already in use by another person. Email must be unique for all people." });
            }
            return res.status(400).json({ error: profileErr.message || "Failed to create intern profile." });
        }

        const resObj = savedIntern.toObject();
        resObj.internshipInfo = internshipInfo(savedIntern);
        res.status(201).json(resObj);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "This email address is already in use by another person. Email must be unique for all people." });
        }
        res.status(400).json({ error: err.message });
    }
};

// @desc Edit internship dates (Admin only — extensions/shortenings; never changes status automatically)
// @route PATCH /api/interns/:id/dates
export const updateInternDates = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || typeof startDate !== "string") {
            return res.status(400).json({ error: "Start date is required (YYYY-MM-DD)." });
        }
        if (!endDate || typeof endDate !== "string") {
            return res.status(400).json({ error: "End date is required (YYYY-MM-DD)." });
        }

        const startParsed = parseYMD(startDate.trim());
        if (!startParsed) {
            return res.status(400).json({ error: "Invalid start date. Must be a valid YYYY-MM-DD calendar date." });
        }

        const endParsed = parseYMD(endDate.trim());
        if (!endParsed) {
            return res.status(400).json({ error: "Invalid end date. Must be a valid YYYY-MM-DD calendar date." });
        }

        if (endParsed.utcMs < startParsed.utcMs) {
            return res.status(400).json({ error: "End date cannot be before start date." });
        }

        const intern = await Intern.findById(req.params.id);
        if (!intern) {
            return res.status(404).json({ error: "Intern not found." });
        }

        intern.startDate = startDate.trim();
        intern.endDate = endDate.trim();
        // Passing the end date never changes status automatically
        const updated = await intern.save();

        const resObj = updated.toObject();
        resObj.internshipInfo = internshipInfo(updated);
        res.json(resObj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc Update intern profile / score / mentor
// @route PUT /api/interns/:id
export const updateIntern = async (req, res) => {
    try {
        const emailRegex = /^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i;
        if (req.body.email && !emailRegex.test(req.body.email.trim())) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
        if (req.body.name && !nameRegex.test(req.body.name.trim())) {
            return res.status(400).json({ error: "Invalid name format. Only letters, spaces, and hyphens allowed (2-50 characters)." });
        }

        const intern = await Intern.findById(req.params.id);
        if (!intern) return res.status(404).json({ error: "Intern not found" });

        const updateData = { ...req.body };

        if (req.body.email) {
            const normalizedEmail = req.body.email.toLowerCase().trim();
            if (normalizedEmail !== (intern.email || "").toLowerCase().trim()) {
                const emailCheck = await checkEmailUnique(normalizedEmail, {
                    internId: intern._id,
                    currentEmail: intern.email
                });
                if (emailCheck.isTaken) {
                    return res.status(400).json({ error: emailCheck.message || "This email is already in use by another person. Email must be unique for all people." });
                }
                updateData.email = normalizedEmail;

                // Synchronize the linked User login account email
                if (intern.email) {
                    await User.findOneAndUpdate(
                        { email: intern.email.toLowerCase().trim() },
                        { email: normalizedEmail }
                    );
                }
            }
        }

        const effectiveDept = (updateData.dept || intern.dept || "").trim();
        const effectiveMentor = (updateData.mentor !== undefined ? updateData.mentor : intern.mentor || "").trim();

        // Intern can only be assigned to a mentor from the same department
        if (effectiveMentor && effectiveMentor !== "Unassigned") {
            const mentorDoc = await Mentor.findOne({ name: effectiveMentor });
            if (mentorDoc && mentorDoc.dept && mentorDoc.dept.toLowerCase().trim() !== effectiveDept.toLowerCase().trim()) {
                return res.status(400).json({
                    error: `Intern can only be assigned to a mentor from the same department (${mentorDoc.dept} vs ${effectiveDept}).`
                });
            }
        }

        // Admin does not have the option to evaluate interns (scores & qualitative feedback are mentor managed)
        if (req.user?.role === "admin") {
            delete updateData.score;
            delete updateData.competencies;
            delete updateData.feedback;
            delete updateData.scoreHistory;
        }

        // If dates are provided in general update, validate them
        if (updateData.startDate && updateData.endDate) {
            const startParsed = parseYMD(updateData.startDate);
            const endParsed = parseYMD(updateData.endDate);
            if (!startParsed || !endParsed || endParsed.utcMs < startParsed.utcMs) {
                return res.status(400).json({ error: "Invalid internship date range." });
            }
        }

        if (updateData.competencies && updateData.score === undefined) {
            const vals = Object.values(updateData.competencies).filter((v) => typeof v === "number");
            if (vals.length > 0) {
                updateData.score = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
            }
        }
        if (updateData.score !== undefined && !updateData.scoreHistory) {
            const currentMonth = new Date().toLocaleString("en-US", { month: "short" });
            const history = Array.isArray(intern.scoreHistory) ? [...intern.scoreHistory] : [];
            const idx = history.findIndex((h) => h.label === currentMonth);
            const newScore = Number(Number(updateData.score).toFixed(1));

            if (idx >= 0) {
                history[idx].score = newScore;
            } else {
                history.push({
                    label: currentMonth,
                    score: newScore,
                    benchmark: 7.8,
                    tasks: 20
                });
            }
            updateData.scoreHistory = history;
        }

        if (updateData.feedback) {
            updateData.feedback = {
                ...(intern.feedback ? (intern.feedback.toObject ? intern.feedback.toObject() : intern.feedback) : {}),
                ...updateData.feedback,
                updatedBy: req.user?.name || "Mentor",
                updatedAt: new Date().toISOString()
            };
            // Notify intern if mentor updated their feedback
            if (intern.email) {
                try {
                    await createNotification({
                        recipientEmail: intern.email,
                        recipientRole: "intern",
                        title: "Performance Feedback Updated",
                        message: `${req.user?.name || "Your mentor"} updated your scorecard and qualitative feedback notes.`,
                        type: "general",
                        linkTab: "evaluations"
                    });
                } catch (notifErr) {
                    console.error("Feedback notification error:", notifErr.message);
                }
            }
        }

        const updated = await Intern.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        const resObj = updated.toObject();
        resObj.internshipInfo = internshipInfo(updated);
        res.json(resObj);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "This email address is already in use by another person. Email must be unique for all people." });
        }
        res.status(400).json({ error: err.message });
    }
};

// @desc Update intern status — Admin and Mentor (with ownership check)
// @route PATCH /api/interns/:id/status
export const updateInternStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ["Active", "On Leave", "Completed", "Terminated"];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}.`
            });
        }

        const intern = await Intern.findById(req.params.id);
        if (!intern) {
            return res.status(404).json({ error: "Intern not found." });
        }

        if (req.user.role === "mentor") {
            const isAssigned = (intern.mentor || "").trim().toLowerCase() === (req.user.name || "").trim().toLowerCase();
            if (!isAssigned) {
                return res.status(403).json({ error: "You can only change status for your assigned interns." });
            }

            if (["Terminated"].includes(status)) {
                return res.status(403).json({ error: "Only admins can set status to Terminated." });
            }
        } else if (req.user.role !== "admin") {
            return res.status(403).json({ error: "You do not have permission to update intern status." });
        }

        intern.status = status;
        const updated = await intern.save();
        const resObj = updated.toObject();
        resObj.internshipInfo = internshipInfo(updated);
        res.json(resObj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc Delete intern (Interns with status Completed or Terminated must never be deleted)
// @route DELETE /api/interns/:id
export const deleteIntern = async (req, res) => {
    try {
        const intern = await Intern.findById(req.params.id);
        if (!intern) {
            return res.status(404).json({ error: "Intern not found." });
        }

        if (["Completed", "Terminated"].includes(intern.status)) {
            return res.status(400).json({
                error: "Interns with status Completed or Terminated must not be deleted. Their records are preserved for history and certificates."
            });
        }

        await Intern.findByIdAndDelete(req.params.id);
        if (intern.email) {
            await User.findOneAndDelete({ email: intern.email.toLowerCase() });
        }
        res.json({ message: "Intern and associated account removed successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
