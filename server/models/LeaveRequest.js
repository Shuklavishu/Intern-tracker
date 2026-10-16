import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
    intern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Intern",
        required: [true, "Intern reference is required"]
    },
    startDate: {
        type: String,
        required: [true, "Start date is required"],
        match: [/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"]
    },
    endDate: {
        type: String,
        required: [true, "End date is required"],
        match: [/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"]
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Denied"],
        default: "Pending"
    }
}, { timestamps: true });

export default mongoose.model("LeaveRequest", leaveRequestSchema);
