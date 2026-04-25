import { ErrorQueryJob } from "./error";

export class ErrorQuerier extends ErrorQueryJob {
	readonly step = "query";

	constructor(causeOfError: unknown) {
		super("querier failed", causeOfError);
	}
}
