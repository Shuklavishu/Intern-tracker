import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        match: [/^[a-zA-Z\s.'-]{2,50}$/, "Name must be 2-50 characters containing only letters, spaces, dots, or hyphens"]
    },
    dept: { type: String, required: true },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i, "Invalid Email address format"]
    },
    role: { type: String, default: "Staff Engineer" }
}, { timestamps: true });

export default mongoose.model("Mentor", mentorSchema);
