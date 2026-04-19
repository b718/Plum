import { type QdrantClient as Client, QdrantClient } from "@qdrant/js-client-rest";

import type { Product } from "@plum/types";

import fixtures from "../../fixtures/fixture.json";
import { ErrorQuery } from "../error/errorQuery";
import type { Querier } from "./querier";

export class QuerierQdrant implements Querier {
	readonly querierType = "qdrant";

	private client: Client;

	constructor() {
		this.client = new QdrantClient({ host: "localhost", port: 6333 });
	}

	async query(embededUserInput: number[]): Promise<Product[]> {
		try {
			return fixtures as Product[];
		} catch (error) {
			throw new ErrorQuery(error);
		}
	}
}
