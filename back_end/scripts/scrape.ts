import { Queue } from "bullmq";
import Redis from "ioredis";

import { QUEUE_URL_SCRAPE_GRAILED, QUEUE_URL_SCRAPE_SSENSE, URL_SCRAPE_JOB } from "../consts/queue";

const scraperType = process.argv[2];
const domain = process.argv[3];

const queueMap: Record<string, string> = {
	grailed: QUEUE_URL_SCRAPE_GRAILED,
	ssense: QUEUE_URL_SCRAPE_SSENSE,
};
const validScraperTypes = Object.keys(queueMap);

if (!scraperType || !queueMap[scraperType]) {
	console.error(`'${scraperType}' is not valid scraper type`);
	console.error(`valid scraper types: '${validScraperTypes}'`);
	console.error("Usage: bun scripts/scrape.ts <scraper> <domain>");
	process.exit(1);
}

if (!domain) {
	console.error(`'${domain}' is not a valid domain`);
	console.error("Usage: bun scripts/scrape.ts <scraper> <domain>");
	process.exit(1);
}

const connection = new Redis({ maxRetriesPerRequest: null });
const queue = new Queue(queueMap[scraperType], { connection });

await queue.add(URL_SCRAPE_JOB, { domain });
console.log(`Enqueued ${scraperType} scrape job for: ${domain}`);

await queue.close();
await connection.quit();
