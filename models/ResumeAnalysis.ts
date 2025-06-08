import mongoose, { Schema, Document } from "mongoose";

export interface IResumeAnalysis extends Document {
  userId: string;
  resumeFileName: string;
  resumeCloudinaryUrl: string;
  jobDescriptionText: string;
  analysisDate: Date;

  // Ai generated analysis fieldss
  overall_fit_score: number;
  keyword_match_score: number;
  experience_relevance_score: number;
  top_matching_skills: string[];
  key_qualification_gaps: string[];
  actionable_enhancements: string[];
  tailored_summary_for_role: string;
  relevant_interview_questions: string[];
  potential_red_flags: string[];
  rawAIResponse?: any;
}

const resumeAnalysisSchema: Schema = new Schema<IResumeAnalysis>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    resumeFileName: {
      type: String,
      required: true,
    },
    resumeCloudinaryUrl: {
      type: String,
      required: true,
    },
    jobDescriptionText: {
      type: String,
      required: true,
    },
    analysisDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    overall_fit_score: { type: Number, required: true, min: 0, max: 100 },
    keyword_match_score: { type: Number, required: true, min: 0, max: 100 },
    experience_relevance_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    top_matching_skills: { type: [String], default: [] },
    key_qualification_gaps: { type: [String], default: [] },
    actionable_enhancements: { type: [String], default: [] },
    tailored_summary_for_role: { type: String, required: true },
    relevant_interview_questions: { type: [String], default: [] },
    potential_red_flags: { type: [String], default: [] },
    rawAIResponse: { type: Schema.Types.Mixed, required: false },
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model<IResumeAnalysis>(
  "ResumeAnalysis",
  resumeAnalysisSchema
);
export default ResumeAnalysis;
