import { QdrantClient } from "@qdrant/js-client-rest";

import { VECTOR_OUTPUT_SIZE } from "../consts/embeded";
import fixtures from "../fixtures/fixture.json";
import { getLogger } from "../logger";
import { StorerPostgres } from "../modules/query-pipeline/storer/storer-postgres";

function randomVector(): number[] {
	return Array.from({ length: VECTOR_OUTPUT_SIZE }, () => Math.random());
}

async function seedDatabase() {
	const logger = getLogger(__filename);
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
				productDomainId: item.id,
				name: item.name,
				description: item.description,
				category: item.category,
				tag: item.tag,
				url: item.url,
				imageUrl: "",
			},
		})),
	});

	logger.info(`inserted ${fixtures.length} points`);

	const storer = new StorerPostgres();
	await storer.query("2"); // do this in seed data to try and break cold-start time
}

seedDatabase();
