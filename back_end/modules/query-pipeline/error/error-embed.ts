import { ErrorQueryJob } from "./error";

export class ErrorEmbed extends ErrorQueryJob {
	readonly step = "embed";

	constructor(causeOfError: unknown) {
		super("embed failed", causeOfError);
	}
}
