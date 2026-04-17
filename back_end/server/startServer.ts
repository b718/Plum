import { Hono } from "hono";

export default function startServer() {
  const server = new Hono();
  return server;
}
