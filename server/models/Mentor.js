import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dept: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: "Staff Engineer" }
}, { timestamps: true });

export default mongoose.model("Mentor", mentorSchema);
