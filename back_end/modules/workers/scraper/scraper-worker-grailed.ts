import {
	QUEUE_PRODUCT_SCRAPE_GRAILED,
	QUEUE_PRODUCT_UPLOAD_GRAILED,
	QUEUE_URL_SCRAPE_GRAILED,
} from "../../../consts/queue";
import type { Embeder } from "../../embeder/embeder";
import type { Querier } from "../../querier/querier";
import type { Storer } from "../../query-pipeline/storer/storer";
import { ScraperGrailed } from "../../scraper-pipeline/scraper/scraper-grailed";
import { ScraperWorker } from "./scraper-worker";

export class ScraperWorkerGrailed extends ScraperWorker {
	readonly QUEUE_URL_SCRAPE = QUEUE_URL_SCRAPE_GRAILED;
	readonly QUEUE_PRODUCT_SCRAPE = QUEUE_PRODUCT_SCRAPE_GRAILED;
	readonly QUEUE_PRODUCT_UPLOAD = QUEUE_PRODUCT_UPLOAD_GRAILED;

	constructor(scraper: ScraperGrailed, embeder: Embeder, querier: Querier, storer: Storer) {
		const WORKER_NAME = "scraper-worker-grailed";
		super(WORKER_NAME, scraper, embeder, querier, storer);
	}
}
