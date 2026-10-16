import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientEmail: {
        type: String,
        lowercase: true,
        trim: true,
        index: true
    },
    recipientRole: {
        type: String, // "intern", "mentor", "admin", "all"
        default: null,
        index: true
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    },
    type: {
        type: String,
        enum: ["task_approved", "task_rejected", "task_created", "leave_requested", "leave_approved", "leave_denied", "goal_created", "goal_extended", "general"],
        default: "general"
    },
    linkTab: {
        type: String,
        default: ""
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    rejectionReason: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
