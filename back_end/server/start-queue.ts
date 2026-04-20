import { Queue } from "bullmq";
import Redis from "ioredis";

export default function startQueue() {
	const connection = new Redis({ maxRetriesPerRequest: null });
	const searchQueue = new Queue("search-jobs", { connection });
	return searchQueue;
}
