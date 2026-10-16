import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    intern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Intern"
    },
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Intern"
    },
    goal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal",
        default: null
    },
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true
    },
    hours: {
        type: Number,
        required: [true, "Hours is required"],
        min: [0.5, "Hours must be at least 0.5"]
    },
    date: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    reviewedBy: {
        type: String,
        default: null
    },
    rejectionReason: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
