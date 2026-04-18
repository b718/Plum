import type { SearchQuery } from "@plum/types";

export async function transformUserInput(input: SearchQuery): Promise<SearchQuery> {
  // mock: real impl would call an LLM to extract intent/keywords
  return input;
}
