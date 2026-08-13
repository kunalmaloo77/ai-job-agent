import { ai } from "../lib/gemini"
export async function createEmbedding (text: string) {
	const response = await ai.models.embedContent({
		model: "gemini-embedding-2",
		contents: text 
	})
	return response.embeddings?.[0]?.values ?? [];
}

