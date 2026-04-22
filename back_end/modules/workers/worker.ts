export interface Worker {
	readonly workerType: string;
	startWorkers(workerCount: number): void;
}
