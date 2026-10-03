import { db } from "@/app/src/db";
import { candidates, jobs } from "@/app/src/db/schema";
import { generateEmbedding, saveJobEmbeddings } from "@/app/src/lib/embedding";
import { generateJobAnalysisText } from "@/app/src/lib/job-analysis-service";
import { jobAnalysisSchema } from "@/app/src/lib/job-analysis";
import { getSemanticScore } from "@/app/src/lib/jobMatching";

export async function POST(req: Request) {
  let jobDescription: unknown;

  try {
    const body = await req.json();
    jobDescription = body.job_description;
  } catch {
    return Response.json(
      { error: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    return Response.json(
      { error: "job_description is required" },
      { status: 400 },
    );
  }

  try {
    const responseText = await generateJobAnalysisText(jobDescription);
    if (!responseText) {
      return Response.json(
        { error: "Gemini returned no text" },
        { status: 400 },
      );
    }

    const result = jobAnalysisSchema.parse(JSON.parse(responseText));

    const jobValues: typeof jobs.$inferInsert = {
      role: result.role,
      seniority: result.seniority,
      requiredSkills: result.requiredSkills,
      minimumYearsOfExperience: result.minimumYearsOfExperience,
      educationRequirements: result.educationRequirements,
      locationRequirements: result.locationRequirements,
    };

    const jobInfo = await db
      .insert(jobs)
      .values(jobValues)
      .returning({ jobId: jobs.id });

    const jobId = jobInfo[0]?.jobId;

    if (!jobId) {
      return Response.json(
        { error: "Failed to save job analysis" },
        { status: 500 },
      );
    }

    const [embededJD, candidateInfo] = await Promise.all([
      generateEmbedding(responseText),
      db.select({ candidateId: candidates.id }).from(candidates),
    ]);

    await saveJobEmbeddings(jobId, embededJD, jobDescription);

    const candidateId = candidateInfo[0]?.candidateId;

    if (!candidateId) {
      return Response.json(
        { error: "Candidate profile is not seeded" },
        { status: 500 },
      );
    }

    const score = await getSemanticScore(candidateId, jobId);

    return Response.json({
      data: score,
    });
  } catch (error) {
    console.error("Failed to analyze job:", error);
    return Response.json({ error: "Failed to analyze job" }, { status: 500 });
  }
}
