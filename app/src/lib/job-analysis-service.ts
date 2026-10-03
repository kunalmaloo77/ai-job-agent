import { ai } from "./gemini";
import { jobAnalysisSchema } from "./job-analysis";
import z from "zod";

/** Server-side model call shared by Route Handlers and background workers. */
export async function generateJobAnalysisText(jobDescription: string) {
  const prompt = `
Analyze the following job description and extract structured job requirements.

Rules:
- Extract information ONLY from the job description.
- Do not evaluate the candidate in this step.
- Do not use the candidate profile to infer missing job requirements.
- Do not invent or assume requirements that are not explicitly present.
- Keep responsibilities concise and specific.
- Keep every evidence field concise, maximum 1 sentence.
- evidenceFromJobDescription must explain why the corresponding skill is considered required.
- Do not repeat words, phrases, or information.
- requiredSkills should contain only mandatory or clearly expected skills.
- preferredSkills should contain only optional, preferred, nice-to-have, or bonus skills.
- If years of experience are not explicitly stated, return null.
- If education requirements are not specified, return an empty array.
- If location requirements are not specified, return an empty array.
- Do not return phrases such as "Not specified", "Implied", or "Unknown" inside arrays.
- Do not include candidate-specific statements such as "Candidate has..." or "Candidate lacks...".
- Use only information supported by the job description.

Job Description:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(jobAnalysisSchema),
    },
  });

  return response.text;
}
