import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import All Feature Routes
import authRoutes from "./routes/auth.js";
import internRoutes from "./routes/interns.js";
import mentorRoutes from "./routes/mentors.js";
import taskRoutes from "./routes/tasks.js";
import departmentRoutes from "./routes/departments.js";
import goalRoutes from "./routes/goals.js";
import noticeRoutes from "./routes/notices.js";
import requestRoutes from "./routes/requests.js";
import leaveRoutes from "./routes/leaves.js";
import notificationRoutes from "./routes/notifications.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

const app = express();

// Disable framework fingerprinting
app.disable("x-powered-by");

// Production Security Headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    if (process.env.NODE_ENV === "production") {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
});

// Production-hardened CORS configuration
const allowedOrigins = [
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : []),
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, same-origin SPA)
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Standardized Health Check Endpoint
const healthHandler = (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "healthy" : "degraded",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: isDbConnected ? "connected" : "disconnected"
    });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);

// Static Client Serving & SPA Fallback in Production
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath, { maxAge: "1d" }));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) return next();
        res.sendFile(path.join(distPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({
            message: "IMS Backend API is running smoothly",
            docs: "/api/health"
        });
    });
}

// 404 Handler for Unmatched API Routes
app.use("/api/*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.originalUrl} not found`
    });
});

// Centralized Unhandled Error Middleware
app.use((err, req, res, _next) => {
    console.error("Unhandled application error:", err.message);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
    });
});

export default app;
