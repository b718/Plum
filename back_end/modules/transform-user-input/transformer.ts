export interface Transformer {
	readonly transformerType: string;
	transformUserInput(userInput: string): Promise<string>;
}
