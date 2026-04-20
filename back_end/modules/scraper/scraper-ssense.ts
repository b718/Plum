import type { Scraper } from "./scraper";

export class ScraperSsense implements Scraper {
	readonly scraperType = "ssense";

	constructor() {}

	async scrape(ur: string): Promise<void> {}
}
