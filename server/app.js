import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import All Feature Routes
import authRoutes from "./routes/auth.js";
import internRoutes from "./routes/interns.js";
import mentorRoutes from "./routes/mentors.js";
import taskRoutes from "./routes/tasks.js";
import departmentRoutes from "./routes/departments.js";
import goalRoutes from "./routes/goals.js";
import noticeRoutes from "./routes/notices.js";
import requestRoutes from "./routes/requests.js";

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/requests", requestRoutes);

// Base Health Check Endpoint
app.get("/", (req, res) => {
    res.send("IMS Backend API is running smoothly!");
});

export default app;
