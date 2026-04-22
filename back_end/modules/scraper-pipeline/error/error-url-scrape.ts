import { ErrorScraperJob } from "./error";

export class ErrorUrlScrape extends ErrorScraperJob {
	readonly step = "url-scrape";

	constructor(cause: unknown) {
		super("url scrape failed", cause);
	}
}
