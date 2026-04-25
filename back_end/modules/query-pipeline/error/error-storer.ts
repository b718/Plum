import { ErrorQueryJob } from "./error";

export class ErrorStorer extends ErrorQueryJob {
	readonly step = "storer";

	constructor(causeOfError: unknown) {
		super("storer failed", causeOfError);
	}
}
