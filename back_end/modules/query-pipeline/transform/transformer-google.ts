import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import type { Logger } from "pino";

import { getLogger } from "../../../logger";
import { ErrorTransform } from "../error/error-transform";
import config from "./config/transformer-google-config.json";
import type { Transformer } from "./transformer";

export class TransformerGoogle implements Transformer {
	readonly transformerType = "gemini";

	private client: GoogleGenerativeAI;
	private readonly logger: Logger;

	constructor() {
		if (config.models.length === 0) throw new Error("models config is empty");
		this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
		this.logger = getLogger(__filename);
	}

	async transformUserInput(userInput: string): Promise<string> {
		const retryableStatusCodes = new Set(config.retryableStatusCodes);
		try {
			for (const model of config.models) {
				try {
					const result = await this.client
						.getGenerativeModel({ model: model.name })
						.generateContent(this.createPrompt(userInput));
					this.logger.info({ model: model.name }, "successfully transformed user input");
					return result.response.text().trim();
				} catch (err) {
					if (
						!(err instanceof GoogleGenerativeAIFetchError) ||
						!err.status ||
						!retryableStatusCodes.has(err.status)
					)
						throw err;
					this.logger.warn({ model: model.name, err }, "retryable error, falling back to next model");
				}
			}
			throw new Error("user input was unable to be transformed");
		} catch (err) {
			throw new ErrorTransform(err);
		}
	}

	createPrompt(userInput: string): string {
		return `
        You are a search query optimizer for an e-commerce product search engine. 
        Extract the core product search intent from the user's input and return ONLY a concise keyword string — no explanation, no punctuation, no extra words.
        Input: "${userInput}"`;
	}
}
