import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating a user"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i, "Invalid Email address"],
        unique: true
    },
    name: {
        type: String,
        required: [true, "Name is required for creating an account"],
        trim: true,
        match: [/^[a-zA-Z\s.'-]{2,50}$/, "Name must be 2-50 characters containing only letters, spaces, dots, or hyphens"]
    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "Password should contain at least 6 characters"],
        select: false
    },
    role: {
        type: String,
        enum: ["admin", "mentor", "intern"],
        default: "intern"
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
