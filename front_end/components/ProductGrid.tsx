"use client";

import type { Product } from "@plum/types";

import ProductCard from "./ProductCard";

interface Props {
	products: Product[];
	query?: string;
	loading: boolean;
	error: string | null;
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
}

export default function ProductGrid({
	products,
	query,
	loading,
	error,
	page,
	totalPages,
	onPageChange,
}: Props) {
	if (loading) {
		return (
			<section className="w-full max-w-5xl flex flex-col items-center gap-3 py-16 text-gray-500">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
				<span className="text-sm">Searching...</span>
			</section>
		);
	}

	if (error) {
		return (
			<section className="w-full max-w-5xl">
				<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			</section>
		);
	}

	return (
		<section className="w-full max-w-5xl">
			{query && (
				<div className="mb-3 text-base font-semibold text-gray-900">Showing results for: {query}</div>
			)}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>

			{page && totalPages && onPageChange && (
				<div className="mt-6 flex items-center justify-center gap-4">
					<button
						disabled={page === 1}
						onClick={() => onPageChange(page - 1)}
						className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Previous
					</button>
					<span className="text-sm text-gray-600">
						Page {page} of {totalPages}
					</span>
					<button
						disabled={page === totalPages}
						onClick={() => onPageChange(page + 1)}
						className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Next
					</button>
				</div>
			)}
		</section>
	);
}
