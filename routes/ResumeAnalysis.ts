import { requireAuth } from "@clerk/express";
import { Router } from "express";
import upload from "../middlewares/upload";
import {
  analyzeResume,
  getAllAnalysis,
  getSingleAnalysis,
} from "../controllers/resumeController";

const router = Router();
router.post("/analyzeResume", upload.single("resume"), analyzeResume);
router.get("/getSingleAnalysis/:id", getSingleAnalysis);
router.get("/getAllAnalyses", getAllAnalysis);
export default router;
