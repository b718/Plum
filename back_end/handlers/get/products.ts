import type { Context } from "hono";

import type { Product } from "@plum/types";

import products from "../../fixtures/fixture.json";

export default function productsHandler(c: Context) {
	return c.json(products as Product[]);
}
