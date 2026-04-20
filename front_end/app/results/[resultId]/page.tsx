"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ChatBox from "@/components/ChatBox";

import type { Product } from "@plum/types";

import ProductGrid from "../../../components/ProductGrid";
import { serverUrl } from "../../../utilities/api";

export default function ResultsPage() {
	const { resultId } = useParams<{ resultId: string }>();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const eventSource = new EventSource(`${serverUrl}/results/${resultId}`);

		eventSource.onmessage = (e) => {
			setProducts(JSON.parse(e.data));
			setLoading(false);
			eventSource.close();
		};
		eventSource.addEventListener("timeout", () => {
			setError("Search timed out — please try again.");
			setLoading(false);
			eventSource.close();
		});
		eventSource.onerror = () => {
			setError("Failed to fetch results.");
			setLoading(false);
			eventSource.close();
		};

		return () => eventSource.close();
	}, [resultId]);

	return (
		<main className="flex min-h-screen flex-col items-center gap-10 px-4 py-16">
			<ChatBox />
			<ProductGrid products={products} loading={loading} error={error} />
		</main>
	);
}
