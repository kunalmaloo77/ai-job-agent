import { cosineDistance, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { candidateEmbeddings, jobEmbeddings } from "../db/schema";

export async function getSemanticScore(candidateId: number, jobId: number) {
  const [candidate] = await db
    .select({
      embedding: candidateEmbeddings.embedding,
    })
    .from(candidateEmbeddings)
    .where(eq(candidateEmbeddings.candidateId, candidateId))
    .limit(1);

  if (!candidate?.embedding) {
    throw new Error("Candidate Embedding not found");
  }

  const similarity = sql<number>`
    1 - (${cosineDistance(jobEmbeddings.embedding, candidate.embedding)})
  `;

  const [result] = await db
    .select({
      similarity,
    })
    .from(jobEmbeddings)
    .where(eq(jobEmbeddings.jobId, jobId))
    .limit(1);

  if (!result) {
    throw new Error("Job embedding not found");
  }
  return Math.round(result.similarity * 100);
}
