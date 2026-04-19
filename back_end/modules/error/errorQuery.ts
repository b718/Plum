import { ErrorProcessingJob } from "./error";

export class ErrorQuery extends ErrorProcessingJob {
	readonly step = "query";

	constructor(causeOfError: unknown) {
		super("query failed", causeOfError);
	}
}
