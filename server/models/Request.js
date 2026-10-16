import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    intern: { type: String, required: true },
    type: { type: String, required: true }, // "Time-off / Leave", "Work From Home (WFH) / Remote Day", "Goal Date Extension"
    reason: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: "Pending" }, // "Pending", "Approved", "Rejected"
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    goalTitle: { type: String, default: "" },
    currentDueDate: { type: String, default: "" },
    extendedDate: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    internId: { type: mongoose.Schema.Types.ObjectId, ref: "Intern" },
    internName: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
