import pino from "pino";

import type { Embeder } from "./embeder";

const logger = pino({ name: __filename });

export async function embedUserInput(embeder: Embeder, userInput: string): Promise<number[]> {
	logger.info({ userInput: userInput, embederType: embeder.embederType }, "embedding user query");
	return embeder.embedContent(userInput);
}
