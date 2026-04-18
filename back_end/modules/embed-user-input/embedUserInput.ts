import type { SearchQuery } from "@plum/types";
import { sleep } from "bun";

export async function embedUserInput(_query: SearchQuery): Promise<number[]> {
  // mock: real impl would call an embedding model
  await sleep(1000);
  return new Array(1536).fill(0);
}
