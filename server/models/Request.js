import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    intern: { type: String, required: true },
    type: { type: String, required: true }, // "Time-off / Leave", "Task Extension"
    reason: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: "Pending" } // "Pending", "Approved", "Rejected"
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
