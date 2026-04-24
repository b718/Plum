import type { Logger } from "pino";
import type { Page } from "playwright";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import type { Product } from "@plum/types";

import { ErrorBotDetected } from "../error/error-bot-detected";

chromium.use(StealthPlugin());

interface ScraperInterface {
	scrapeProductUrls(url: string): Promise<string[]>;
	scrapeProductData(productUrl: string): Promise<Product | null>;
}

export abstract class Scraper implements ScraperInterface {
	protected abstract readonly SCRAPER_TYPE: string;
	protected abstract readonly BASE_URL: string;
	protected abstract readonly SELECTOR_PRODUCT_ROW: string;
	protected abstract readonly SELECTOR_PRODUCT_LINK: string;

	protected readonly logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	async scrapeProductUrls(url: string): Promise<string[]> {
		const log = this.logger.child({ scraperType: this.SCRAPER_TYPE, url: url });
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
			const urls = hrefs.map((href) => (href.startsWith("http") ? href : `${this.BASE_URL}${href}`));
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
		const log = this.logger.child({ scraperType: this.SCRAPER_TYPE, url: productUrl });
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

	protected abstract extractProductData(page: Page): Promise<Product | null>;

	private async blockHeavyAssets(page: Page): Promise<void> {
		await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,mp4}", (route) => route.abort());
	}
}
