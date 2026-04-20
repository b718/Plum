"use client";

import ProductGrid from "./ProductGrid";
import { useSearch } from "./context/SearchContext";

export default function ProductGridSearch() {
	const { queryProducts, loading, error } = useSearch();
	return <ProductGrid products={queryProducts} loading={loading} error={error} />;
}
