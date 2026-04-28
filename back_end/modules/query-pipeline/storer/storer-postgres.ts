import { PrismaPg } from "@prisma/adapter-pg";

import { PAGINATION_AMOUNT } from "@plum/consts";
import type { Product } from "@plum/types";

import { PrismaClient } from "../../../generated/prisma/client";
import { type Logger, getLogger } from "../../../logger";
import { ErrorStorer } from "../error/error-storer";
import type { PagedResult, Storer } from "./storer";

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
				update: { jobId },
				create: { jobId },
			});
			await Promise.allSettled(
				products.map((product) =>
					this.client.products.upsert({
						where: { id: product.id },
						update: { jobResult: { connect: { jobId: jobId } } },
						create: { ...product, jobResult: { connect: { jobId: jobId } } },
					}),
				),
			);
			this.logger.info({ storerType: this.storerType, jobId }, "successfully uploaded product data");
		} catch (err) {
			this.logger.error({ storerType: this.storerType, jobId, err }, "failed to upload products");
			throw new ErrorStorer(err);
		}
	}

	async uploadProduct(product: Product): Promise<void> {
		try {
			const { id, ...productData } = product;
			this.logger.info({ storerType: this.storerType, productId: product.id }, "uploading product data");
			await this.client.products.upsert({
				where: { id: product.id },
				update: { ...productData },
				create: { ...product },
			});
			this.logger.info(
				{ storerType: this.storerType, productId: product.id },
				"successfully uploaded product data",
			);
		} catch (err) {
			this.logger.error(
				{ storerType: this.storerType, productId: product.id, err },
				"failed to upload product",
			);
			throw new ErrorStorer(err);
		}
	}

	async query(jobId: string, page: number): Promise<PagedResult> {
		try {
			this.logger.info({ storerType: this.storerType, jobId, page }, "querying product data");
			const result = await this.client.jobResult.findUnique({
				where: { jobId },
				include: {
					products: { skip: (page - 1) * PAGINATION_AMOUNT, take: PAGINATION_AMOUNT },
					_count: { select: { products: true } },
				},
			});
			if (!result) throw new ErrorStorer(new Error(`no results associated with jobId:'${jobId}'`));
			const totalPages = Math.ceil(result._count.products / PAGINATION_AMOUNT);
			this.logger.info(
				{ storerType: this.storerType, count: result.products.length, jobId, page, totalPages },
				"successfully queried product data",
			);
			return { products: result.products as Product[], page, totalPages };
		} catch (err) {
			this.logger.error(
				{ storerType: this.storerType, jobId, page, err },
				"failed to query for products",
			);
			return { products: [], page, totalPages: 0 };
		}
	}
}
