import { Queue } from "bullmq";
import Redis from "ioredis";

import { QUEUE_URL_SCRAPE, URL_SCRAPE_JOB } from "../consts/queue";

const domain = process.argv[2];

if (!domain) {
	console.error("Usage: bun scripts/scrape.ts <domain-url>");
	process.exit(1);
}

const connection = new Redis({ maxRetriesPerRequest: null });
const queue = new Queue(QUEUE_URL_SCRAPE, { connection });

await queue.add(URL_SCRAPE_JOB, { domain });
console.log(`Enqueued scrape job for: ${domain}`);

await queue.close();
await connection.quit();
