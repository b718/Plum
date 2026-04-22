import { Job, Worker as QueueWorker } from "bullmq";
import Redis from "ioredis";
import pino, { type Logger } from "pino";

import type { Product, SearchQuery } from "@plum/types";

import { embedUserInput } from "../embed/embed-user-input";
import type { Embeder } from "../embed/embeder";
import { ErrorProcessingJob } from "../query-pipeline/error/error";
import { transformUserInput } from "../query-pipeline/transform/transform-user-input";
import type { Transformer } from "../query-pipeline/transform/transformer";
import type { Querier } from "../query/querier";
import { queryEmbededUserInput } from "../query/query-database";
import type { Worker } from "./worker";

export class QueryWorker implements Worker {
	readonly workerType = "query";

	private readonly transformer: Transformer;
	private readonly embeder: Embeder;
	private readonly querier: Querier;
	private readonly logger: Logger;

	constructor(transformer: Transformer, embeder: Embeder, querier: Querier) {
		this.transformer = transformer;
		this.embeder = embeder;
		this.querier = querier;
		this.logger = pino({ name: "search-worker" });
	}

	startWorkers(workerCount: number): void {
		for (let i = 0; i < workerCount; i++) {
			const connection = new Redis({ maxRetriesPerRequest: null });
			const publisher = new Redis();
			new QueueWorker("search-jobs", async (job) => this.processJob(i + 1, job, publisher), {
				connection,
			});
		}
	}

	private async processJob(id: number, job: Job<SearchQuery, any, string>, publisher: Redis) {
		try {
			const userInput = job.data.text;
			const transformedUserInput = await transformUserInput(this.transformer, userInput);
			const embededUserInput = await embedUserInput(this.embeder, transformedUserInput);
			const queriedProducts = await queryEmbededUserInput(this.querier, embededUserInput);
			this.logger.info(
				{ worker: id, jobId: job.id, resultCount: queriedProducts.length },
				"job processed",
			);
			await this.cacheAndPublishResults(job.id, publisher, queriedProducts);
		} catch (error) {
			const errorMessage =
				error instanceof ErrorProcessingJob ? error.message : "unexpected error processing job";
			this.logger.error({ err: error }, errorMessage);
		}
	}

	private async cacheAndPublishResults(
		jobId: string | undefined,
		publisher: Redis,
		queriedProducts: Product[],
	) {
		const jobResultsId = `results:${jobId}`;
		const serialized = JSON.stringify(queriedProducts);
		await publisher.set(jobResultsId, serialized, "EX", 300);
		await publisher.publish(jobResultsId, serialized);
	}
}
