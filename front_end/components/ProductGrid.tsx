"use client";

import ProductCard from "./ProductCard";
import { useSearch } from "./context/SearchContext";

export default function ProductGrid() {
  const { queryProducts, loading, error } = useSearch();

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
