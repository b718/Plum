import { randomUUIDv7 } from "bun";
import type { Logger } from "pino";
import type { Page } from "playwright";

import type { Product } from "@plum/types";

import { Scraper } from "./scraper";

export class ScraperGrailed extends Scraper {
	protected readonly SCRAPER_TYPE = "grailed";
	protected readonly BASE_URL = "https://www.grailed.com";
	protected readonly SELECTOR_PRODUCT_ROW = "[class*='FeedAndFilters_feed_']";
	protected readonly SELECTOR_PRODUCT_LINK = "[class*='UserItemForFeed_feedItem'] a[href]";

	private readonly SELECTOR_STRUCTURED_DATA = 'script[type="application/ld+json"]';
	private readonly PRODUCT_DESCRIPTION_SELECTOR = "[class*='Description_paragraph_']";

	constructor(logger: Logger) {
		super(logger);
	}

	protected async extractProductData(page: Page): Promise<Product | null> {
		try {
			await Promise.all([
				page.waitForSelector(this.SELECTOR_STRUCTURED_DATA, {
					state: "attached",
					timeout: 30_000,
				}),
				page.waitForSelector(this.PRODUCT_DESCRIPTION_SELECTOR, {
					state: "attached",
					timeout: 30_000,
				}),
			]);

			const [extractedProductData, extractedProductDescrption] = await Promise.all([
				page.$eval(this.SELECTOR_STRUCTURED_DATA, (el) => JSON.parse(el.textContent)),
				page.$$eval(this.PRODUCT_DESCRIPTION_SELECTOR, (elements) =>
					elements.map((element) => element.textContent),
				),
			]);

			return this.createProductData(extractedProductData, extractedProductDescrption.join(" "));
		} catch (err) {
			this.logger.error({ err: err }, "failed to extract structured product data");
			return null;
		}
	}

	private createProductData(
		extractedProductData: any,
		extractedProductDescrption: string,
	): Product | null {
		console.log(extractedProductDescrption);
		const productUrl = (extractedProductData?.offers?.url as string) ?? "";
		if (productUrl == "") {
			return null;
		}

		const urlSlug = new URL(productUrl).pathname.split("/").at(-1);
		if (!urlSlug) {
			return null;
		}

		const productDomainId = urlSlug.split("-").at(0);
		if (!productDomainId) {
			return null;
		}

		const product: Product = {
			id: randomUUIDv7(),
			productDomainId: productDomainId,
			description: extractedProductDescrption ?? "",
			category: "clothing",
			name: extractedProductData.name ?? "",
			url: productUrl,
			imageUrl: extractedProductData.image ?? "",
		};

		if (product.description == "") {
			return null;
		}

		return product;
	}
}
