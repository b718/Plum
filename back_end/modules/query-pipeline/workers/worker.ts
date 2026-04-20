import { Worker } from "bullmq";
import Redis from "ioredis";
import pino from "pino";

import { EmbederGoogle } from "../embed/embeder-google";
import { QuerierQdrant } from "../query/querier-qdrant";
import { TransformerGoogle } from "../transform/transformer-google";
import processJob from "./process-job";

export default function startWorkers(count: number) {
	const logger = pino({ name: "search-worker" });
	const embeder = new EmbederGoogle();
	const transformer = new TransformerGoogle();
	const querier = new QuerierQdrant();

	for (var i = 0; i < count; i++) {
		const connection = new Redis({ maxRetriesPerRequest: null });
		const publisher = new Redis();
		new Worker(
			"search-jobs",
			async (job) => processJob(i + 1, logger, job, publisher, embeder, transformer, querier),
			{ connection },
		);
	}
}
