import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerativeModel as Client } from "@google/generative-ai";

import { ErrorTransform } from "../error/error-transform";
import type { Transformer } from "./transformer";

const MODEL_NAME = "gemini-3.1-flash-lite-preview";

export class TransformerGoogle implements Transformer {
	readonly transformerType = "gemini";

	private client: Client;

	constructor() {
		this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({
			model: MODEL_NAME,
		});
	}

	async transformUserInput(userInput: string): Promise<string> {
		try {
			const transformedUserInput = await this.client.generateContent(this.createPrompt(userInput));
			return transformedUserInput.response.text().trim();
		} catch (error) {
			throw new ErrorTransform(error);
		}
	}

	createPrompt(userInput: string): string {
		return `
        You are a search query optimizer for an e-commerce product search engine. 
        Extract the core product search intent from the user's input and return ONLY a concise keyword string — no explanation, no punctuation, no extra words.
        Input: "${userInput}"`;
	}
}
