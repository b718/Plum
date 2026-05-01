"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ChatBox from "@/components/ChatBox";

import type { Product } from "@plum/types";

import ProductGrid from "../../../components/ProductGrid";
import { serverUrl } from "../../../utilities/api";

export default function ResultsPage() {
	const { resultId } = useParams<{ resultId: string }>();
	const searchParams = useSearchParams();
	const router = useRouter();
	const query = searchParams.get("q") ?? "";
	const page = Number(searchParams.get("page") ?? "1");
	const [products, setProducts] = useState<Product[]>([]);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setProducts([]);
		const eventSource = new EventSource(`${serverUrl}/results/${resultId}?page=${page}`);

		eventSource.onmessage = (e) => {
			const data = JSON.parse(e.data);
			setProducts(data.products);
			setTotalPages(data.totalPages);
			setLoading(false);
			eventSource.close();
		};
		eventSource.onerror = () => {
			setError("Something went wrong. Please try a new search.");
			setLoading(false);
			eventSource.close();
		};
		eventSource.addEventListener("timeout", () => {
			setError("Search timed out. Please refresh the page.");
			setLoading(false);
			eventSource.close();
		});

		return () => eventSource.close();
	}, [resultId, page]);

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(newPage));
		router.replace(`?${params.toString()}`);
	};

	return (
		<main className="flex min-h-screen flex-col items-center gap-10 px-4 py-16">
			<ChatBox />
			<ProductGrid
				products={products}
				query={query}
				loading={loading}
				error={error}
				page={page}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		</main>
	);
}
