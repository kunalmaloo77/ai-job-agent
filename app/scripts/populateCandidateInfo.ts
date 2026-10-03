import "dotenv/config";
import { db } from "../src/db";
import { candidateEmbeddings, candidates } from "../src/db/schema";
import { candidateProfile } from "../src/lib/candidate";
import { generateEmbedding } from "../src/lib/embedding";

async function populateCandidate() {
  const candidateValues: typeof candidates.$inferInsert = {
    name: "Kunal Maloo",
    email: "kunnalmaloo@gmail.com",
    skills: candidateProfile.skills,
    preferredRoles: candidateProfile.targetRoles,
    yearsExperience: String(candidateProfile.workExperience),
    educationSummary: `${candidateProfile.education.degree} in ${candidateProfile.education.field}, ${candidateProfile.education.gradYear}`,
    preferredLocations: candidateProfile.preferredLocations,
    employmentType: [],
  };

  const [candidate] = await db
    .insert(candidates)
    .values(candidateValues)
    .returning({ id: candidates.id });

  if (!candidate) {
    throw new Error("Failed to insert candidate");
  }

  return candidate.id;
}

async function generateCandidateEmbedding() {
  return generateEmbedding(JSON.stringify(candidateProfile, null, 2));
}

async function populateCandidateEmbeddings(candidateId: number) {
  const candidateEmbeddingsValues: typeof candidateEmbeddings.$inferInsert = {
    candidateId,
    content: JSON.stringify(candidateProfile, null, 2),
    embedding: await generateCandidateEmbedding(),
  };
  await db.insert(candidateEmbeddings).values(candidateEmbeddingsValues);
}

async function main() {
  const candidateId = await populateCandidate();
  await populateCandidateEmbeddings(candidateId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
