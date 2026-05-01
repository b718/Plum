import { Job, type Queue } from "bullmq";
import type { Context } from "hono";
import Redis from "ioredis";

import { getLogger } from "../../logger";
import type { Storer } from "../../modules/query-pipeline/storer/storer";

const headers = {
	"Content-Type": "text/event-stream",
	"Cache-Control": "no-cache",
	Connection: "keep-alive",
};

export default function resultsHandler(storer: Storer, queue: Queue) {
	const encoder = new TextEncoder();

	return async (c: Context) => {
		const jobId = c.req.param("jobId")!;
		const job = await Job.fromId(queue, jobId);
		const page = Number(c.req.query("page")!);
		const pageKey = `results:${jobId}:${page}`;
		const logger = getLogger(__filename).child({ jobId, page });

		const jobState = await job?.getState();
		if (jobState === "failed") {
			logger.warn("job already failed, returning error immediately");
			return new Response(encoder.encode("event: error\ndata: {}\n\n"), { headers });
		}

		const subscriber = new Redis();
		const cachedData = await subscriber.get(pageKey);
		if (cachedData) {
			logger.info("fetching result from cache");
			subscriber.disconnect();
			return new Response(encoder.encode(`data: ${cachedData}\n\n`), { headers });
		}

		const persistedData = await storer.query(jobId, page);
		if (persistedData.products.length !== 0) {
			logger.info("fetching result from database");
			const stringifiedData = JSON.stringify(persistedData);
			await subscriber.set(pageKey, stringifiedData, "EX", 300);
			subscriber.disconnect();
			return new Response(encoder.encode(`data: ${stringifiedData}\n\n`), { headers });
		}

		const dataStream = new ReadableStream({
			start(controller) {
				const timeout = setTimeout(() => {
					if (controller.desiredSize) {
						logger.warn("timeout occurred");
						controller.enqueue(encoder.encode("event: timeout\ndata: {}\n\n"));
						controller.close();
						subscriber.disconnect();
					}
				}, 10_000);

				const jobChannel = `results:${jobId}:1`;
				subscriber.subscribe(jobChannel, (err) => {
					if (err) {
						logger.error({ err }, "error occurred in results data stream");
						controller.enqueue(encoder.encode("event: error\ndata: {}\n\n"));
						controller.close();
						subscriber.disconnect();
						clearTimeout(timeout);
					}
				});

				subscriber.on("message", async (_, message) => {
					controller.enqueue(encoder.encode(`data: ${message}\n\n`));
					controller.close();
					subscriber.disconnect();
					clearTimeout(timeout);
				});
			},
			cancel() {
				subscriber.disconnect();
			},
		});

		logger.info("fetching result from data stream");
		return new Response(dataStream, { headers });
	};
}
