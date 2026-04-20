import { GoogleGenAI } from "@google/genai";
import type { GoogleGenAI as Client } from "@google/genai";

import { ErrorEmbed } from "../error/error-embed";
import { VECTOR_OUTPUT_SIZE } from "./const";
import type { Embeder } from "./embeder";

const MODEL_NAME = "gemini-embedding-001";

export class EmbederGoogle implements Embeder {
	readonly embederType = "gemini";

	private client: Client;

	constructor() {
		this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
	}

	async embedContent(userInput: string): Promise<number[]> {
		try {
			const result = await this.client.models.embedContent({
				model: MODEL_NAME,
				contents: userInput,
				config: { outputDimensionality: VECTOR_OUTPUT_SIZE },
			});
			const embeddings = result.embeddings;
			if (!embeddings) {
				throw new ErrorEmbed("embeddings are empty");
			}

			if (!embeddings[0]?.values) {
				throw new ErrorEmbed("embedding's values are empty");
			}

			return embeddings[0].values;
		} catch (error) {
			if (error instanceof ErrorEmbed) throw error;
			throw new ErrorEmbed(error);
		}
	}
}
