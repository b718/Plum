import { getLogger } from "../../../logger";
import type { Transformer } from "./transformer";

const logger = getLogger(__filename);

export async function transformUserInput(transformer: Transformer, userInput: string): Promise<string> {
	logger.info(
		{ userInput: userInput, transformerType: transformer.transformerType },
		"transforming user input",
	);
	return await transformer.transformUserInput(userInput);
}
