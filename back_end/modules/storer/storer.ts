import type { Product } from "@plum/types";

export interface PagedResult {
	products: Product[];
	page: number;
	totalPages: number;
}

export interface Storer {
	readonly storerType: string;
	upload(jobId: string, products: Product[]): Promise<void>;
	uploadProduct(product: Product): Promise<void>;
	query(jobId: string, page: number): Promise<PagedResult>;
}
