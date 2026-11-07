import http from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { URL } from "node:url";
import { WebSocket, WebSocketServer } from "ws";

export const MULTIPLAYER_PROTOCOL = "shattered-realms-room-v1";
export const MAX_PLAYERS = 5;
export const ROOM_CODE_LENGTH = 8;
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const DEFAULTS = Object.freeze({
  host: process.env.HOST || "127.0.0.1",
  port: positiveInteger(process.env.PORT, 8787),
  maxFrameBytes: positiveInteger(process.env.MAX_FRAME_BYTES, 16 * 1024),
  handshakeTimeoutMs: positiveInteger(process.env.HANDSHAKE_TIMEOUT_MS, 10_000),
  poseMinIntervalMs: positiveInteger(process.env.POSE_MIN_INTERVAL_MS, 50),
  roomTtlMs: positiveInteger(process.env.ROOM_TTL_MS, 30 * 60 * 1000),
  heartbeatIntervalMs: positiveInteger(process.env.HEARTBEAT_INTERVAL_MS, 10_000),
  cleanupIntervalMs: positiveInteger(process.env.CLEANUP_INTERVAL_MS, 1_000),
  originAllowlist: process.env.ORIGIN_ALLOWLIST ?? process.env.ALLOWED_ORIGINS ?? null,
});

const CLOSE_POLICY = 1008;
const CLOSE_BAD_DATA = 1007;
const CLOSE_TOO_LARGE = 1009;
const CLOSE_NORMAL = 1000;

function positiveInteger(value, fallback) {
  const number = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function clampInteger(value, fallback, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, positiveInteger(value, fallback)));
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function byteLength(value) {
  return Buffer.byteLength(value, "utf8");
}

function hasControlCharacters(value) {
  return /[\u0000-\u001f\u007f]/u.test(value);
}

export function normalizeRoomCode(input) {
  if (typeof input !== "string") return null;
  const code = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length !== ROOM_CODE_LENGTH) return null;
  if ([...code].some((character) => !ROOM_CODE_ALPHABET.includes(character))) return null;
  return code;
}

export function normalizePlayerName(input) {
  if (typeof input !== "string") return "Aventureiro";
  const printable = [...input]
    .filter((character) => !hasControlCharacters(character))
    .join("");
  const name = [...printable.replace(/\s+/gu, " ").trim()].slice(0, 18).join("");
  return name || "Aventureiro";
}

export function validatePlayerName(input) {
  return typeof input === "string" && input.length <= 64 && !hasControlCharacters(input);
}

export function validatePose(value) {
  if (!isPlainObject(value)) return null;
  const { x, y, zone, dir, frame, palette, attacking } = value;
  if (typeof x !== "number" || !Number.isFinite(x) || Math.abs(x) > 250_000) return null;
  if (typeof y !== "number" || !Number.isFinite(y) || Math.abs(y) > 250_000) return null;
  if (typeof zone !== "string" || zone.length > 160 || hasControlCharacters(zone)) return null;
  if (typeof dir !== "number" || !Number.isInteger(dir) || dir < 0 || dir > 3) return null;
  if (typeof frame !== "number" || !Number.isInteger(frame) || frame < 0 || frame > 3) return null;
  if (
    typeof palette !== "number" ||
    !Number.isInteger(palette) ||
    palette < 0 ||
    palette > 15
  )
    return null;
  if (typeof attacking !== "boolean") return null;
  return { x, y, zone, dir, frame, palette, attacking };
}

function createEmptyPose() {
  return { x: 0, y: 0, zone: "", dir: 0, frame: 0, palette: 0, attacking: false };
}

function randomRoomCode() {
  let result = "";
  const limit = 256 - (256 % ROOM_CODE_ALPHABET.length);
  while (result.length < ROOM_CODE_LENGTH) {
    for (const byte of randomBytes(ROOM_CODE_LENGTH)) {
      if (byte >= limit) continue;
      result += ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length];
      if (result.length === ROOM_CODE_LENGTH) break;
    }
  }
  return result;
}

function randomToken() {
  return randomBytes(32).toString("base64url");
}

function randomPlayerId() {
  return `p_${randomBytes(16).toString("base64url")}`;
}

function tokensMatch(expected, received) {
  if (typeof received !== "string") return false;
  const expectedBytes = Buffer.from(expected, "utf8");
  const receivedBytes = Buffer.from(received, "utf8");
  if (expectedBytes.length !== receivedBytes.length) return false;
  return timingSafeEqual(expectedBytes, receivedBytes);
}

function parseOrigins(value) {
  if (value === null || value === undefined || value === "") return null;
  const values = Array.isArray(value) ? value : String(value).split(",");
  const origins = new Set(
    values.map((origin) => String(origin).trim()).filter((origin) => origin.length > 0),
  );
  return origins.size > 0 ? origins : null;
}

function urlPath(request) {
  try {
    return new URL(request.url ?? "/", "http://localhost").pathname;
  } catch {
    return null;
  }
}

function httpReject(socket, status, reason) {
  if (socket.destroyed) return;
  const body = `${reason}\n`;
  socket.write(
    `HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`,
  );
  socket.destroy();
}

export class RoomServer {
  constructor(options = {}) {
    const originAllowlist =
      options.originAllowlist === undefined
        ? DEFAULTS.originAllowlist
        : options.originAllowlist;
    this.config = Object.freeze({
      host: options.host ?? DEFAULTS.host,
      port: options.port ?? DEFAULTS.port,
      maxFrameBytes: clampInteger(
        options.maxFrameBytes,
        DEFAULTS.maxFrameBytes,
        256,
        1024 * 1024,
      ),
      handshakeTimeoutMs: clampInteger(
        options.handshakeTimeoutMs,
        DEFAULTS.handshakeTimeoutMs,
        25,
        10 * 60 * 1000,
      ),
      poseMinIntervalMs: clampInteger(options.poseMinIntervalMs, DEFAULTS.poseMinIntervalMs, 0, 60_000),
      roomTtlMs: clampInteger(options.roomTtlMs, DEFAULTS.roomTtlMs, 100, 24 * 60 * 60 * 1000),
      heartbeatIntervalMs: clampInteger(
        options.heartbeatIntervalMs,
        DEFAULTS.heartbeatIntervalMs,
        25,
        10 * 60 * 1000,
      ),
      cleanupIntervalMs: clampInteger(
        options.cleanupIntervalMs,
        DEFAULTS.cleanupIntervalMs,
        10,
        10 * 60 * 1000,
      ),
      originAllowlist: parseOrigins(originAllowlist),
    });

    this.rooms = new Map();
    this.connections = new Map();
    this.startedAt = Date.now();
    this.httpServer = http.createServer((request, response) => this.handleHttp(request, response));
    this.wsServer = new WebSocketServer({
      noServer: true,
      clientTracking: false,
      maxPayload: this.config.maxFrameBytes,
    });
    this.cleanupTimer = null;
    this.heartbeatTimer = null;
    this.closed = false;

    this.httpServer.on("upgrade", (request, socket, head) => {
      this.handleUpgrade(request, socket, head);
    });
    this.wsServer.on("connection", (socket, request) => {
      this.handleConnection(socket, request);
    });
    this.wsServer.on("error", () => {
      // An individual WebSocket failure is handled by that connection's close/error events.
    });
  }

  async listen() {
    if (this.closed) throw new Error("room server is closed");
    if (this.httpServer.listening) return this.address();
    await new Promise((resolve, reject) => {
      const onError = (error) => {
        this.httpServer.off("listening", onListening);
        reject(error);
      };
      const onListening = () => {
        this.httpServer.off("error", onError);
        resolve();
      };
      this.httpServer.once("error", onError);
      this.httpServer.once("listening", onListening);
      this.httpServer.listen(this.config.port, this.config.host);
    });
    this.cleanupTimer = setInterval(() => this.cleanupExpiredRooms(), this.config.cleanupIntervalMs);
    this.heartbeatTimer = setInterval(() => this.heartbeat(), this.config.heartbeatIntervalMs);
    return this.address();
  }

  address() {
    const address = this.httpServer.address();
    if (!address || typeof address === "string") return address;
    return { host: address.address, port: address.port };
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.cleanupTimer = null;
    this.heartbeatTimer = null;

    for (const connection of [...this.connections.values()]) {
      connection.closedByServer = true;
      if (connection.handshakeTimer) clearTimeout(connection.handshakeTimer);
      if (connection.socket.readyState === WebSocket.OPEN) connection.socket.close(1001, "server shutdown");
      else if (connection.socket.readyState !== WebSocket.CLOSED) connection.socket.terminate();
    }
    this.rooms.clear();

    await Promise.all([
      new Promise((resolve) => {
        if (!this.httpServer.listening) resolve();
        else this.httpServer.close(() => resolve());
      }),
      new Promise((resolve) => {
        if (!this.wsServer._server) resolve();
        else this.wsServer.close(() => resolve());
      }),
    ]);
  }

  health() {
    let players = 0;
    for (const room of this.rooms.values()) players += room.players.size;
    return {
      status: "ok",
      protocol: MULTIPLAYER_PROTOCOL,
      rooms: this.rooms.size,
      players,
      connections: this.connections.size,
      uptimeSeconds: Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000)),
    };
  }

  handleHttp(request, response) {
    const path = urlPath(request);
    if (request.method === "GET" && path === "/healthz") {
      const body = JSON.stringify(this.health());
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "content-length": Buffer.byteLength(body),
      });
      response.end(body);
      return;
    }
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found\n");
  }

  isOriginAllowed(origin) {
    if (!this.config.originAllowlist) return true;
    if (!origin) return true; // Native WebSocket clients do not send Origin.
    return this.config.originAllowlist.has("*") || this.config.originAllowlist.has(origin);
  }

  handleUpgrade(request, socket, head) {
    const path = urlPath(request);
    if (path !== "/ws") {
      httpReject(socket, 404, "Not Found");
      return;
    }
    const origin = typeof request.headers.origin === "string" ? request.headers.origin : undefined;
    if (!this.isOriginAllowed(origin)) {
      httpReject(socket, 403, "Forbidden");
      return;
    }
    if (this.closed) {
      httpReject(socket, 503, "Service Unavailable");
      return;
    }

    try {
      this.wsServer.handleUpgrade(request, socket, head, (client) => {
        this.wsServer.emit("connection", client, request);
      });
    } catch {
      socket.destroy();
    }
  }

  handleConnection(socket, request) {
    const connection = {
      socket,
      request,
      room: null,
      player: null,
      isAlive: true,
      closedByServer: false,
      handshakeTimer: null,
    };
    this.connections.set(socket, connection);
    connection.handshakeTimer = setTimeout(() => {
      if (!connection.room && socket.readyState === WebSocket.OPEN) {
        this.sendError(connection, "handshake_timeout", "Envie create ou join antes do timeout.", true);
      }
    }, this.config.handshakeTimeoutMs);

    socket.on("pong", () => {
      connection.isAlive = true;
    });
    socket.on("message", (data, isBinary) => {
      this.handleMessage(connection, data, isBinary);
    });
    socket.on("close", () => {
      this.dropConnection(connection);
    });
    socket.on("error", () => {
      // close follows error for normal ws failures; cleanup is isolated to this connection.
    });
  }

  handleMessage(connection, data, isBinary) {
    if (connection.closedByServer || connection.socket.readyState !== WebSocket.OPEN) return;
    if (isBinary) {
      this.sendError(connection, "invalid_payload", "A mensagem deve ser um JSON textual.", true, CLOSE_BAD_DATA);
      return;
    }

    const text = Buffer.isBuffer(data) ? data.toString("utf8") : String(data);
    if (byteLength(text) > this.config.maxFrameBytes) {
      this.sendError(connection, "frame_too_large", "A mensagem excede o tamanho máximo permitido.", true, CLOSE_TOO_LARGE);
      return;
    }

    let message;
    try {
      message = JSON.parse(text);
    } catch {
      this.sendError(connection, "invalid_json", "Envie um objeto JSON válido.", true, CLOSE_BAD_DATA);
      return;
    }
    if (!isPlainObject(message) || typeof message.type !== "string" || message.type.length > 32) {
      this.sendError(connection, "invalid_payload", "A mensagem precisa de type e campos válidos.", false);
      return;
    }
    if (message.protocol !== MULTIPLAYER_PROTOCOL) {
      this.sendError(connection, "protocol_mismatch", `Protocolo esperado: ${MULTIPLAYER_PROTOCOL}.`, true);
      return;
    }

    if (!connection.room) {
      if (message.type === "create") this.createRoom(connection, message);
      else if (message.type === "join") this.joinRoom(connection, message);
      else this.sendError(connection, "handshake_required", "A primeira mensagem deve ser create ou join.", false);
      return;
    }

    if (message.type === "pose") this.handlePose(connection, message);
    else if (message.type === "leave") this.leaveRoom(connection, "client");
    else this.sendError(connection, "invalid_message", "Ação não permitida depois do handshake.", false);
  }

  createRoom(connection, message) {
    if (connection.room) {
      this.sendError(connection, "already_in_room", "Esta conexão já está em uma sala.", false);
      return;
    }
    if (message.name !== undefined && !validatePlayerName(message.name)) {
      this.sendError(connection, "invalid_name", "O nome deve ser texto sem controles e ter até 64 caracteres.", false);
      return;
    }

    let code;
    do {
      code = randomRoomCode();
    } while (this.rooms.has(code));
    const now = Date.now();
    const room = {
      code,
      token: randomToken(),
      createdAt: now,
      lastActivityAt: now,
      expiresAt: now + this.config.roomTtlMs,
      hostId: null,
      nextJoinOrder: 0,
      snapshotSequence: 0,
      players: new Map(),
      expired: false,
    };
    this.rooms.set(code, room);
    const player = this.addPlayer(room, connection, message.name, 0, now);
    room.hostId = player.id;
    this.sendJson(connection, {
      type: "created",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: room.code,
      token: room.token,
      selfId: player.id,
      seat: player.seat,
      hostId: room.hostId,
      expiresAt: room.expiresAt,
      players: this.playerSnapshots(room),
    });
    this.broadcastSnapshot(room);
  }

  joinRoom(connection, message) {
    if (connection.room) {
      this.sendError(connection, "already_in_room", "Esta conexão já está em uma sala.", false);
      return;
    }
    const rawCode = message.roomCode ?? message.code;
    const code = normalizeRoomCode(rawCode);
    if (!code || typeof message.token !== "string" || message.token.length > 256) {
      this.sendError(connection, "invalid_join", "Informe roomCode e token válidos.", false);
      return;
    }
    const room = this.rooms.get(code);
    if (!room || room.expired) {
      this.sendError(connection, "room_not_found", "Sala inexistente ou expirada.", false);
      return;
    }
    if (!tokensMatch(room.token, message.token)) {
      this.sendError(connection, "invalid_token", "O token da sala não confere.", false);
      return;
    }
    if (room.players.size >= MAX_PLAYERS) {
      this.sendError(connection, "room_full", "Esta sala já tem cinco jogadores.", false);
      return;
    }
    if (message.name !== undefined && !validatePlayerName(message.name)) {
      this.sendError(connection, "invalid_name", "O nome deve ser texto sem controles e ter até 64 caracteres.", false);
      return;
    }

    const now = Date.now();
    room.lastActivityAt = now;
    room.expiresAt = now + this.config.roomTtlMs;
    const seat = this.findFreeSeat(room);
    const player = this.addPlayer(room, connection, message.name, seat, now);
    this.sendJson(connection, {
      type: "joined",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: room.code,
      token: room.token,
      selfId: player.id,
      seat: player.seat,
      hostId: room.hostId,
      expiresAt: room.expiresAt,
      players: this.playerSnapshots(room),
    });
    this.broadcastSnapshot(room);
  }

  addPlayer(room, connection, name, seat, now) {
    const player = {
      id: randomPlayerId(),
      name: normalizePlayerName(name),
      seat,
      joinedAt: now,
      joinOrder: room.nextJoinOrder++,
      lastPoseAt: 0,
      lastPoseSequence: 0,
      pose: createEmptyPose(),
    };
    connection.room = room;
    connection.player = player;
    if (connection.handshakeTimer) clearTimeout(connection.handshakeTimer);
    connection.handshakeTimer = null;
    room.players.set(player.id, player);
    return player;
  }

  findFreeSeat(room) {
    for (let seat = 0; seat < MAX_PLAYERS; seat += 1) {
      if (![...room.players.values()].some((player) => player.seat === seat)) return seat;
    }
    return -1;
  }

  handlePose(connection, message) {
    const player = connection.player;
    const room = connection.room;
    if (!player || !room) {
      this.sendError(connection, "not_in_room", "Entre em uma sala antes de enviar poses.", false);
      return;
    }
    const sequence = message.sequence;
    if (
      typeof sequence !== "number" ||
      !Number.isSafeInteger(sequence) ||
      sequence <= player.lastPoseSequence
    ) {
      this.sendError(connection, "sequence_out_of_order", "A sequência da pose precisa avançar.", false);
      return;
    }
    const pose = validatePose(message.pose);
    if (!pose) {
      this.sendError(connection, "invalid_pose", "Pose inválida: confira coordenadas, zona e campos.", false);
      return;
    }
    const now = Date.now();
    const elapsed = now - player.lastPoseAt;
    if (player.lastPoseAt > 0 && elapsed < this.config.poseMinIntervalMs) {
      this.sendError(connection, "rate_limited", "Envie poses com menor frequência.", false, undefined, {
        retryAfterMs: this.config.poseMinIntervalMs - elapsed,
      });
      return;
    }

    player.lastPoseAt = now;
    player.lastPoseSequence = sequence;
    player.pose = pose;
    room.lastActivityAt = now;
    room.expiresAt = now + this.config.roomTtlMs;
    this.broadcastSnapshot(room);
  }

  leaveRoom(connection, reason) {
    const room = connection.room;
    const player = connection.player;
    if (!room || !player) {
      this.sendError(connection, "not_in_room", "Esta conexão não está em uma sala.", false);
      return;
    }
    this.sendJson(connection, {
      type: "left",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: room.code,
      selfId: player.id,
      reason,
    });
    this.removePlayer(connection, false);
    connection.closedByServer = true;
    if (connection.socket.readyState === WebSocket.OPEN) connection.socket.close(CLOSE_NORMAL, "left");
  }

  removePlayer(connection, disconnected) {
    const room = connection.room;
    const player = connection.player;
    if (!room || !player) return;
    room.players.delete(player.id);
    connection.room = null;
    connection.player = null;
    if (room.players.size === 0) {
      this.rooms.delete(room.code);
      return;
    }

    room.lastActivityAt = Date.now();
    room.expiresAt = room.lastActivityAt + this.config.roomTtlMs;
    if (room.hostId === player.id) {
      const nextHost = [...room.players.values()].sort((left, right) => left.joinOrder - right.joinOrder)[0];
      const previousHostId = room.hostId;
      room.hostId = nextHost.id;
      this.broadcast(room, {
        type: "host_changed",
        protocol: MULTIPLAYER_PROTOCOL,
        roomCode: room.code,
        previousHostId,
        hostId: room.hostId,
        reason: disconnected ? "disconnect" : "leave",
      });
    }
    this.broadcastSnapshot(room);
  }

  dropConnection(connection) {
    if (connection.handshakeTimer) clearTimeout(connection.handshakeTimer);
    connection.handshakeTimer = null;
    if (connection.room && connection.player) this.removePlayer(connection, !connection.closedByServer);
    this.connections.delete(connection.socket);
  }

  playerSnapshots(room) {
    return [...room.players.values()]
      .sort((left, right) => left.seat - right.seat)
      .map((player) => ({
        id: player.id,
        name: player.name,
        seat: player.seat,
        host: player.id === room.hostId,
        ...player.pose,
      }));
  }

  sendJson(connection, message) {
    if (connection.socket.readyState !== WebSocket.OPEN) return;
    try {
      const serialized = JSON.stringify(message);
      if (byteLength(serialized) > this.config.maxFrameBytes) {
        this.sendError(connection, "server_frame_too_large", "A resposta excede o tamanho máximo.", true, CLOSE_TOO_LARGE);
        return;
      }
      connection.socket.send(serialized);
    } catch {
      connection.socket.terminate();
    }
  }

  broadcastSnapshot(room) {
    if (room.expired || !this.rooms.has(room.code)) return;
    const message = {
      type: "snapshot",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: room.code,
      sequence: ++room.snapshotSequence,
      hostId: room.hostId,
      expiresAt: room.expiresAt,
      players: this.playerSnapshots(room),
    };
    this.broadcast(room, message);
  }

  broadcast(room, message) {
    for (const connection of this.connections.values()) {
      if (connection.room !== room || connection.socket.readyState !== WebSocket.OPEN) continue;
      try {
        const serialized = JSON.stringify(message);
        if (byteLength(serialized) > this.config.maxFrameBytes) {
          this.sendError(connection, "server_frame_too_large", "O snapshot excede o tamanho máximo.", true, CLOSE_TOO_LARGE);
          continue;
        }
        connection.socket.send(serialized);
      } catch {
        connection.socket.terminate();
      }
    }
  }

  sendError(connection, code, message, fatal, closeCode = CLOSE_POLICY, details = {}) {
    if (connection.socket.readyState !== WebSocket.OPEN) return;
    const payload = {
      type: "error",
      protocol: MULTIPLAYER_PROTOCOL,
      code,
      message,
      fatal: Boolean(fatal),
      ...details,
    };
    try {
      connection.socket.send(JSON.stringify(payload), () => {
        if (fatal && connection.socket.readyState === WebSocket.OPEN) connection.socket.close(closeCode, code);
      });
    } catch {
      connection.socket.terminate();
    }
    if (fatal) connection.closedByServer = true;
  }

  heartbeat() {
    for (const connection of this.connections.values()) {
      if (connection.socket.readyState !== WebSocket.OPEN) continue;
      if (!connection.isAlive) {
        connection.closedByServer = true;
        connection.socket.terminate();
        continue;
      }
      connection.isAlive = false;
      try {
        connection.socket.ping();
      } catch {
        connection.socket.terminate();
      }
    }
  }

  cleanupExpiredRooms() {
    const now = Date.now();
    for (const room of [...this.rooms.values()]) {
      if (room.expired || now < room.expiresAt) continue;
      this.expireRoom(room);
    }
  }

  expireRoom(room) {
    if (room.expired) return;
    room.expired = true;
    this.rooms.delete(room.code);
    for (const connection of this.connections.values()) {
      if (connection.room !== room) continue;
      this.sendError(connection, "room_expired", "A sala expirou por inatividade.", true, CLOSE_NORMAL);
      connection.closedByServer = true;
    }
  }
}

export function createRoomServer(options = {}) {
  return new RoomServer(options);
}

export async function startRoomServer(options = {}) {
  const server = createRoomServer(options);
  await server.listen();
  return server;
}
