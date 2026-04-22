import { QdrantClient } from "@qdrant/js-client-rest";
import pino from "pino";

import fixtures from "../fixtures/fixture.json";
import { VECTOR_OUTPUT_SIZE } from "../modules/embed/const";

function randomVector(): number[] {
	return Array.from({ length: VECTOR_OUTPUT_SIZE }, () => Math.random());
}

async function seedDatabase() {
	const logger = pino({ name: __filename });
	const client = new QdrantClient({ host: "localhost", port: 6333 });
	const COLLECTION = "products";

	await client.createCollection(COLLECTION, {
		vectors: { size: VECTOR_OUTPUT_SIZE, distance: "Cosine" },
	});
	logger.info(`created collection "${COLLECTION}"`);

	await client.upsert(COLLECTION, {
		points: fixtures.map((item) => ({
			id: parseInt(item.id),
			vector: randomVector(),
			payload: {
				id: item.id,
				name: item.name,
				description: item.description,
				category: item.category,
				tag: item.tag,
				url: item.url,
				imageUr: "",
			},
		})),
	});

	logger.info(`inserted ${fixtures.length} points`);
}

seedDatabase();
