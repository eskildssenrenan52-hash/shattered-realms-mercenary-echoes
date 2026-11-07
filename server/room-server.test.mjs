import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import WebSocket from "ws";
import {
  MAX_PLAYERS,
  MULTIPLAYER_PROTOCOL,
  startRoomServer,
} from "./room-server.mjs";

const activeSockets = new Set();
const inboxes = new WeakMap();
let activeServer;

function wsUrl(server) {
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return `ws://127.0.0.1:${address.port}/ws`;
}

function waitForOpen(socket, timeoutMs = 1_500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.removeListener("open", onOpen);
      socket.removeListener("error", onError);
      reject(new Error("WebSocket open timeout"));
    }, timeoutMs);
    const onOpen = () => {
      clearTimeout(timer);
      socket.removeListener("error", onError);
      resolve(socket);
    };
    const onError = (error) => {
      clearTimeout(timer);
      socket.removeListener("open", onOpen);
      reject(error);
    };
    socket.once("open", onOpen);
    socket.once("error", onError);
  });
}

async function openClient(server, options = {}) {
  const socket = new WebSocket(wsUrl(server), options);
  activeSockets.add(socket);
  ensureInbox(socket);
  await waitForOpen(socket);
  return socket;
}

function ensureInbox(socket) {
  const existing = inboxes.get(socket);
  if (existing) return existing;
  const inbox = { messages: [], waiters: [] };
  socket.on("message", (data) => {
    let value;
    try {
      value = JSON.parse(data.toString());
    } catch {
      return;
    }
    const waiterIndex = inbox.waiters.findIndex((waiter) => waiter.predicate(value));
    if (waiterIndex >= 0) {
      const [waiter] = inbox.waiters.splice(waiterIndex, 1);
      clearTimeout(waiter.timer);
      waiter.resolve(value);
    } else {
      inbox.messages.push(value);
    }
  });
  inboxes.set(socket, inbox);
  return inbox;
}

function waitForMessage(socket, predicate, timeoutMs = 2_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("WebSocket message timeout"));
    }, timeoutMs);
    const inbox = ensureInbox(socket);
    const bufferedIndex = inbox.messages.findIndex(predicate);
    if (bufferedIndex >= 0) {
      const [value] = inbox.messages.splice(bufferedIndex, 1);
      clearTimeout(timer);
      resolve(value);
      return;
    }
    inbox.waiters.push({ predicate, resolve, reject, timer });
  });
}

function send(socket, message) {
  socket.send(JSON.stringify(message));
}

async function health(server) {
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const response = await fetch(`http://127.0.0.1:${address.port}/healthz`);
  assert.equal(response.status, 200);
  return response.json();
}

async function newServer(options = {}) {
  activeServer = await startRoomServer({
    host: "127.0.0.1",
    port: 0,
    cleanupIntervalMs: 20,
    heartbeatIntervalMs: 100,
    ...options,
  });
  return activeServer;
}

async function closeSocket(socket) {
  activeSockets.delete(socket);
  if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 250);
      socket.once("close", () => {
        clearTimeout(timer);
        resolve();
      });
      socket.close();
    });
  } else if (socket.readyState !== WebSocket.CLOSED) {
    socket.terminate();
  }
}

afterEach(async () => {
  for (const socket of activeSockets) socket.terminate();
  activeSockets.clear();
  if (activeServer) await activeServer.close();
  activeServer = undefined;
});

test("healthz e create+join entregam roster, snapshot e relay de pose", async () => {
  const server = await newServer();
  assert.deepEqual(await health(server), {
    status: "ok",
    protocol: MULTIPLAYER_PROTOCOL,
    rooms: 0,
    players: 0,
    connections: 0,
    uptimeSeconds: 0,
  });

  const host = await openClient(server);
  const createdPromise = waitForMessage(host, (message) => message.type === "created");
  send(host, { type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "Anfitrião" });
  const created = await createdPromise;
  assert.match(created.roomCode, /^[A-HJ-NP-Z2-9]{8}$/);
  assert.match(created.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(created.selfId, /^p_[A-Za-z0-9_-]+$/);
  assert.equal(created.seat, 0);
  await waitForMessage(host, (message) => message.type === "snapshot" && message.sequence === 1);

  const guest = await openClient(server);
  const hostJoinSnapshot = waitForMessage(
    host,
    (message) => message.type === "snapshot" && message.players.length === 2,
  );
  const guestJoined = waitForMessage(guest, (message) => message.type === "joined");
  const guestSnapshot = waitForMessage(guest, (message) => message.type === "snapshot" && message.players.length === 2);
  send(guest, {
    type: "join",
    protocol: MULTIPLAYER_PROTOCOL,
    roomCode: created.roomCode,
    token: created.token,
    name: "Visitante",
  });
  const joined = await guestJoined;
  const [hostSnapshot, guestRosterSnapshot] = await Promise.all([hostJoinSnapshot, guestSnapshot]);
  assert.equal(joined.roomCode, created.roomCode);
  assert.equal(joined.token, created.token);
  assert.notEqual(joined.selfId, created.selfId);
  assert.equal(joined.hostId, created.hostId);
  assert.equal(hostSnapshot.players.length, 2);
  assert.deepEqual(
    guestRosterSnapshot.players.map((player) => player.id),
    hostSnapshot.players.map((player) => player.id),
  );

  const poseSnapshot = waitForMessage(
    guest,
    (message) =>
      message.type === "snapshot" &&
      message.players.some((player) => player.id === created.selfId && player.x === 321),
  );
  send(host, {
    type: "pose",
    protocol: MULTIPLAYER_PROTOCOL,
    sequence: 1,
    pose: { x: 321, y: 654, zone: "overworld", dir: 1, frame: 2, palette: 3, attacking: true },
  });
  const relayed = await poseSnapshot;
  assert.deepEqual(
    relayed.players.find((player) => player.id === created.selfId),
    {
      id: created.selfId,
      name: "Anfitrião",
      seat: 0,
      host: true,
      x: 321,
      y: 654,
      zone: "overworld",
      dir: 1,
      frame: 2,
      palette: 3,
      attacking: true,
    },
  );

  const currentHealth = await health(server);
  assert.equal(currentHealth.rooms, 1);
  assert.equal(currentHealth.players, 2);
});

test("limita salas a cinco assentos e rejeita o sexto jogador", async () => {
  const server = await newServer();
  const host = await openClient(server);
  const createdPromise = waitForMessage(host, (message) => message.type === "created");
  send(host, { type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "Host" });
  const created = await createdPromise;
  await waitForMessage(host, (message) => message.type === "snapshot");

  const guests = [];
  for (let index = 1; index < MAX_PLAYERS; index += 1) {
    const guest = await openClient(server);
    guests.push(guest);
    const joinedPromise = waitForMessage(guest, (message) => message.type === "joined");
    send(guest, {
      type: "join",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: created.roomCode,
      token: created.token,
      name: `Jogador ${index}`,
    });
    const joined = await joinedPromise;
    assert.equal(joined.seat, index);
    await waitForMessage(guest, (message) => message.type === "snapshot" && message.players.length === index + 1);
  }

  const overflow = await openClient(server);
  const rejectedPromise = waitForMessage(overflow, (message) => message.type === "error");
  send(overflow, {
    type: "join",
    protocol: MULTIPLAYER_PROTOCOL,
    roomCode: created.roomCode,
    token: created.token,
    name: "Excedente",
  });
  const rejected = await rejectedPromise;
  assert.equal(rejected.code, "room_full");
  assert.equal(rejected.fatal, false);
  assert.deepEqual((await health(server)).players, MAX_PLAYERS);
});

test("valida protocolo, payload, sequência, origem e tamanho de frame", async () => {
  const server = await newServer({
    originAllowlist: ["https://allowed.example"],
    maxFrameBytes: 512,
  });
  const denied = new WebSocket(wsUrl(server), { headers: { origin: "https://blocked.example" } });
  activeSockets.add(denied);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("origin rejection timeout")), 1_500);
    denied.once("open", () => reject(new Error("disallowed Origin was accepted")));
    denied.once("error", () => undefined);
    denied.once("close", () => {
      clearTimeout(timer);
      resolve();
    });
  });

  const client = await openClient(server, { headers: { origin: "https://allowed.example" } });
  const protocolError = waitForMessage(client, (message) => message.type === "error");
  send(client, { type: "create", protocol: "wrong-v0", name: "Nope" });
  assert.equal((await protocolError).code, "protocol_mismatch");
  await new Promise((resolve) => client.once("close", resolve));

  const valid = await openClient(server, { headers: { origin: "https://allowed.example" } });
  const createdPromise = waitForMessage(valid, (message) => message.type === "created");
  send(valid, { type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "Validador" });
  const created = await createdPromise;
  await waitForMessage(valid, (message) => message.type === "snapshot");

  const invalidPose = waitForMessage(valid, (message) => message.type === "error" && message.code === "invalid_pose");
  send(valid, {
    type: "pose",
    protocol: MULTIPLAYER_PROTOCOL,
    sequence: 1,
    pose: { x: 999_999, y: 0, zone: "overworld", dir: 0, frame: 0, palette: 0, attacking: false },
  });
  await invalidPose;

  const goodSnapshot = waitForMessage(valid, (message) => message.type === "snapshot" && message.sequence > 1);
  send(valid, {
    type: "pose",
    protocol: MULTIPLAYER_PROTOCOL,
    sequence: 1,
    pose: { x: 1, y: 2, zone: "overworld", dir: 0, frame: 0, palette: 0, attacking: false },
  });
  await goodSnapshot;

  const sequenceError = waitForMessage(valid, (message) => message.type === "error" && message.code === "sequence_out_of_order");
  send(valid, {
    type: "pose",
    protocol: MULTIPLAYER_PROTOCOL,
    sequence: 1,
    pose: { x: 3, y: 4, zone: "overworld", dir: 0, frame: 0, palette: 0, attacking: false },
  });
  await sequenceError;

  const oversized = await openClient(server, { headers: { origin: "https://allowed.example" } });
  const oversizedClosed = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("oversized frame was not closed")), 1_500);
    oversized.once("close", (code) => {
      clearTimeout(timer);
      resolve(code);
    });
    oversized.once("error", () => undefined);
  });
  oversized.send(JSON.stringify({ type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "x".repeat(1_000) }));
  assert.equal(await oversizedClosed, 1009);
  assert.equal(created.roomCode.length, 8);
});

test("leave, disconnect e expiração removem presença e promovem host sem matar a sala", async () => {
  const server = await newServer({ roomTtlMs: 140 });
  const host = await openClient(server);
  const createdPromise = waitForMessage(host, (message) => message.type === "created");
  send(host, { type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "Primeiro" });
  const created = await createdPromise;
  await waitForMessage(host, (message) => message.type === "snapshot");

  const guest = await openClient(server);
  const joinedPromise = waitForMessage(guest, (message) => message.type === "joined");
  const hostAfterJoin = waitForMessage(host, (message) => message.type === "snapshot" && message.players.length === 2);
  send(guest, {
    type: "join",
    protocol: MULTIPLAYER_PROTOCOL,
    roomCode: created.roomCode,
    token: created.token,
    name: "Segundo",
  });
  await joinedPromise;
  await hostAfterJoin;

  const leftPromise = waitForMessage(guest, (message) => message.type === "left");
  const hostAfterLeave = waitForMessage(host, (message) => message.type === "snapshot" && message.players.length === 1);
  send(guest, { type: "leave", protocol: MULTIPLAYER_PROTOCOL });
  await leftPromise;
  await hostAfterLeave;

  const promoted = await openClient(server);
  const promotedJoined = waitForMessage(promoted, (message) => message.type === "joined");
  const hostBeforeDisconnect = waitForMessage(host, (message) => message.type === "snapshot" && message.players.length === 2);
  send(promoted, {
    type: "join",
    protocol: MULTIPLAYER_PROTOCOL,
    roomCode: created.roomCode,
    token: created.token,
    name: "Promovido",
  });
  const promotedData = await promotedJoined;
  await hostBeforeDisconnect;

  const hostChanged = waitForMessage(promoted, (message) => message.type === "host_changed");
  const promotedSnapshot = waitForMessage(
    promoted,
    (message) => message.type === "snapshot" && message.hostId === promotedData.selfId,
  );
  host.terminate();
  await hostChanged;
  const newSnapshot = await promotedSnapshot;
  assert.equal(newSnapshot.hostId, promotedData.selfId);
  assert.equal(newSnapshot.players.find((player) => player.id === promotedData.selfId).host, true);
  assert.equal((await health(server)).rooms, 1);

  await closeSocket(promoted);
  await new Promise((resolve) => setTimeout(resolve, 220));
  assert.equal((await health(server)).rooms, 0);
});

test("salas diferentes não compartilham snapshots nem erros", async () => {
  const server = await newServer();
  const roomAHost = await openClient(server);
  const createA = waitForMessage(roomAHost, (message) => message.type === "created");
  send(roomAHost, { type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "A" });
  const roomA = await createA;
  await waitForMessage(roomAHost, (message) => message.type === "snapshot");

  const roomBHost = await openClient(server);
  const createB = waitForMessage(roomBHost, (message) => message.type === "created");
  send(roomBHost, { type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "B" });
  const roomB = await createB;
  await waitForMessage(roomBHost, (message) => message.type === "snapshot");

  const roomAGuest = await openClient(server);
  const roomAJoin = waitForMessage(roomAGuest, (message) => message.type === "joined");
  send(roomAGuest, {
    type: "join",
    protocol: MULTIPLAYER_PROTOCOL,
    roomCode: roomA.roomCode,
    token: roomA.token,
    name: "A2",
  });
  await roomAJoin;
  await waitForMessage(roomAGuest, (message) => message.type === "snapshot" && message.players.length === 2);

  const unrelated = waitForMessage(roomBHost, () => true, 180);
  send(roomAHost, {
    type: "pose",
    protocol: MULTIPLAYER_PROTOCOL,
    sequence: 1,
    pose: { x: 50, y: 60, zone: "room-a", dir: 0, frame: 1, palette: 2, attacking: false },
  });
  await assert.rejects(unrelated, /timeout/);
  assert.equal((await health(server)).rooms, 2);
  assert.notEqual(roomA.roomCode, roomB.roomCode);
});
