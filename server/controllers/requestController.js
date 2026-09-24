import Request from "../models/Request.js";

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
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
