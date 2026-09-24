import mongoose from "mongoose";

const internSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    dept: { type: String, required: true },
    mentor: { type: String, default: "Unassigned" },
    status: { type: String, default: "Active" },
    score: { type: Number, default: 8.0 },
    contact: { type: String, default: "" },
    avatar: { type: String, default: "IN" },
    scoreHistory: [{
        label: { type: String },
        score: { type: Number },
        benchmark: { type: Number, default: 7.5 },
        tasks: { type: Number, default: 10 }
    }]
}, { timestamps: true });

export default mongoose.model("Intern", internSchema);
