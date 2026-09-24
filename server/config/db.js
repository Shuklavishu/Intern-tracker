import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connString = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intern_data";
        await mongoose.connect(connString, {
            dbName: "intern_data" // 👈 Explicitly target "intern_data" database in MongoDB Atlas
        });
        console.log("✅ Connected to MongoDB Database (intern_data) successfully!");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectDB;
