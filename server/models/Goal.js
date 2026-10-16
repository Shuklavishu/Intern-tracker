import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    // ObjectId ref to Intern
    intern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Intern"
    },
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Intern"
    },
    // ref to User (the mentor who created it)
    setBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Mentor creator reference is required"]
    },
    title: {
        type: String,
        required: [true, "Goal title is required"],
        trim: true
    },
    description: {
        type: String,
        default: "",
        trim: true
    },
    due: {
        type: String,
        required: [true, "Due date is required"]
    },
    // The number of approved hours that equals 100%
    targetHours: {
        type: Number,
        required: [true, "Target hours is required"],
        min: [0.5, "Target hours must be at least 0.5"]
    },
    // 0-100, auto-calculated, never typed by hand
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ["In Progress", "Completed"],
        default: "In Progress"
    }
}, { timestamps: true });

export default mongoose.model("Goal", goalSchema);
