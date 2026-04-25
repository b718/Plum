import { getLogger } from "../../../logger";
import type { Embeder } from "../../embeder/embeder";

const logger = getLogger(__filename);

export async function embedUserInput(embeder: Embeder, userInput: string): Promise<number[]> {
	logger.info({ userInput: userInput, embederType: embeder.embederType }, "embedding user query");
	return await embeder.embedUserInput(userInput);
}
