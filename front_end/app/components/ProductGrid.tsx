"use client";

import { useState, useEffect } from "react";
import type { Product } from "@plum/types";
import ProductCard from "./ProductCard";
import { serverUrl } from "../utilities/api";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${serverUrl}/products`)
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <section className="w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
