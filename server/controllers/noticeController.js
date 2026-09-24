import Notice from "../models/Notice.js";

// @desc Get broadcast notices
// @route GET /api/notices
export const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Create a notice broadcast
// @route POST /api/notices
export const createNotice = async (req, res) => {
    try {
        const newNotice = new Notice({
            noticeId: req.body.noticeId || `N-${Math.floor(100 + Math.random() * 900)}`,
            ...req.body
        });
        const saved = await newNotice.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
