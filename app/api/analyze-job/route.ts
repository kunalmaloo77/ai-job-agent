import { candidateProfile } from "@/app/src/lib/candidate";
import { ai } from "@/app/src/lib/gemini";
import { jobAnalysisSchema } from "@/app/src/lib/job-analysis";
import z from "zod";

export async function POST(req: Request) {
  const { job_description } = await req.json();

  const prompt = `
  You are evaluating a candidate for a software engineering position.
  Your job is to objectively determine how well the candidate matches
  the job description.

  Candidate Profile
  ${JSON.stringify(candidateProfile, null, 2)}

  Job Description
  ${job_description}
  `;

  // AI analysis here
  const aiResponse = await ai.models.generateContent({
    model: "models/gemma-4-26b-a4b-it",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(jobAnalysisSchema),
    },
  });

  const embededJD = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: job_description
  })


  const responseText = aiResponse.text;

  if (!responseText) {
    return Response.json({ error: "Gemini returned no text" }, { status: 500 });
  }

  const result = jobAnalysisSchema.parse(JSON.parse(responseText));

  return Response.json({
    data: result,
  });
}
