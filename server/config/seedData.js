import User from "../models/User.js";
import Department from "../models/Department.js";
import Mentor from "../models/Mentor.js";
import Intern from "../models/Intern.js";
import Task from "../models/Task.js";
import Goal from "../models/Goal.js";
import Notice from "../models/Notice.js";
import Request from "../models/Request.js";

// Only Seed Admin. Interns and Mentors are registered exclusively by the Admin.
export const Admin = async () => {
    try {
        const defaultAdmins = [
            {
                name: process.env.ADMIN_NAME || "System Admin",
                email: (process.env.ADMIN_EMAIL || "admin@yourcompany.com").toLowerCase(),
                password: process.env.ADMIN_PASSWORD || "YourSecretPassword123",
                role: "admin",
            },
            {
                name: "Admin User",
                email: "admin@gmail.com",
                password: "admin123",
                role: "admin",
            },
        ];

        for (const admin of defaultAdmins) {
            const exists = await User.findOne({ email: admin.email });
            if (!exists) {
                await User.create(admin);
                console.log(`🛡️ Seeded admin account: ${admin.email}`);
            }
        }

        // Clean up any previously seeded mock data (so only admin-registered interns/mentors exist)
        const mockEmails = [
            "aisha@gmail.com",
            "devon@gmail.com",
            "wei@gmail.com",
            "sofia@gmail.com",
            "marcus@gmail.com",
            "rohan@gmail.com",
            "priya@gmail.com",
            "ananya@gmail.com"
        ];
        await Intern.deleteMany({ email: { $in: mockEmails } });
        await Mentor.deleteMany({ email: { $in: mockEmails } });
        await User.deleteMany({ email: { $in: mockEmails } });
        await Task.deleteMany({ intern: { $in: ["Aisha Khan", "Devon Marsh", "Wei Lin", "Sofia Torres", "Marcus Obi"] } });
        await Goal.deleteMany({ intern: { $in: ["Aisha Khan", "Devon Marsh", "Wei Lin", "Sofia Torres", "Marcus Obi"] } });
        await Request.deleteMany({ intern: { $in: ["Aisha Khan", "Devon Marsh", "Wei Lin", "Sofia Torres", "Marcus Obi"] } });

        // Ensure baseline organizational departments exist
        const deptCount = await Department.countDocuments();
        if (deptCount === 0) {
            await Department.insertMany([
                { name: "Engineering", description: "Backend, Frontend, and Cloud infrastructure teams.", lead: "Admin" },
                { name: "Design", description: "Product UI/UX design, design systems, and visual branding.", lead: "Admin" },
                { name: "Marketing", description: "Growth, content strategy, brand campaigns, and developer relations.", lead: "Admin" },
                { name: "Data", description: "Data engineering pipelines, business analytics, and machine learning.", lead: "Admin" },
            ]);
            console.log("🏢 Initialized default departments.");
        }
    } catch (err) {
        console.error("Error initializing seed data:", err.message);
    }
};
