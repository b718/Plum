import { type Job, Queue, Worker as QueueWorker } from "bullmq";
import Redis from "ioredis";

import type { ProductScrapeJobData, ProductUploadJobData, UrlScrapeJobData } from "@plum/types";

import { PRODUCT_SCRAPE_JOB, PRODUCT_UPLOAD_JOB } from "../../../consts/queue";
import { type Logger, getLogger } from "../../../logger";
import type { Embeder } from "../../embeder/embeder";
import type { Querier } from "../../querier/querier";
import { ErrorProductScrape } from "../../scraper-pipeline/error/error-product-scrape";
import { ErrorProductUpload } from "../../scraper-pipeline/error/error-product-upload";
import { ErrorUrlScrape } from "../../scraper-pipeline/error/error-url-scrape";
import type { Scraper } from "../../scraper-pipeline/scraper/scraper";
import type { Worker } from "../worker";

export abstract class ScraperWorker implements Worker {
	readonly workerType = "scraper";

	abstract readonly QUEUE_URL_SCRAPE: string;
	abstract readonly QUEUE_PRODUCT_SCRAPE: string;
	abstract readonly QUEUE_PRODUCT_UPLOAD: string;

	private readonly scraper: Scraper;
	private readonly embeder: Embeder;
	private readonly querier: Querier;
	private readonly logger: Logger;

	constructor(workerName: string, scraper: Scraper, embeder: Embeder, querier: Querier) {
		this.scraper = scraper;
		this.embeder = embeder;
		this.querier = querier;
		this.logger = getLogger(workerName);
	}

	startWorkers(workerCount: number): void {
		try {
			const productScrapeQueue = new Queue(this.QUEUE_PRODUCT_SCRAPE, {
				connection: new Redis(),
			});

			new QueueWorker(
				this.QUEUE_URL_SCRAPE,
				async (job) => this.processUrlScrapeJob(1, job, productScrapeQueue),
				{ connection: new Redis({ maxRetriesPerRequest: null }), lockDuration: 120000 },
			);

			const productUploadQueue = new Queue(this.QUEUE_PRODUCT_UPLOAD, {
				connection: new Redis(),
			});

			for (let i = 0; i < workerCount; i++) {
				const productScrapeWorker = new QueueWorker(
					this.QUEUE_PRODUCT_SCRAPE,
					async (job) => this.processProductScrapeJob(i + 1, job, productUploadQueue),
					{ connection: new Redis({ maxRetriesPerRequest: null }), lockDuration: 60000 },
				);
				productScrapeWorker.on("failed", (job, err) => {
					const totalAttempts = job?.opts?.attempts;
					const currentAttempt = job?.attemptsMade;
					if (currentAttempt === undefined || totalAttempts === undefined) return;

					const isPermanentFailure = currentAttempt === totalAttempts;
					const loggerMessage = isPermanentFailure
						? "product scrape job permanently failed"
						: `product scrape job failed, retrying attempt ${currentAttempt}/${totalAttempts}`;
					const logFunction = isPermanentFailure
						? this.logger.error.bind(this.logger)
						: this.logger.warn.bind(this.logger);
					logFunction({ jobId: job?.id, productUrl: job?.data.productUrl, err: err }, loggerMessage);
				});
			}

			new QueueWorker(this.QUEUE_PRODUCT_UPLOAD, async (job) => this.processProductUploadJob(1, job), {
				connection: new Redis({ maxRetriesPerRequest: null }),
			});
		} catch (err) {
			this.logger.error({ err: err }, "error starting scrape workers");
		}
	}

	private async processUrlScrapeJob(
		id: number,
		job: Job<UrlScrapeJobData>,
		productScrapeQueue: Queue,
	): Promise<void> {
		try {
			this.logger.info("scraping product urls");
			const urls = await this.scraper.scrapeProductUrls(job.data.domain);
			await Promise.all(
				urls.map((url) =>
					productScrapeQueue.add(
						PRODUCT_SCRAPE_JOB,
						{ productUrl: url },
						{ attempts: 3, backoff: { type: "exponential", delay: 60_000 } },
					),
				),
			);
			this.logger.info(
				{ workerId: id, domainUrl: job.data.domain, scrapedUrlCount: urls.length },
				"url scrape job processed",
			);
		} catch (err) {
			this.logger.error({ err: err }, "error scraping urls");
			throw new ErrorUrlScrape(err);
		}
	}

	private async processProductScrapeJob(
		id: number,
		job: Job<ProductScrapeJobData>,
		productUploadQueue: Queue,
	): Promise<void> {
		try {
			const product = await this.scraper.scrapeProductData(job.data.productUrl);
			if (!product) {
				this.logger.warn(
					{ workerId: id, productUrl: job.data.productUrl },
					"no product data returned for url",
				);
				return;
			}

			await productUploadQueue.add(PRODUCT_UPLOAD_JOB, { product });
			this.logger.info(
				{ workerId: id, productId: product.id, productUrl: job.data.productUrl },
				"product scrape job processed",
			);
		} catch (err) {
			this.logger.error({ err: err }, "error scraping product data");
			throw new ErrorProductScrape(err);
		}
	}

	private async processProductUploadJob(id: number, job: Job<ProductUploadJobData>): Promise<void> {
		try {
			const embededProductData = await this.embeder.embedProductData(job.data.product);
			await this.querier.upload(embededProductData, job.data.product);
			this.logger.info(
				{ workerId: id, productId: job.data.product.id },
				"product data uploaded successfully",
			);
		} catch (err) {
			this.logger.error({ err: err }, "error uploading product data");
			throw new ErrorProductUpload(err);
		}
	}
}
