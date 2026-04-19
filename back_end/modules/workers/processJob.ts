import type { Job } from "bullmq";
import type Redis from "ioredis";
import type { Logger } from "pino";

import type { Product, SearchQuery } from "@plum/types";

import { embedUserInput } from "../embed-user-input/embedUserInput";
import { queryDatabase } from "../query/queryDatabase";
import { transformUserInput } from "../transform-user-input/transformUserInput";

export default async function processJob(
  id: number,
  logger: Logger,
  job: Job<SearchQuery, any, string>,
  publisher: Redis,
) {
  const userInput = job.data.text;
  const transformedUserInput = await transformUserInput(userInput);
  const embededUserInput = await embedUserInput(transformedUserInput);
  const queriedProducts = await queryDatabase(embededUserInput);
  logger.info(
    { worker: id, jobId: job.id, resultCount: queriedProducts.length },
    "job processed",
  );
  await cacheAndPublishResults(job.id, publisher, queriedProducts);
}

async function cacheAndPublishResults(
  jobId: string | undefined,
  publisher: Redis,
  queriedProducts: Product[],
) {
  const jobResultsId = `results:${jobId}`;
  const serialized = JSON.stringify(queriedProducts);
  await publisher.set(jobResultsId, serialized, "EX", 300);
  await publisher.publish(jobResultsId, serialized);
}
