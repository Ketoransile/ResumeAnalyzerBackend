import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN; // Make sure this token is loaded correctly via dotenv
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1"; // The model you want to use

export async function getAnalysisFromOpenAI(
  resumeText: string,
  jobDescription: string
): Promise<any> {
  // Ensure token is available
  if (token === undefined) {
    throw new Error(
      "GITHUB_TOKEN environment variable is not set. Please set it in your .env file."
    );
  }

  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  //   const prompt = `As an expert HR Analyst specializing in recruitment and AI-driven candidate assessment, your objective is to meticulously evaluate a provided resume against a given job description. Your analysis must be comprehensive, insightful, and actionable, designed to equip the candidate with precise feedback for optimizing their application.

  // **Resume:**
  // ${resumeText}

  // **Job Description:**
  // ${jobDescription}

  // Deliver your analysis in a structured JSON object with the following specific keys and their corresponding value types. Adhere strictly to the JSON format.

  // {
  //   "overall_fit_score": number, // Percentage (0-100) indicating the strategic alignment with the job requirements.
  //   "core_competencies_matched": string[], // List of essential skills/competencies explicitly found in the resume matching the job description.
  //   "gaps_in_qualifications": string[], // Key requirements or preferred qualifications from the job description not evident in the resume.
  //   "resume_enhancements": string[], // Specific, actionable recommendations to tailor the resume more effectively for this role, including phrasing, data points, or structural changes.
  //   "tailored_profile_summary": string, // A compelling 3-4 sentence professional summary, extracted from the resume and optimized for this specific job description's context.
  //   "potential_interview_questions": string[], // 2-3 behavioral or technical questions derived from any gaps or areas needing clarification in the resume relative to the JD.
  //   "red_flags_or_concerns": string[] // (Optional) Any potential red flags (e.g., unexplained gaps, inconsistent roles, overly generic statements) that an HR manager might notice. Return an empty array if none.
  // }
  // `;
  const prompt = `As a highly meticulous and unbiased **AI-powered HR Analyst and resume optimization expert**, your primary objective is to conduct a thorough and objective evaluation of a given candidate's resume against a specific job description. Your analysis must be **data-driven, actionable, and strictly adhere to the requested JSON output format**. Provide insights that empower the candidate to significantly enhance their application for this particular role.

---
**Candidate's Resume Text:**
${resumeText}

---
**Target Job Description Text:**
${jobDescription}

---
**Instructions for Analysis and JSON Output:**

Generate a JSON object with the following keys and strictly adhere to their specified data types. Ensure the output is *only* the JSON object, without any preamble, conversational text, or markdown formatting outside the JSON block. If a specific data point is not applicable or cannot be determined (e.g., no red flags), return an **empty array** for lists or 'null' for a single value (e.g., if a score cannot be accurately determined due to insufficient input).

{
  "overall_fit_score": number, // A comprehensive percentage (0-100) indicating the strategic alignment of the entire resume with the job's core requirements.
  "keyword_match_score": number, // A percentage (0-100) reflecting how many key terms, technologies, and specific skills explicitly mentioned in the job description are present in the resume. This is a direct keyword count.
  "experience_relevance_score": number, // A percentage (0-100) evaluating how well the candidate's work history (e.g., years of experience, types of roles, industries, achievements) directly aligns with the experience requirements stated in the job description.
  "top_matching_skills": string[], // List 5-7 most relevant hard and soft skills directly found in the resume that strongly align with the job description.
  "key_qualification_gaps": string[], // Identify 3-5 critical requirements (skills, experience, qualifications) from the job description that are noticeably absent or poorly highlighted in the resume.
  "actionable_enhancements": string[], // Provide 3-5 highly specific, actionable recommendations for improving the resume's content, phrasing, and structure to better target this job. Include examples where beneficial. Focus solely on resume content, not general career advice.
  "tailored_summary_for_role": string, // A concise, professional summary (3-4 sentences) of the candidate, crafted specifically to highlight their suitability and key strengths for *this exact job description*.
  "relevant_interview_questions": string[], // Formulate 2-3 targeted interview questions (mix of behavioral and technical) based on areas where the resume could be strengthened or where further clarification relative to the job description would be beneficial.
  "potential_red_flags": string[] // List any 1-3 significant and demonstrable "red flags" or concerns (e.g., unexplained employment gaps > 6 months, inconsistent dates, overly generic statements without specific achievements) that an HR manager would likely identify. Return an empty array if no clear red flags are present.
}`;
  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          // Removed the empty system message, as your user prompt contains all instructions.
          { role: "user", content: prompt },
        ],
        model: model,
        temperature: 0.7, // Set to 0.7 for consistency, as per your commented OpenAI setup
        top_p: 1,
        // Crucial for getting JSON output if supported by this endpoint, mirroring OpenAI's API
        // If this exact parameter name doesn't work, this specific endpoint might not support it.
        // In that case, relying purely on prompt engineering and regex extraction is necessary.
        response_format: { type: "json_object" },
      },
    });

    if (isUnexpected(response)) {
      console.error(
        "Unexpected error from GitHub AI inference:",
        response.body.error
      );
      throw new Error(
        `GitHub AI inference error: ${
          response.body.error.message || "Unknown error"
        }`
      );
    }

    const aiResponseContent = response.body.choices[0]?.message?.content;

    if (!aiResponseContent) {
      console.error("AI response content is empty or null.");
      throw new Error("AI did not return content.");
    }

    let parsedResult: any;
    try {
      // Use a regular expression to extract the JSON string from the markdown block.
      // This handles cases where the AI wraps the JSON in ```json ... ```
      const jsonMatch = aiResponseContent.match(/```json\n([\s\S]*?)\n```/);

      let jsonString = aiResponseContent; // Default to raw content

      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1]; // Use the content inside the markdown block
      } else {
        // Fallback: If no markdown block, assume the content is already pure JSON.
        // Log a warning if you always expect markdown, to help debugging if format changes.
        console.warn(
          "AI response did not contain a '```json' markdown block. Attempting to parse as-is."
        );
      }

      parsedResult = JSON.parse(jsonString); // Parse the cleaned string
      return parsedResult;
    } catch (jsonError: any) {
      console.error(
        "Failed to parse AI Response as JSON (full content was):",
        aiResponseContent
      ); // Log the full content for debugging
      console.error("JSON parsing error:", jsonError.message);
      throw new Error("AI returned an invalid JSON format.");
    }
  } catch (apiError) {
    console.error("Error calling GitHub AI inference API:", apiError);
    // Re-throw to be caught by the higher-level error handler (e.g., in resumeController)
    throw apiError;
  }
}
