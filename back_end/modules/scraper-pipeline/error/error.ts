export abstract class ErrorScraperJob extends Error {
	abstract readonly step: string;

	constructor(message: string, cause: unknown) {
		super(message, { cause });
	}
}
