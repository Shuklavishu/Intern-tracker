import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { getMentors, createMentor, deleteMentor } from "../controllers/mentorController.js";

const router = express.Router();

router.get("/", verifyToken, getMentors);
router.post("/", verifyToken, isAdmin, createMentor);
router.delete("/:id", verifyToken, isAdmin, deleteMentor);

export default router;
