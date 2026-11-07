import { MULTIPLAYER_PROTOCOL, startRoomServer } from "./room-server.mjs";

let server;

try {
  server = await startRoomServer();
  const address = server.address();
  const host = typeof address === "object" && address ? address.host : process.env.HOST || "127.0.0.1";
  const port = typeof address === "object" && address ? address.port : process.env.PORT || 8787;
  console.log(
    `shattered-realms-room ${MULTIPLAYER_PROTOCOL} listening on http://${host}:${port} (GET /healthz, WS /ws)`,
  );
} catch (error) {
  console.error("Unable to start room server", error);
  process.exitCode = 1;
}

const shutdown = async (signal) => {
  if (!server) return;
  console.log(`received ${signal}; closing room server`);
  await server.close();
  process.exit(0);
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
