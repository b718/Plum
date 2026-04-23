import { Job, Worker as QueueWorker } from "bullmq";
import Redis from "ioredis";
import pino, { type Logger } from "pino";

import type { Product, SearchQuery } from "@plum/types";

import { QUEUE_SEARCH } from "../../consts/queue";
import { embedUserInput } from "../embed/embed-user-input";
import type { Embeder } from "../embed/embeder";
import { ErrorQueryJob } from "../query-pipeline/error/error";
import { transformUserInput } from "../query-pipeline/transform/transform-user-input";
import type { Transformer } from "../query-pipeline/transform/transformer";
import type { Querier } from "../query/querier";
import { queryEmbededUserInput } from "../query/query-database";
import type { Worker } from "./worker";

export class QueryWorker implements Worker {
	readonly workerType = "query";

	readonly WORKER_NAME = "search-worker";

	private readonly transformer: Transformer;
	private readonly embeder: Embeder;
	private readonly querier: Querier;
	private readonly logger: Logger;

	constructor(transformer: Transformer, embeder: Embeder, querier: Querier) {
		this.transformer = transformer;
		this.embeder = embeder;
		this.querier = querier;
		this.logger = pino({ name: this.WORKER_NAME });
	}

	startWorkers(workerCount: number): void {
		try {
			for (let i = 0; i < workerCount; i++) {
				const connection = new Redis({ maxRetriesPerRequest: null });
				const publisher = new Redis();
				new QueueWorker(QUEUE_SEARCH, async (job) => this.processJob(i + 1, job, publisher), {
					connection,
				});
			}
		} catch (err) {
			this.logger.error({ err }, "error starting query workers");
		}
	}

	private async processJob(id: number, job: Job<SearchQuery>, publisher: Redis) {
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
		} catch (err) {
			const errorMessage =
				err instanceof ErrorQueryJob ? err.message : "unexpected error processing job";
			this.logger.error({ err }, errorMessage);
			throw err;
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
