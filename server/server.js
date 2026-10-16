import "dotenv/config";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";
import { Admin } from "./config/seedData.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await Admin();

        const server = app.listen(PORT, () => {
            console.log(`📡 IMS Backend Server running on http://localhost:${PORT}`);
        });

        // Graceful process shutdown handlers
        const gracefulShutdown = (signal) => {
            console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
            server.close(async () => {
                console.log("HTTP server closed.");
                try {
                    await mongoose.connection.close();
                    console.log("MongoDB connection closed.");
                    process.exit(0);
                } catch (dbErr) {
                    console.error("Error closing database connection:", dbErr.message);
                    process.exit(1);
                }
            });

            // Force close after 10s timeout
            setTimeout(() => {
                console.error("Graceful shutdown timeout exceeded. Forcefully exiting.");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    } catch (err) {
        console.error("❌ Failed to start server:", err.message);
        process.exit(1);
    }
};

startServer();
