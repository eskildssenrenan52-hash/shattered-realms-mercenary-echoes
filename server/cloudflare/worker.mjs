import { RoomCoordinator } from "./room-coordinator.mjs";
import { MULTIPLAYER_PROTOCOL, originAllowed, parseOrigins } from "./protocol.mjs";

const quota = { windowStartedAt: Date.now(), workerRequests: 0 };
const DAY_MS = 24 * 60 * 60 * 1000;
const FREE_WORKER_REQUEST_LIMIT = 100_000;
const SOFT_GUARD_RATIO = 0.9;

function countRequest() {
  const now = Date.now();
  if (now - quota.windowStartedAt >= DAY_MS) {
    quota.windowStartedAt = now;
    quota.workerRequests = 0;
  }
  quota.workerRequests += 1;
  return quota.workerRequests;
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extra,
    },
  });
}

async function health(env, requestCount) {
  let coordinatorHealth = { rooms: 0, players: 0, connections: 0 };
  try {
    const response = await env.ROOM_COORDINATOR.getByName("lobby").fetch("https://internal/health");
    if (response.ok) coordinatorHealth = await response.json();
  } catch {
    // Health remains useful even while the local binding is unavailable.
  }
  return json(
    {
      status: "ok",
      protocol: MULTIPLAYER_PROTOCOL,
      service: "cloudflare-durable-object-lobby",
      rooms: Number(coordinatorHealth.rooms ?? 0),
      players: Number(coordinatorHealth.players ?? 0),
      connections: Number(coordinatorHealth.connections ?? 0),
      quota: {
        mode: "free-soft-guard",
        workerRequestsObserved: requestCount,
        workerRequestsDailyLimit: FREE_WORKER_REQUEST_LIMIT,
        softLimit: Math.floor(FREE_WORKER_REQUEST_LIMIT * SOFT_GUARD_RATIO),
        warning: requestCount >= FREE_WORKER_REQUEST_LIMIT * SOFT_GUARD_RATIO,
        websocketMessagesPerRequest: 20,
        clientPoseMaxPerSecond: 4,
      },
      originAllowlistConfigured: Boolean(parseOrigins(env.ORIGIN_ALLOWLIST)),
    },
    200,
    {
      "x-quota-soft-guard":
        requestCount >= FREE_WORKER_REQUEST_LIMIT * SOFT_GUARD_RATIO ? "warning" : "ok",
      "x-worker-requests-window": String(requestCount),
    },
  );
}

export default {
  async fetch(request, env) {
    const requestCount = countRequest();
    const url = new URL(request.url);
    const allowlist = parseOrigins(env.ORIGIN_ALLOWLIST);

    if (request.method === "GET" && url.pathname === "/healthz") return health(env, requestCount);
    if (url.pathname !== "/ws") return new Response("Not found\n", { status: 404 });
    if (request.method !== "GET")
      return new Response("Worker expected GET method\n", { status: 400 });
    if (requestCount > FREE_WORKER_REQUEST_LIMIT)
      return new Response("Free quota soft guard reached\n", {
        status: 429,
        headers: { "retry-after": "3600", "x-quota-soft-guard": "blocked" },
      });
    if (!originAllowed(request.headers.get("Origin"), allowlist))
      return new Response("Forbidden\n", { status: 403 });
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket")
      return new Response("Worker expected Upgrade: websocket\n", { status: 426 });

    // The room code is deliberately not required here: the existing client sends create/join
    // only after the WebSocket upgrade. The coordinator owns the stable hibernating socket set.
    return env.ROOM_COORDINATOR.getByName("lobby").fetch(request);
  },
};

export { RoomCoordinator };
