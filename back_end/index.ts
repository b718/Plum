import productsHandler from "./handlers/get/products";
import resultsHandler from "./handlers/get/results";
import queryHandler from "./handlers/post/query";
import { getLogger } from "./logger";
import { EmbederGoogle } from "./modules/embeder/embeder-google";
import { QuerierQdrant } from "./modules/querier/querier-qdrant";
import { StorerPostgres } from "./modules/query-pipeline/storer/storer-postgres";
import { TransformerGoogle } from "./modules/query-pipeline/transform/transformer-google";
import { ScraperGrailed } from "./modules/scraper-pipeline/scraper/scraper-grailed";
import { ScraperSsense } from "./modules/scraper-pipeline/scraper/scraper-ssense";
import { QueryWorker } from "./modules/workers/query/query-worker";
import { ScraperWorkerGrailed } from "./modules/workers/scraper/scraper-worker-grailed";
import { ScraperWorkerSsense } from "./modules/workers/scraper/scraper-worker-ssense";
import startQueue from "./server/start-queue";
import startServer from "./server/start-server";

function main() {
	const serverPort = 3003;
	const logger = getLogger();
	const server = startServer();
	const queue = startQueue();

	// Interfaces
	const transformer = new TransformerGoogle();
	const embeder = new EmbederGoogle();
	const querier = new QuerierQdrant();
	const storer = new StorerPostgres();

	// Start query workers
	const queryWorker = new QueryWorker(transformer, embeder, querier, storer);
	queryWorker.startWorkers(3);

	// Start grailed scrape workers
	const grailedWorker = new ScraperWorkerGrailed(new ScraperGrailed(logger), embeder, querier, storer);
	grailedWorker.startWorkers(5);

	// Start ssense scrape workers
	const ssenseWorker = new ScraperWorkerSsense(new ScraperSsense(logger), embeder, querier, storer);
	ssenseWorker.startWorkers(5);

	// Endpoints
	server.get("/products", productsHandler);
	server.get("/results/:jobId", resultsHandler(storer, queue));
	server.post("/query", queryHandler(queue));

	logger.info(`Server starting at port: ${serverPort}`);
	Bun.serve({ fetch: server.fetch, port: 3003, idleTimeout: 60 });
}

main();
