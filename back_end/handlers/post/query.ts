import type { Queue } from "bullmq";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";

import type { ResultsQuery, SearchQuery, ServerFailureResponse } from "@plum/types";

import { SEARCH_JOB } from "../../consts/queue";
import { getLogger } from "../../logger";

export default function queryHandler(queue: Queue) {
	const logger = getLogger(__filename);

	return async (c: Context) => {
		try {
			const body = await c.req.json<SearchQuery>();
			if (!body?.text || typeof body.text !== "string") {
				const response: ServerFailureResponse = {
					statusCode: StatusCodes.BAD_REQUEST,
					errorMessage: "Bad request",
				};
				return c.json(response, StatusCodes.BAD_REQUEST);
			}

			const job = await queue.add(SEARCH_JOB, { text: body.text });
			const response: ResultsQuery = {
				jobId: job.id,
			};
			logger.info({ jobId: response.jobId }, "enqueued search job");
			return c.json(response, StatusCodes.ACCEPTED);
		} catch (err) {
			logger.error({ err }, "error occured in query handler");
			return c.json({ error: "Internal server error" }, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};
}
