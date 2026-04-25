import { PrismaPg } from "@prisma/adapter-pg";

import type { Product } from "@plum/types";

import { PrismaClient } from "../../../generated/prisma/client";
import { type Logger, getLogger } from "../../../logger";
import { ErrorStorer } from "../error/error-storer";
import type { Storer } from "./storer";

export class StorerPostgres implements Storer {
	readonly storerType = "prisma-postgres";

	private readonly client: PrismaClient;
	private readonly logger: Logger;

	constructor() {
		this.client = new PrismaClient({
			adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
		});
		this.logger = getLogger("storer-postgres");
	}

	async upload(jobId: string, products: Product[]): Promise<void> {
		try {
			this.logger.info({ storerType: this.storerType, jobId }, "uploading product data");
			await this.client.jobResult.upsert({
				where: { jobId },
				update: { products: JSON.stringify(products) },
				create: { jobId, products: JSON.stringify(products) },
			});
			this.logger.info({ storerType: this.storerType, jobId }, "successfully uploaded product data");
		} catch (err) {
			this.logger.error({ storerType: this.storerType, jobId, err }, "failed to upload products");
			throw new ErrorStorer(err);
		}
	}

	async query(jobId: string): Promise<Product[]> {
		try {
			this.logger.info({ storerType: this.storerType, jobId }, "querying product data");
			const result = await this.client.jobResult.findUnique({ where: { jobId } });
			if (!result) throw new ErrorStorer(new Error(`no results associated with jobId:'${jobId}'`));
			this.logger.info({ storerType: this.storerType, jobId }, "successfully queried product data");
			return JSON.parse(result.products) as Product[];
		} catch (err) {
			this.logger.error(
				{ storerType: this.storerType, jobId: jobId, err: err },
				"failed to query for products",
			);
			return [];
		}
	}
}
