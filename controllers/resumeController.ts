import { Request, Response, NextFunction } from "express";
import { parseResumeFile } from "../services/fileParsingService";
import { getAnalysisFromOpenAI } from "../services/openAIService";
import { clerkClient, requireAuth, getAuth } from "@clerk/express";

// interface MulterRequest extends Request {
//   file?: Express.Multer.File;
// }

// export const analyzeResume = async (
//   req: MulterRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.auth.userId;
//     if (!userId) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized: User ID not found." });
//     }
//     const resumeFile = req.file;
//     const jobDescription = req.body.jobDescription;
//     if (!resumeFile) {
//       return res.status(400).json({ error: "Resume file is required" });
//     }

//     if (
//       !jobDescription ||
//       typeof jobDescription !== "string" ||
//       jobDescription.trim() === ""
//     ) {
//       return res.status(400).json({ error: "Job description is required" });
//     }

//     const resumeText = await parseResumeFile(
//       resumeFile.buffer,
//       resumeFile.mimetype
//     );
//     const analysisResult = await getAnalysisFromOpenAI(
//       resumeText,
//       jobDescription
//     );
//     return res.json(analysisResult);
//   } catch (error: any) {
//     next(error);
//   }
// };

export const analyzeResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // console.log("request object is: ", req.body);
    // console.log("Incoming request from user:", req.auth?.userId);
    // const userId = req.auth && req.auth.userId;
    const userId = getAuth(req);
    if (!userId) {
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

    const resumeText = await parseResumeFile(
      resumeFile.buffer,
      resumeFile.mimetype
    );

    const analysisResult = await getAnalysisFromOpenAI(
      resumeText,
      jobDescription
    );

    res.json(analysisResult); // <-- DO NOT `return` this
  } catch (error: any) {
    next(error);
  }
};
