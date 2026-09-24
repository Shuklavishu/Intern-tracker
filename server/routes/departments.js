import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { getDepartments, createDepartment } from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", verifyToken, getDepartments);
router.post("/", verifyToken, isAdmin, createDepartment);

export default router;
