export interface Transformer {
	readonly transformerType: string;
	transformUserInput(query: string): Promise<string>;
}
