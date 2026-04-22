import type { Product } from "@plum/types";

export interface Querier {
	readonly querierType: string;
	query(embededInput: number[]): Promise<Product[]>;
	upload(embededInput: number[], productData: Product): Promise<void>;
}
