import type { Product } from "@plum/types";

export interface Embeder {
	readonly embederType: string;
	embedUserInput(userInput: string): Promise<number[]>;
	embedProductData(productData: Product): void;
}
