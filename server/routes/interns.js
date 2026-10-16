import express from "express";
import { verifyToken, isAdmin, isAdminOrMentor } from "../middleware/auth.js";
import {
    getInterns,
    createIntern,
    updateInternDates,
    updateIntern,
    updateInternStatus,
    deleteIntern
} from "../controllers/internController.js";

const router = express.Router();

router.get("/", verifyToken, getInterns);
router.post("/", verifyToken, isAdmin, createIntern);
router.patch("/:id/dates", verifyToken, isAdmin, updateInternDates);
router.put("/:id", verifyToken, isAdminOrMentor, updateIntern);
router.patch("/:id/status", verifyToken, isAdminOrMentor, updateInternStatus);
router.delete("/:id", verifyToken, isAdmin, deleteIntern);

export default router;
