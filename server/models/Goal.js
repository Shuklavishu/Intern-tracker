import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    // Intern display name (source of truth for filtering in frontend)
    intern: { type: String, required: true },
    // ObjectId reference for server-side queries
    internId: { type: mongoose.Schema.Types.ObjectId, ref: "Intern" },
    // Which mentor/admin set this goal
    setBy: { type: String, required: true },
    title: { type: String, required: true },
    due: { type: String, required: true },
    // Auto-calculated from Approved tasks linked to this goal — NOT manually set
    // Stored as a cache; recomputed on every task approve/reject touching this goal
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
        type: String,
        enum: ["In Progress", "Needs Review", "Completed"],
        default: "In Progress"
    },
    // Total estimated hours for this goal (optional, used for progress calculation)
    totalHours: { type: Number, default: null },
}, { timestamps: true });

export default mongoose.model("Goal", goalSchema);
