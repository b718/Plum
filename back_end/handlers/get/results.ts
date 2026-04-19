import type { Context } from "hono";
import Redis from "ioredis";

export default function resultsHandler() {
	const encoder = new TextEncoder();

	return async (c: Context) => {
		const jobId = c.req.param("jobId");
		const channel = `results:${jobId}`;
		const subscriber = new Redis();

		const cached = await subscriber.get(channel);
		if (cached) {
			subscriber.disconnect();
			return new Response(encoder.encode(`data: ${cached}\n\n`), {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		}

		const stream = new ReadableStream({
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
						controller.enqueue(encoder.encode("event: error\ndata: {}\n\n"));
						controller.close();
						subscriber.disconnect();
						clearTimeout(timeout);
					}
				});

				subscriber.on("message", (ch, message) => {
					if (ch !== channel) return;
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

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	};
}
