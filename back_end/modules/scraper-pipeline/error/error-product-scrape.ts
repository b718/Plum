import { ErrorScraperJob } from "./error";

export class ErrorProductScrape extends ErrorScraperJob {
	readonly step = "product-scrape";

	constructor(cause: unknown) {
		super("product scrape failed", cause);
	}
}
