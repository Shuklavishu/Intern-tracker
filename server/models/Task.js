import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    // Intern name string (kept for display convenience; truthy source is internId)
    intern: { type: String, required: true },
    // Reference to the Intern document — set server-side from JWT, never trusted from client
    internId: { type: mongoose.Schema.Types.ObjectId, ref: "Intern" },
    // Optional link to the Goal this task rolls up into
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", default: null },
    title: { type: String, required: true },
    hours: { type: Number, default: 4, min: 0.5 },
    date: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    // Who approved/rejected (display name)
    reviewedBy: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
