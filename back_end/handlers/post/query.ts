import type { Context } from "hono";
import type { SearchQuery, ServerFailureResponse } from "@plum/types";
import type { Queue } from "bullmq";
import { StatusCodes } from "http-status-codes";
import pino from "pino";

export default function queryHandler(queue: Queue) {
  const logger = pino({ name: __filename });

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

      const job = await queue.add("search", { text: body.text });
      logger.info({ jobId: job.id }, "enqueued search job");
      return c.json({ jobId: job.id }, StatusCodes.ACCEPTED);
    } catch {
      return c.json(
        { error: "Internal server error" },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  };
}
