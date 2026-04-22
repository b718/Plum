import { Queue } from "bullmq";
import Redis from "ioredis";

import { QUEUE_SEARCH } from "../consts/queue";

export default function startQueue() {
	const connection = new Redis({ maxRetriesPerRequest: null });
	const searchQueue = new Queue(QUEUE_SEARCH, { connection });
	return searchQueue;
}
