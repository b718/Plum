import { Job, Worker } from "bullmq";
import Redis from "ioredis";
import pino, { type Logger } from "pino";
import { transformUserInput } from "../transform-user-input/transformUserInput";
import { embedUserInput } from "../embed-user-input/embedUserInput";
import { queryDatabase } from "../query/queryDatabase";

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
  const jobResultsId = `results:${job.id}`;
  const transformedUserInput = await transformUserInput(job.data);
  const embededUserInput = await embedUserInput(transformedUserInput);
  const results = await queryDatabase(embededUserInput);
  logger.info(
    { worker: id, jobId: job.id, resultCount: results.length },
    "job complete",
  );
  await publisher.publish(jobResultsId, JSON.stringify(results));
}
