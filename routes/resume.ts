import { requireAuth } from "@clerk/express";
import { Router } from "express";
import upload from "../middlewares/upload";
import { analyzeResume } from "../controllers/resumeController";

const router = Router();
router.post("/analyzeResume", upload.single("resume"), analyzeResume);
export default router;
