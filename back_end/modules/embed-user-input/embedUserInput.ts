import { sleep } from "bun";
import pino from "pino";

const logger = pino({ name: __filename });

export async function embedUserInput(query: string): Promise<number[]> {
  // mock: real impl would call an embedding model
  logger.info({ userInput: query }, "embedding user query");
  await sleep(1000);
  return new Array(1536).fill(0);
}
