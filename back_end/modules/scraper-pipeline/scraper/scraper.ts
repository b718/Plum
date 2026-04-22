import type { Product } from "@plum/types";

export interface Scraper {
	readonly scraperType: string;
	scrapeProductUrls(url: string): Promise<string[]>;
	scrapeProductData(productUrl: string): Promise<Product | null>;
}
