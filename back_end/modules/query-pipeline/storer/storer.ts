import type { Product } from "@plum/types";

export interface Storer {
	readonly storerType: string;
	upload(jobId: string, products: Product[]): Promise<void>;
	query(jobId: string): Promise<Product[]>;
}
