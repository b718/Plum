import type { Job } from "bullmq";
import type Redis from "ioredis";
import type { Logger } from "pino";

import type { Product, SearchQuery } from "@plum/types";

import { embedUserInput } from "../embed/embedUserInput";
import type { Embeder } from "../embed/embeder";
import { ErrorProcessingJob } from "../error/error";
import type { Querier } from "../query/querier";
import { queryEmbededUserInput } from "../query/queryDatabase";
import { transformUserInput } from "../transform/transformUserInput";
import type { Transformer } from "../transform/transformer";

export default async function processJob(
	id: number,
	logger: Logger,
	job: Job<SearchQuery, any, string>,
	publisher: Redis,

	embeder: Embeder,
	transformer: Transformer,
	querier: Querier,
) {
	try {
		const userInput = job.data.text;
		const transformedUserInput = await transformUserInput(transformer, userInput);
		const embededUserInput = await embedUserInput(embeder, transformedUserInput);
		const queriedProducts = await queryEmbededUserInput(querier, embededUserInput);
		logger.info({ worker: id, jobId: job.id, resultCount: queriedProducts.length }, "job processed");
		await cacheAndPublishResults(job.id, publisher, queriedProducts);
	} catch (error) {
		const errorMessage =
			error instanceof ErrorProcessingJob ? error.message : "unexpected error processing job";
		logger.error({ err: error }, errorMessage);
	}
}

async function cacheAndPublishResults(
	jobId: string | undefined,
	publisher: Redis,
	queriedProducts: Product[],
) {
	const jobResultsId = `results:${jobId}`;
	const serialized = JSON.stringify(queriedProducts);
	await publisher.set(jobResultsId, serialized, "EX", 300);
	await publisher.publish(jobResultsId, serialized);
}
