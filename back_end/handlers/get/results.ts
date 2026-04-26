import type { Context } from "hono";
import Redis from "ioredis";

import { getLogger } from "../../logger";
import type { Storer } from "../../modules/query-pipeline/storer/storer";

const headers = {
	"Content-Type": "text/event-stream",
	"Cache-Control": "no-cache",
	Connection: "keep-alive",
};

export default function resultsHandler(storer: Storer) {
	const logger = getLogger(__filename);
	const encoder = new TextEncoder();

	return async (c: Context) => {
		const jobId = c.req.param("jobId")!;
		const channel = `results:${jobId}`;
		const subscriber = new Redis();
		logger.info({ jobId: jobId }, "fetching result");

		const cachedData = await subscriber.get(channel);
		if (cachedData) {
			logger.info({ jobId: jobId }, "fetching result from cache");
			subscriber.disconnect();
			return new Response(encoder.encode(`data: ${cachedData}\n\n`), { headers: headers });
		}

		const persistedData = await storer.query(jobId);
		if (persistedData.length != 0) {
			logger.info({ jobId: jobId }, "fetching result from database");
			const stringifiedData = JSON.stringify(persistedData);
			await subscriber.set(channel, stringifiedData, "EX", 300);
			subscriber.disconnect();
			return new Response(encoder.encode(`data: ${stringifiedData}\n\n`), { headers: headers });
		}

		const dataStream = new ReadableStream({
			start(controller) {
				const timeout = setTimeout(() => {
					if (controller.desiredSize) {
						controller.enqueue(encoder.encode("event: timeout\ndata: {}\n\n"));
						controller.close();
						subscriber.disconnect();
					}
				}, 30_000);

				subscriber.subscribe(channel, (err) => {
					if (err) {
						logger.error({ err }, "error occured in results data stream");
						controller.enqueue(encoder.encode("event: error\ndata: {}\n\n"));
						controller.close();
						subscriber.disconnect();
						clearTimeout(timeout);
					}
				});

				subscriber.on("message", (_, message) => {
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

		logger.info({ jobId: jobId }, "fetching result from data stream");
		return new Response(dataStream, { headers: headers });
	};
}
