import { randomUUIDv7 } from "bun";
import type { Logger } from "pino";
import type { Page } from "playwright";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import type { Product } from "@plum/types";

import type { Scraper } from "./scraper";

const BASE_URL = "https://www.ssense.com";

chromium.use(StealthPlugin());

export class ScraperSsense implements Scraper {
	readonly scraperType = "ssense";

	private static readonly SELECTOR_PRODUCT_ROW = ".plp-products__row";
	private static readonly SELECTOR_PRODUCT_LINK = ".plp-products__column a[href]";
	private static readonly SELECTOR_STRUCTURED_DATA = 'script[type="application/ld+json"]';

	private readonly logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	async scrapeProductUrls(url: string): Promise<string[]> {
		const log = this.logger.child({ url: url });
		const browser = await chromium.launch({ headless: true });
		const page = await browser.newPage();
		try {
			log.info("scraping product URLs");
			await this.blockHeavyAssets(page);
			await page.goto(url, { timeout: 20_000 });
			await page.waitForSelector(ScraperSsense.SELECTOR_PRODUCT_ROW, { timeout: 15_000 });
			const hrefs = await page.$$eval(ScraperSsense.SELECTOR_PRODUCT_LINK, (anchors) =>
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
		const log = this.logger.child({ url: productUrl });
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
			await page.waitForSelector(ScraperSsense.SELECTOR_STRUCTURED_DATA, {
				state: "attached",
				timeout: 30_000,
			});
			const extractedProductData = await page.$eval(ScraperSsense.SELECTOR_STRUCTURED_DATA, (el) =>
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
			url: BASE_URL + (extractedProductData.url ?? ""),
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

	private async blockHeavyAssets(page: Page): Promise<void> {
		await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,mp4}", (route) => route.abort());
	}
}
