import { Hono } from "hono";
import { cors } from "hono/cors";

export default function startServer() {
  const server = new Hono();
  server.use("/*", cors());
  return server;
}
