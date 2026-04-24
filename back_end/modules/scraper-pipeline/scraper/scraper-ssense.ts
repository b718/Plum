import { randomUUIDv7 } from "bun";
import type { Logger } from "pino";
import type { Page } from "playwright";

import type { Product } from "@plum/types";

import { Scraper } from "./scraper";

export class ScraperSsense extends Scraper {
	protected readonly SCRAPER_TYPE = "ssense";
	protected readonly BASE_URL = "https://www.ssense.com";
	protected readonly SELECTOR_PRODUCT_ROW = ".plp-products__row";
	protected readonly SELECTOR_PRODUCT_LINK = ".plp-products__column a[href]";

	private readonly SELECTOR_STRUCTURED_DATA = 'script[type="application/ld+json"]';

	constructor(logger: Logger) {
		super(logger);
	}

	protected async extractProductData(page: Page): Promise<Product | null> {
		try {
			await page.waitForSelector(this.SELECTOR_STRUCTURED_DATA, {
				state: "attached",
				timeout: 30_000,
			});
			const extractedProductData = await page.$eval(this.SELECTOR_STRUCTURED_DATA, (el) =>
				JSON.parse(el.textContent),
			);
			return this.createProductData(extractedProductData);
		} catch (err) {
			this.logger.error({ err: err }, "failed to extract structured product data");
			return null;
		}
	}

	private createProductData(extractedProductData: Record<string, string | undefined>): Product | null {
		const product: Product = {
			id: randomUUIDv7(),
			productDomainId: extractedProductData.productID ?? "",
			description: extractedProductData.description ?? "",
			category: "clothing",
			name: extractedProductData.name ?? "",
			url: this.BASE_URL + (extractedProductData.url ?? ""),
			imageUrl: extractedProductData.image ?? "",
		};

		if (product.url == "") {
			return null;
		}

		if (product.description == "") {
			return null;
		}

		if (product.productDomainId == "") {
			return null;
		}

		return product;
	}
}
