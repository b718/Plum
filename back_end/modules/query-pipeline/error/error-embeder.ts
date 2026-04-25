import { ErrorQueryJob } from "./error";

export class ErrorEmbeder extends ErrorQueryJob {
	readonly step = "embeder";

	constructor(causeOfError: unknown) {
		super("embeder failed", causeOfError);
	}
}
