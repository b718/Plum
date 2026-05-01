import { Job, Worker as QueueWorker } from "bullmq";
import Redis from "ioredis";

import { PAGINATION_AMOUNT } from "@plum/consts";
import type { Product, SearchQuery } from "@plum/types";

import { QUEUE_SEARCH } from "../../../consts/queue";
import { type Logger, getLogger } from "../../../logger";
import type { Embeder } from "../../embeder/embeder";
import type { Querier } from "../../querier/querier";
import { embedUserInput } from "../../query-pipeline/embed/embed-user-input";
import { ErrorQueryJob } from "../../query-pipeline/error/error";
import { queryEmbededUserInput } from "../../query-pipeline/query/query-database";
import type { Storer } from "../../query-pipeline/storer/storer";
import { transformUserInput } from "../../query-pipeline/transform/transform-user-input";
import type { Transformer } from "../../query-pipeline/transform/transformer";
import type { Worker } from "../worker";

export class QueryWorker implements Worker {
	readonly workerType = "query";

	readonly WORKER_NAME = "search-worker";

	private readonly transformer: Transformer;
	private readonly embeder: Embeder;
	private readonly querier: Querier;
	private readonly storer: Storer;
	private readonly logger: Logger;

	constructor(transformer: Transformer, embeder: Embeder, querier: Querier, storer: Storer) {
		this.transformer = transformer;
		this.embeder = embeder;
		this.querier = querier;
		this.storer = storer;
		this.logger = getLogger(this.WORKER_NAME);
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
			if (!job.id) return;
			const userInput = job.data.text;
			const transformedUserInput = await transformUserInput(this.transformer, userInput);
			const embededUserInput = await embedUserInput(this.embeder, transformedUserInput);
			const queriedProducts = await queryEmbededUserInput(this.querier, embededUserInput);
			this.logger.info(
				{ worker: id, jobId: job.id, resultCount: queriedProducts.length },
				"job processed",
			);
			await Promise.all([
				this.uploadProducts(job.id, queriedProducts),
				this.cacheAndPublishResults(job.id, publisher, queriedProducts),
			]);
		} catch (err) {
			const errorMessage =
				err instanceof ErrorQueryJob ? err.message : "unexpected error processing job";
			this.logger.error({ jobId: job.id, err }, errorMessage);
			throw err;
		}
	}

	private async cacheAndPublishResults(jobId: string, publisher: Redis, queriedProducts: Product[]) {
		const totalPages = Math.ceil(queriedProducts.length / PAGINATION_AMOUNT);
		const pageOneKey = `results:${jobId}:1`;
		const pageOnePayload = {
			products: queriedProducts.slice(0, PAGINATION_AMOUNT),
			page: 1,
			totalPages,
		};
		const serialized = JSON.stringify(pageOnePayload);
		await Promise.all([
			publisher.set(pageOneKey, serialized, "EX", 300),
			publisher.publish(pageOneKey, serialized),
		]);
	}

	private async uploadProducts(jobId: string, queriedProducts: Product[]) {
		await this.storer.upload(jobId, queriedProducts);
	}
}
