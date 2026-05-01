import {
	QUEUE_PRODUCT_SCRAPE_SSENSE,
	QUEUE_PRODUCT_UPLOAD_SSENSE,
	QUEUE_URL_SCRAPE_SSENSE,
} from "../../../consts/queue";
import type { Embeder } from "../../embeder/embeder";
import type { Querier } from "../../querier/querier";
import { ScraperSsense } from "../../scraper-pipeline/scraper/scraper-ssense";
import type { Storer } from "../../storer/storer";
import { ScraperWorker } from "./scraper-worker";

export class ScraperWorkerSsense extends ScraperWorker {
	readonly QUEUE_URL_SCRAPE = QUEUE_URL_SCRAPE_SSENSE;
	readonly QUEUE_PRODUCT_SCRAPE = QUEUE_PRODUCT_SCRAPE_SSENSE;
	readonly QUEUE_PRODUCT_UPLOAD = QUEUE_PRODUCT_UPLOAD_SSENSE;

	constructor(scraper: ScraperSsense, embeder: Embeder, querier: Querier, storer: Storer) {
		const WORKER_NAME = "scraper-worker-ssense";
		super(WORKER_NAME, scraper, embeder, querier, storer);
	}
}
