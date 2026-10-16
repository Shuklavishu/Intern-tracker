import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

async function seedAdmin() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("❌ MONGODB_URI is not defined in environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log(" Connected to MongoDB for admin seeding...");

        const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase().trim();
        const adminName = process.env.ADMIN_NAME || "System Admin";
        const adminPassword = process.env.ADMIN_PASSWORD || "password123";

        // Check if the admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`ℹ️ Admin account already exists (${existingAdmin.email}). Exiting harmlessly.`);
            await mongoose.disconnect();
            process.exit(0);
        }

        // Create new Admin directly through the User model so password pre-save hash hook executes
        const newAdmin = new User({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: "admin"
        });

        await newAdmin.save();
        console.log(` First Admin account created successfully: ${newAdmin.email}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error running seedAdmin:", err.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
}

seedAdmin();
