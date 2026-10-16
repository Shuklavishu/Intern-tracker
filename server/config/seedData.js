import Department from "../models/Department.js";

// Seed baseline organizational data on server startup.
// Admin accounts are created separately via seedAdmin.js (run once manually).
export const Admin = async () => {
    try {
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
