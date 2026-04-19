import { Worker } from "bullmq";
import Redis from "ioredis";
import pino from "pino";

import processJob from "./processJob";

export default function startWorkers(count: number) {
  const logger = pino({ name: "search-worker" });
  for (var i = 0; i < count; i++) {
    const connection = new Redis({ maxRetriesPerRequest: null });
    const publisher = new Redis();
    new Worker(
      "search-jobs",
      async (job) => processJob(i + 1, logger, job, publisher),
      { connection },
    );
  }
}
