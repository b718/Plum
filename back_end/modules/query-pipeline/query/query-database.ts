import type { Product } from "@plum/types";

import { getLogger } from "../../../logger";
import type { Querier } from "../../querier/querier";

const logger = getLogger(__filename);

export async function queryEmbededUserInput(
	querier: Querier,
	embededUserInput: number[],
): Promise<Product[]> {
	logger.info(
		{ embededUserInputLength: embededUserInput.length, querierType: querier.querierType },
		"querying database with embeded user input",
	);
	return await querier.query(embededUserInput);
}
