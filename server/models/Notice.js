import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    noticeId: { type: String, required: true },
    title: { type: String, required: true },
    audience: { type: String, default: "All Departments" },
    createdBy: { type: String, default: "Admin" },
    date: { type: String, default: "Today" }
}, { timestamps: true });

export default mongoose.model("Notice", noticeSchema);
