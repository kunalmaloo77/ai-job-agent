import { db } from "../db";
import { candidateEmbeddings, jobEmbeddings } from "../db/schema";
import { EMBEDDING_DIMENSIONS } from "./constants";
import { ai } from "../lib/gemini";

export async function generateEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });
  return response.embeddings?.[0]?.values ?? [];
}

export async function saveCandidateEmbeddings(
  candidateId: number,
  embedding: number[],
  content: string,
) {
  await db.insert(candidateEmbeddings).values({
    candidateId,
    content,
    embedding,
  });
}

export async function saveJobEmbeddings(
  jobId: number,
  embedding: number[],
  content: string,
) {
  await db.insert(jobEmbeddings).values({
    jobId,
    content,
    embedding,
  });
}
