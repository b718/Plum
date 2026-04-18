import { QdrantClient } from "@qdrant/js-client-rest";
import pino from "pino";

async function seedDatabase() {
  const logger = pino({ name: __filename });
  const client = new QdrantClient({ host: "localhost", port: 6333 });
  const COLLECTION = "products";
  const VECTOR_SIZE = 4;

  await client.createCollection(COLLECTION, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
  logger.info(`created collection "${COLLECTION}"`);

  await client.upsert(COLLECTION, {
    points: [
      { id: 1, vector: [0.1, 0.2, 0.3, 0.4], payload: { label: "apple" } },
      { id: 2, vector: [0.9, 0.8, 0.7, 0.6], payload: { label: "orange" } },
      { id: 3, vector: [0.1, 0.25, 0.35, 0.45], payload: { label: "pear" } },
    ],
  });

  logger.info("inserted 3 points");
}

seedDatabase();
