import type { Product } from "@plum/types";

import fixtures from "../../fixtures/fixture.json";

export async function queryDatabase(_embedding: number[]): Promise<Product[]> {
  // mock: real impl would vector-search Qdrant
  return fixtures as Product[];
}
