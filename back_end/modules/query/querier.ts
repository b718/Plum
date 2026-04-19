import type { Product } from "@plum/types";

export interface Querier {
	readonly querierType: string;
	query(embededUserInput: number[]): Promise<Product[]>;
}
