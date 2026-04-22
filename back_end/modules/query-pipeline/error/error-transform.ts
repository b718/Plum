import { ErrorQueryJob } from "./error";

export class ErrorTransform extends ErrorQueryJob {
	readonly step = "transform";

	constructor(causeOfError: unknown) {
		super("transform failed", causeOfError);
	}
}
