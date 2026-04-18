import { sleep } from "bun";

import type { SearchQuery } from "@plum/types";

export async function transformUserInput(
  input: SearchQuery,
): Promise<SearchQuery> {
  // mock: real impl would call an LLM to extract intent/keywords
  await sleep(1000);
  return input;
}
