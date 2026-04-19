import pino from "pino";

import productsHandler from "./handlers/get/products";
import resultsHandler from "./handlers/get/results";
import queryHandler from "./handlers/post/query";
import startWorkers from "./modules/workers/worker";
import startQueue from "./server/startQueue";
import startServer from "./server/startServer";

function main() {
	const serverPort = 3003;
	const logger = pino();
	const server = startServer();
	const queue = startQueue();
	startWorkers(3);

	server.get("/", (c) => c.json("hello world"));
	server.get("/products", productsHandler);
	server.get("/results/:jobId", resultsHandler());
	server.post("/query", queryHandler(queue));

	logger.info(`Server starting at port: ${serverPort}`);
	Bun.serve({ fetch: server.fetch, port: 3003, idleTimeout: 60 });
}

main();
