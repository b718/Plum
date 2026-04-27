"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import type { Product, ServerFailureResponse } from "@plum/types";

import { serverUrl } from "../../utilities/api";

interface SearchContextValue {
	queryProducts: Product[];
	loading: boolean;
	error: string | null;
	handleSearch: (text: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

function useSearchState() {
	const router = useRouter();
	const [queryProducts, setQueryProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function runQuery(url: string, init?: RequestInit) {
		setLoading(true);
		setError(null);
		try {
			const [res] = await Promise.all([fetch(url, init), addArtificialDelay(500)]);
			if (!res.ok) {
				const data: ServerFailureResponse = await res.json();
				throw new Error(data.errorMessage ?? `Request failed (${res.status})`);
			}
			setQueryProducts(await res.json());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	async function handleSearch(text: string) {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${serverUrl}/query`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});
			if (!res.ok) {
				const data: ServerFailureResponse = await res.json();
				throw new Error(data.errorMessage ?? `Request failed (${res.status})`);
			}
			const { jobId } = await res.json();
			router.push(`/results/${jobId}?q=${encodeURIComponent(text)}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		runQuery(`${serverUrl}/products`);
	}, []);

	return { queryProducts, loading, error, handleSearch };
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
	const state = useSearchState();
	return <SearchContext.Provider value={state}>{children}</SearchContext.Provider>;
}

export function useSearch() {
	const searchContext = useContext(SearchContext);
	if (!searchContext) {
		throw new Error("useSearch must be used within SearchProvider");
	}
	return searchContext;
}

function addArtificialDelay(delay: number) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}
