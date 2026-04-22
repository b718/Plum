export abstract class ErrorQueryJob extends Error {
	abstract readonly step: string;

	constructor(message: string, causeOfError: unknown) {
		super(message, { cause: causeOfError });
	}
}
