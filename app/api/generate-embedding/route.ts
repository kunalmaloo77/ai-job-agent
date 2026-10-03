import { generateEmbedding } from "../../src/lib/embedding";

export async function POST(req: Request) {
  const body = await req.text();
  const embedding = await generateEmbedding(body);
  return Response.json({
    data: embedding,
  });
}
