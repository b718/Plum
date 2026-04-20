import { ErrorProcessingJob } from "./error";

export class ErrorTransform extends ErrorProcessingJob {
	readonly step = "transform";

	constructor(causeOfError: unknown) {
		super("transform failed", causeOfError);
	}
}
