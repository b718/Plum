import { Job, Worker } from "bullmq";
import Redis from "ioredis";
import pino, { type Logger } from "pino";

export default function startSearchWorkers(count: number = 1) {
  const logger = pino({ name: "search-worker" });

  return Array.from({ length: count }, (_, i) => {
    const connection = new Redis({ maxRetriesPerRequest: null });
    return new Worker(
      "search-jobs",
      async (job) => processJob(i + 1, logger, job),
      { connection },
    );
  });
}

async function processJob(
  id: number,
  logger: Logger,
  job: Job<any, any, string>,
) {
  logger.info({ worker: id, jobId: job.id, data: job.data }, "consumed job");
}
