import type { Context } from "hono";
import type { SearchQuery, Product, ServerFailureResponse } from "@plum/types";
import pino from "pino";
import products from "../get/fixture.json";
import { StatusCodes } from "http-status-codes";

export default function queryHandler() {
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

      logger.info({ body });
      return c.json(products as Product[], 200);
    } catch {
      return c.json({ error: "Internal server error" }, 500);
    }
  };
}
