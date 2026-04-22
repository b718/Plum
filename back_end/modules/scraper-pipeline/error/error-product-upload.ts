import { ErrorScraperJob } from "./error";

export class ErrorProductUpload extends ErrorScraperJob {
	readonly step = "product-upload";

	constructor(cause: unknown) {
		super("product upload failed", cause);
	}
}
