import { type QdrantClient as Client, QdrantClient } from "@qdrant/js-client-rest";

import type { Product } from "@plum/types";

import { ErrorQuery } from "../error/errorQuery";
import type { Querier } from "./querier";

const COLLECTION_NAME = "products";

export class QuerierQdrant implements Querier {
	readonly querierType = "qdrant";

	private client: Client;

	constructor() {
		this.client = new QdrantClient({ host: "localhost", port: 6333 });
	}

	async query(embededUserInput: number[]): Promise<Product[]> {
		try {
			const results = await this.client.search(COLLECTION_NAME, {
				vector: embededUserInput,
				with_payload: true,
			});
			return results
				.filter((result) => result.payload)
				.map((result) => result.payload as unknown as Product);
		} catch (error) {
			throw new ErrorQuery(error);
		}
	}
}
