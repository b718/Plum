import pino from "pino";

import type { Transformer } from "./transformer";

const logger = pino({ name: __filename });

export async function transformUserInput(transformer: Transformer, userInput: string): Promise<string> {
	logger.info(
		{ userInput: userInput, transformerType: transformer.transformerType },
		"transforming user input",
	);
	return transformer.transformUserInput(userInput);
}
