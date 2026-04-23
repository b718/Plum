import { ErrorScraperJob } from "./error";

export class ErrorBotDetected extends ErrorScraperJob {
	readonly step = "bot-detected";

	constructor(url: string) {
		super(`bot detection triggered (403) for ${url}`, undefined);
	}
}
