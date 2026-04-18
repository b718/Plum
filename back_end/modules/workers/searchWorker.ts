import { Job, Worker } from "bullmq";
import Redis from "ioredis";
import pino, { type Logger } from "pino";

import type { Product } from "@plum/types";

import { embedUserInput } from "../embed-user-input/embedUserInput";
import { queryDatabase } from "../query/queryDatabase";
import { transformUserInput } from "../transform-user-input/transformUserInput";

export default function startSearchWorkers(count: number = 1) {
  const logger = pino({ name: "search-worker" });
  return Array.from({ length: count }, (_, i) => {
    const connection = new Redis({ maxRetriesPerRequest: null });
    const publisher = new Redis();
    return new Worker(
      "search-jobs",
      async (job) => processJob(i + 1, logger, job, publisher),
      { connection },
    );
  });
}

async function processJob(
  id: number,
  logger: Logger,
  job: Job<any, any, string>,
  publisher: Redis,
) {
  const transformedUserInput = await transformUserInput(job.data);
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
