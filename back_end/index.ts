import startServer from "./server/startServer";
import productsHandler from "./handlers/get/products";
import queryHandler from "./handlers/post/query";
import pino from "pino";

function main() {
  const serverPort = 3003;
  const logger = pino();
  const server = startServer();

  server.get("/", (c) => c.json("hello world"));
  server.get("/products", productsHandler);
  server.post("/query", queryHandler);

  logger.info(`Server starting at port: ${serverPort}`);
  Bun.serve({ fetch: server.fetch, port: 3003 });
}

main();
