export interface Embeder {
	readonly embederType: string;
	embedContent(userInput: string): Promise<number[]>;
}
