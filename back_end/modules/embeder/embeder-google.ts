import { GoogleGenAI } from "@google/genai";
import type { GoogleGenAI as Client } from "@google/genai";

import type { Product } from "@plum/types";

import { VECTOR_OUTPUT_SIZE } from "../../consts/embeded";
import { ErrorEmbed } from "../query-pipeline/error/error-embed";
import type { Embeder } from "./embeder";

const MODEL_NAME = "gemini-embedding-001";

export class EmbederGoogle implements Embeder {
	readonly embederType = "gemini";

	private client: Client;

	constructor() {
		this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
	}

	async embedUserInput(userInput: string): Promise<number[]> {
		try {
			const result = await this.client.models.embedContent({
				model: MODEL_NAME,
				contents: userInput,
				config: { outputDimensionality: VECTOR_OUTPUT_SIZE },
			});
			const embeddings = result.embeddings;
			if (!embeddings) {
				throw new ErrorEmbed("embeddings are empty for user input");
			}

			if (!embeddings[0]?.values) {
				throw new ErrorEmbed("embedding's values are empty for user input");
			}

			return embeddings[0].values;
		} catch (error) {
			if (error instanceof ErrorEmbed) throw error;
			throw new ErrorEmbed(error);
		}
	}

	async embedProductData(productData: Product): Promise<number[]> {
		try {
			const textToEmbed = `${productData.name}. ${productData.description}`;
			const result = await this.client.models.embedContent({
				model: MODEL_NAME,
				contents: textToEmbed,
				config: { outputDimensionality: VECTOR_OUTPUT_SIZE },
			});
			const embeddings = result.embeddings;
			if (!embeddings) {
				throw new ErrorEmbed("embeddings are empty for product data");
			}

			if (!embeddings[0]?.values) {
				throw new ErrorEmbed("embedding's values are empty for product data");
			}

			return embeddings[0].values;
		} catch (error) {
			if (error instanceof ErrorEmbed) throw error;
			throw new ErrorEmbed(error);
		}
	}
}
