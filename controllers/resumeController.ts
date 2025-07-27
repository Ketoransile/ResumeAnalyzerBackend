import { Request, Response, NextFunction } from "express";
import { parseResumeFile } from "../services/fileParsingService";
import { getAnalysisFromOpenAI } from "../services/openAIService";
import { clerkClient, requireAuth, getAuth } from "@clerk/express";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { dbConnect } from "../utils/dbConnect";
import ResumeAnalysis from "../models/ResumeAnalysis";

export const getAllAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await dbConnect();
    const auth = getAuth(req);
    const userId = auth.userId;
    if (!userId) {
      return next(new Error("Unauthorized: User ID not found"));
    }
    const allAnalysis = await ResumeAnalysis.find({ userId });
    if (!allAnalysis || allAnalysis.length === 0) {
      res.status(404).json({
        success: false,
        message: "No resume analyses found",
        data: [],
      });
      return;
    }
    // console.log("ALl analysis from backend is ", allAnalysis);
    res.status(200).json({
      success: true,
      message: "User Resume analyses fetched successfully",
      data: allAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await dbConnect();
    const auth = getAuth(req);
    const userId = auth.userId;
    const analysisId = req.params.id;

    if (!userId) {
      return next(new Error("Unauthorized: User ID not found."));
    }

    const analysis = await ResumeAnalysis.findOne({
      _id: analysisId,
      userId: userId,
    });

    if (!analysis) {
      return next(
        new Error(
          "Resume analysis not found or you do not have permission to view it."
        )
      );
    }

    // console.log("analysis from backend is ", analysis);
    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await dbConnect();
    // console.log("request object is: ", req.body);
    // console.log("Incoming request from user:", req.auth?.userId);
    // const userId = req.auth && req.auth.userId;
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ error: "Unauthorized: User ID not found." });
      return;
    }

    const resumeFile = req.file;
    const jobDescription = req.body.jobDescription;

    if (!resumeFile) {
      res.status(400).json({ error: "Resume file is required" });
      return;
    }

    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      jobDescription.trim() === ""
    ) {
      res.status(400).json({ error: "Job description is required" });
      return;
    }
    const userId = auth.userId;
    const resumeCloudinaryUrl = await uploadToCloudinary(
      userId,
      resumeFile.buffer,
      resumeFile.originalname
    );
    const resumeText = await parseResumeFile(
      resumeFile.buffer,
      resumeFile.mimetype
    );

    const analysisResult = await getAnalysisFromOpenAI(
      resumeText,
      jobDescription
    );

    const newAnalysis = new ResumeAnalysis({
      userId: userId,
      resumeFileName: resumeFile.originalname,
      resumeCloudinaryUrl: resumeCloudinaryUrl,
      jobDescriptionText: jobDescription,
      overall_fit_score: analysisResult.overall_fit_score,
      keyword_match_score: analysisResult.keyword_match_score,
      experience_relevance_score: analysisResult.experience_relevance_score,
      top_matching_skills: analysisResult.top_matching_skills,
      key_qualification_gaps: analysisResult.key_qualification_gaps,
      actionable_enhancements: analysisResult.actionable_enhancements,
      tailored_summary_for_role: analysisResult.tailored_summary_for_role,
      relevant_interview_questions: analysisResult.relevant_interview_questions,
      potential_red_flags: analysisResult.potential_red_flags,
      rawAIResponse: analysisResult,
    });
    const result = await newAnalysis.save();
    // console.log(
    //   "Resume analysis and file URL saved to database for user:",
    //   userId
    // );
    console.log("Result value that saved to dataabase = ", result);
    res.json(result); // <-- DO NOT `return` this
  } catch (error: any) {
    next(error);
  }
};
