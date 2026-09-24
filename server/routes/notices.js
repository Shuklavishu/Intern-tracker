import express from "express";
import { verifyToken, isAdminOrMentor } from "../middleware/auth.js";
import { getNotices, createNotice } from "../controllers/noticeController.js";

const router = express.Router();

router.get("/", verifyToken, getNotices);
router.post("/", verifyToken, isAdminOrMentor, createNotice);

export default router;
