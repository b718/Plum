import pino from "pino";
import type { Logger } from "pino";

const isDev = process.env["NODE_ENV"] !== "production";

const baseLogger: Logger = pino(
	isDev ? { transport: { target: "pino-pretty", options: { colorize: true } } } : {},
);

export function getLogger(name?: string): Logger {
	if (name == undefined) {
		return baseLogger;
	}

	return baseLogger.child({ name: name });
}

export type { Logger };
