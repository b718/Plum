import { randomUUIDv7 } from "bun";
import type { Logger } from "pino";
import type { Page } from "playwright";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import type { Product } from "@plum/types";

import { ErrorBotDetected } from "../error/error-bot-detected";
import type { Scraper } from "./scraper";

const BASE_URL = "https://www.grailed.com";

chromium.use(StealthPlugin());

export class ScraperGrailed implements Scraper {
	readonly scraperType = "grailed";

	private readonly SELECTOR_PRODUCT_ROW = "[class*='FeedAndFilters_feed_']";
	private readonly SELECTOR_PRODUCT_LINK = "[class*='UserItemForFeed_feedItem'] a[href]";
	private readonly SELECTOR_STRUCTURED_DATA = 'script[type="application/ld+json"]';
	private readonly PRODUCT_DESCRIPTION_SELECTOR = "[class*='Description_paragraph_']";

	private readonly logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	async scrapeProductUrls(url: string): Promise<string[]> {
		const log = this.logger.child({ scraperType: this.scraperType, url: url });
		const browser = await chromium.launch({ headless: true });
		const page = await browser.newPage();
		try {
			log.info("scraping product URLs");
			await this.blockHeavyAssets(page);
			await page.goto(url, { timeout: 20_000 });
			await page.waitForSelector(this.SELECTOR_PRODUCT_ROW, { timeout: 15_000 });
			const hrefs = await page.$$eval(this.SELECTOR_PRODUCT_LINK, (anchors) =>
				anchors.map((a) => a.getAttribute("href")).filter((h) => h !== null),
			);
			const urls = hrefs.map((href) => (href.startsWith("http") ? href : `${BASE_URL}${href}`));
			log.info({ count: urls.length }, "product URLs scraped");
			return urls;
		} catch (err) {
			log.error({ err: err }, "failed to scrape product URLs");
			return [];
		} finally {
			await page.close();
			await browser.close();
		}
	}

	async scrapeProductData(productUrl: string): Promise<Product | null> {
		const log = this.logger.child({ scraperType: this.scraperType, url: productUrl });
		const browser = await chromium.launch({ headless: true });
		const page = await browser.newPage();
		try {
			log.info("scraping product data");
			await this.blockHeavyAssets(page);
			const response = await page.goto(productUrl, { timeout: 20_000 });
			if (response?.status() == 403) {
				throw new ErrorBotDetected(productUrl);
			}

			const productData = await this.extractProductData(page);
			if (productData) log.info({ productId: productData.id }, "product scraped");
			return productData;
		} catch (err) {
			if (err instanceof ErrorBotDetected) throw err;
			log.error({ err: err }, "failed to scrape product data");
			return null;
		} finally {
			await page.close();
			await browser.close();
		}
	}

	private async extractProductData(page: Page): Promise<Product | null> {
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

	private async blockHeavyAssets(page: Page): Promise<void> {
		await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,mp4}", (route) => route.abort());
	}
}
