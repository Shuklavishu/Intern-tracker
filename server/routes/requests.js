import express from "express";
import { verifyToken, isAdminOrMentor } from "../middleware/auth.js";
import { getRequests, createRequest, updateRequestStatus } from "../controllers/requestController.js";

const router = express.Router();

router.get("/", verifyToken, getRequests);
router.post("/", verifyToken, createRequest);
router.put("/:id/status", verifyToken, isAdminOrMentor, updateRequestStatus);

export default router;
