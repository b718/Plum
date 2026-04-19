import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

import type { Transformer } from "./transformer";

const MODEL_NAME = "gemini-2.5-flash-lite";

export class TransformerGoogle implements Transformer {
	readonly transformerType = "gemini";
	private client: GenerativeModel;

	constructor() {
		this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({
			model: MODEL_NAME,
		});
	}

	async transformUserInput(input: string): Promise<string> {
		const transformedUserInput = await this.client.generateContent(this.createPrompt(input));
		return transformedUserInput.response.text().trim();
	}

	createPrompt(input: string): string {
		return `
        You are a search query optimizer for an e-commerce product search engine. 
        Extract the core product search intent from the user's input and return ONLY a concise keyword string — no explanation, no punctuation, no extra words.
        Input: "${input}"`;
	}
}
