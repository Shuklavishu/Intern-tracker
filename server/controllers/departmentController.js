import Department from "../models/Department.js";

// @desc Get all departments
// @route GET /api/departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Create department
// @route POST /api/departments
export const createDepartment = async (req, res) => {
    try {
        const newDept = new Department(req.body);
        const saved = await newDept.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
