import express from "express";
import { verifyToken, isAdmin, isAdminOrMentor } from "../middleware/auth.js";
import { getInterns, createIntern, updateIntern, deleteIntern } from "../controllers/internController.js";

const router = express.Router();

router.get("/", verifyToken, getInterns);
router.post("/", verifyToken, isAdmin, createIntern);
router.put("/:id", verifyToken, isAdminOrMentor, updateIntern);
router.delete("/:id", verifyToken, isAdmin, deleteIntern);

export default router;
