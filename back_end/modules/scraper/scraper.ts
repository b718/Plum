export interface Scraper {
	readonly scraperType: string;
	scrape(url: string): void;
}
