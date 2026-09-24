import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    lead: { type: String, default: "Admin" }
});

export default mongoose.model("Department", departmentSchema);
