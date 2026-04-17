"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product, ServerFailureResponse } from "@plum/types";
import { serverUrl } from "../utilities/api";

interface SearchContextValue {
  queryProducts: Product[];
  loading: boolean;
  error: string | null;
  handleSearch: (text: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [queryProducts, setQueryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runQuery(url: string, init?: RequestInit) {
    setLoading(true);
    setError(null);

    try {
      const [res] = await Promise.all([
        fetch(url, init),
        addArtificialDelay(500),
      ]);

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

  useEffect(() => {
    runQuery(`${serverUrl}/products`);
  }, []);

  async function handleSearch(text: string) {
    await runQuery(`${serverUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  }

  return (
    <SearchContext.Provider
      value={{ queryProducts, loading, error, handleSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
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
