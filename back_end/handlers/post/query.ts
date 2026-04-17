import type { Context } from "hono";
import type { SearchQuery } from "@plum/types";
import pino from "pino";

export default function queryHandler() {
  const logger = pino({ name: __filename });

  return async (c: Context) => {
    const body = await c.req.json<SearchQuery>();
    logger.info({ body: body });
    return c.json({ received: body });
  };
}
