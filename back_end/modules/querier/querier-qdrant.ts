import { type QdrantClient as Client, QdrantClient } from "@qdrant/js-client-rest";

import type { Product } from "@plum/types";

import { ErrorQuery } from "../query-pipeline/error/error-query";
import type { Querier } from "./querier";

const COLLECTION_NAME = "products";

export class QuerierQdrant implements Querier {
	readonly querierType = "qdrant";

	private client: Client;

	constructor() {
		this.client = new QdrantClient({ host: "localhost", port: 6333 });
	}

	async query(embededInput: number[]): Promise<Product[]> {
		try {
			const results = await this.client.search(COLLECTION_NAME, {
				vector: embededInput,
				with_payload: true,
			});
			return results
				.filter((result) => result.payload)
				.map((result) => result.payload as unknown as Product);
		} catch (error) {
			throw new ErrorQuery(error);
		}
	}

	async upload(embededInput: number[], productData: Product): Promise<void> {
		try {
			const existingPoint = await this.client.scroll(COLLECTION_NAME, {
				filter: {
					must: [{ key: "productDomainId", match: { value: productData.productDomainId } }],
				},
				limit: 1,
			});
			const pointId = existingPoint.points[0]?.id ?? productData.id;
			await this.client.upsert(COLLECTION_NAME, {
				points: [this.formatEmbededInput(embededInput, { ...productData, id: String(pointId) })],
			});
		} catch (error) {
			throw new ErrorQuery(error);
		}
	}

	private formatEmbededInput(embededInput: number[], productData: Product) {
		return {
			id: productData.id,
			vector: embededInput,
			payload: { ...productData },
		};
	}
}
