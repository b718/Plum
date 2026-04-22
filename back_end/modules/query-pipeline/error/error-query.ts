import { ErrorQueryJob } from "./error";

export class ErrorQuery extends ErrorQueryJob {
	readonly step = "query";

	constructor(causeOfError: unknown) {
		super("query failed", causeOfError);
	}
}
