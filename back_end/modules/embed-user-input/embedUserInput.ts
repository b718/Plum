import type { SearchQuery } from "@plum/types";

export async function embedUserInput(_query: SearchQuery): Promise<number[]> {
  // mock: real impl would call an embedding model
  return new Array(1536).fill(0);
}
