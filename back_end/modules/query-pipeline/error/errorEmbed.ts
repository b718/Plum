import { ErrorProcessingJob } from "./error";

export class ErrorEmbed extends ErrorProcessingJob {
	readonly step = "embed";

	constructor(causeOfError: unknown) {
		super("embed failed", causeOfError);
	}
}
