// Initial baseline configuration for Intern Management System

export const DEMO_USERS = {
    admin: { role: "admin", name: "Admin User", email: "admin@gmail.com" },
};

export const SEED_INTERNS = [];

export const SEED_DEPARTMENTS = [
    { id: "dept-1", name: "Engineering", description: "Backend, Frontend, and Cloud infrastructure teams.", lead: "Admin" },
    { id: "dept-2", name: "Design", description: "Product UI/UX design, design systems, and visual branding assets.", lead: "Admin" },
    { id: "dept-3", name: "Marketing", description: "Growth, content strategy, brand campaigns, and developer relations.", lead: "Admin" },
    { id: "dept-4", name: "Data", description: "Data engineering pipelines, business analytics, and machine learning models.", lead: "Admin" },
];

export const SEED_TASKS = [];
export const SEED_GOALS = [];
export const SEED_NOTICES = [];
export const SEED_REQUESTS = [];
export const SEED_MENTORS_DATA = [];
