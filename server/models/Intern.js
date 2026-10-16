import mongoose from "mongoose";

const internSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        match: [/^[a-zA-Z\s.'-]{2,50}$/, "Name must be 2-50 characters containing only letters, spaces, dots, or hyphens"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i, "Invalid Email address format"]
    },
    startDate: {
        type: String,
        required: [true, "Internship start date is required (YYYY-MM-DD)"],
        match: [/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"]
    },
    endDate: {
        type: String,
        required: [true, "Internship end date is required (YYYY-MM-DD)"],
        match: [/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"]
    },
    dept: {
        type: String,
        default: "General"
    },
    mentor: {
        type: String,
        default: "Unassigned"
    },
    status: {
        type: String,
        enum: ["Active", "On Leave", "Completed", "Terminated"],
        default: "Active",
    },
    attendance: { type: Number, default: 100, min: 0, max: 100 },
    score: { type: Number, default: 8.0 },
    competencies: {
        qualityOfWork: { type: Number, default: 8.5 },
        technicalExecution: { type: Number, default: 8.0 },
        communication: { type: Number, default: 7.5 },
        initiative: { type: Number, default: 8.2 },
        teamwork: { type: Number, default: 8.0 }
    },
    contact: { type: String, default: "" },
    avatar: { type: String, default: "IN" },
    feedback: {
        strengths: { type: String, default: "" },
        improvements: { type: String, default: "" },
        recommendation: { type: String, default: "" },
        mentorNotes: { type: String, default: "" },
        updatedBy: { type: String, default: "" },
        updatedAt: { type: String, default: "" }
    },
    scoreHistory: [{
        label: { type: String },
        score: { type: Number },
        benchmark: { type: Number, default: 7.5 },
        tasks: { type: Number, default: 10 }
    }]
}, { timestamps: true });

export default mongoose.model("Intern", internSchema);
