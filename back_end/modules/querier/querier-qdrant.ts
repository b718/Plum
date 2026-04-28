import { type QdrantClient as Client, QdrantClient } from "@qdrant/js-client-rest";

import { ITEM_LIMIT } from "@plum/consts";
import type { Product } from "@plum/types";

import { type Logger, getLogger } from "../../logger";
import { ErrorQuerier } from "../query-pipeline/error/error-querier";
import type { Querier } from "./querier";

const COLLECTION_NAME = "products";

export class QuerierQdrant implements Querier {
	readonly querierType = "qdrant";

	private client: Client;
	private readonly logger: Logger;

	constructor() {
		this.client = new QdrantClient({ host: "localhost", port: 6333 });
		this.logger = getLogger("querier-qdrant");
	}

	async query(embededInput: number[]): Promise<Product[]> {
		this.logger.info({ querierType: this.querierType }, "querying vector store");
		try {
			const results = await this.client.search(COLLECTION_NAME, {
				vector: embededInput,
				with_payload: true,
				limit: ITEM_LIMIT,
			});
			const products = results
				.filter((result) => result.payload)
				.map((result) => result.payload as unknown as Product);
			this.logger.info(
				{ querierType: this.querierType, count: products.length },
				"successfully queried vector store",
			);
			return products;
		} catch (error) {
			this.logger.error({ querierType: this.querierType, err: error }, "failed to query vector store");
			throw new ErrorQuerier(error);
		}
	}

	async upload(embededInput: number[], productData: Product): Promise<void> {
		this.logger.info(
			{ querierType: this.querierType, productDomainId: productData.productDomainId },
			"uploading to vector store",
		);
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
			this.logger.info(
				{ querierType: this.querierType, productDomainId: productData.productDomainId },
				"successfully uploaded to vector store",
			);
		} catch (error) {
			this.logger.error(
				{ querierType: this.querierType, productDomainId: productData.productDomainId, err: error },
				"failed to upload to vector store",
			);
			throw new ErrorQuerier(error);
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
