import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

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
        messages: [{ role: "user", content: prompt }],
        model: model,
        temperature: 0.7,
        top_p: 1,

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
      const jsonMatch = aiResponseContent.match(/```json\n([\s\S]*?)\n```/);

      let jsonString = aiResponseContent;

      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      } else {
        console.warn(
          "AI response did not contain a '```json' markdown block. Attempting to parse as-is."
        );
      }

      parsedResult = JSON.parse(jsonString);
      return parsedResult;
    } catch (jsonError: any) {
      console.error(
        "Failed to parse AI Response as JSON (full content was):",
        aiResponseContent
      );
      console.error("JSON parsing error:", jsonError.message);
      throw new Error("AI returned an invalid JSON format.");
    }
  } catch (apiError) {
    console.error("Error calling GitHub AI inference API:", apiError);
    throw apiError;
  }
}
