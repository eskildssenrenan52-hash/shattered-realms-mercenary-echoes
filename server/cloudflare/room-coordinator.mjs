import { DurableObject } from "cloudflare:workers";
import {
  EMPTY_POSE,
  FREE_POSE_MIN_INTERVAL_MS,
  MAX_FRAME_BYTES,
  MAX_PLAYERS,
  MULTIPLAYER_PROTOCOL,
  ROOM_TTL_MS,
  constantTimeEqual,
  createEmptyPose,
  generateRandomString,
  generateRoomCode,
  isPlainObject,
  normalizePlayerName,
  normalizeRoomCode,
  parseWireMessage,
  posesEqual,
  safeAttachment,
  validatePlayerName,
  validatePose,
} from "./protocol.mjs";

const CLOSE_POLICY = 1008;
const CLOSE_BAD_DATA = 1007;
const CLOSE_TOO_LARGE = 1009;
const CLOSE_NORMAL = 1000;
const SCHEMA = `
CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_activity_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  host_id TEXT,
  snapshot_sequence INTEGER NOT NULL DEFAULT 0,
  next_join_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  name TEXT NOT NULL,
  seat INTEGER NOT NULL,
  join_order INTEGER NOT NULL,
  last_pose_sequence INTEGER NOT NULL DEFAULT 0,
  connected INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(room_code) REFERENCES rooms(code)
);
CREATE INDEX IF NOT EXISTS players_room_connected ON players(room_code, connected, seat);
CREATE INDEX IF NOT EXISTS players_room_order ON players(room_code, connected, join_order);
`;

function now() {
  return Date.now();
}
function textBytes(value) {
  return new TextEncoder().encode(value).byteLength;
}
function errorPayload(code, message, fatal = false, details = {}) {
  return { type: "error", protocol: MULTIPLAYER_PROTOCOL, code, message, fatal, ...details };
}
function roomDefaultPose() {
  return { ...EMPTY_POSE };
}
function active(value) {
  return Number(value) === 1;
}

export class RoomCoordinator extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.sql = ctx.storage.sql;
    this.sessions = new Map();
    this.byConnectionId = new Map();
    this.sql.exec(SCHEMA);
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment();
      if (!attachment || typeof attachment.connectionId !== "string") continue;
      const state = safeAttachment(attachment);
      this.sessions.set(ws, state);
      this.byConnectionId.set(state.connectionId, ws);
    }
    if (typeof WebSocketRequestResponsePair === "function") {
      this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/internal/health" && request.method === "GET")
      return this.internalHealth();
    if (request.method !== "GET" || url.pathname !== "/ws")
      return new Response("Not found\n", { status: 404 });
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket")
      return new Response("Worker expected Upgrade: websocket\n", { status: 426 });
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const state = safeAttachment({
      connectionId: generateRandomString(16),
      roomCode: null,
      pose: createEmptyPose(),
    });
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(state);
    this.sessions.set(server, state);
    this.byConnectionId.set(state.connectionId, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, rawMessage) {
    const state = this.sessions.get(ws) ?? safeAttachment(ws.deserializeAttachment() ?? {});
    if (!this.sessions.has(ws)) this.restoreSession(ws, state);
    const text =
      typeof rawMessage === "string"
        ? rawMessage
        : rawMessage instanceof ArrayBuffer
          ? new TextDecoder().decode(rawMessage)
          : String(rawMessage);
    if (textBytes(text) > MAX_FRAME_BYTES)
      return this.sendError(
        ws,
        "frame_too_large",
        "A mensagem excede 16 KiB.",
        true,
        CLOSE_TOO_LARGE,
      );
    const parsed = parseWireMessage(text);
    if (parsed.error) {
      const messages = {
        invalid_json: "Envie um objeto JSON válido.",
        invalid_payload: "A mensagem precisa de type e campos válidos.",
        protocol_mismatch: `Protocolo esperado: ${MULTIPLAYER_PROTOCOL}.`,
        frame_too_large: "A mensagem excede 16 KiB.",
      };
      return this.sendError(
        ws,
        parsed.error,
        messages[parsed.error],
        parsed.error !== "invalid_payload",
        parsed.error === "frame_too_large"
          ? CLOSE_TOO_LARGE
          : parsed.error === "invalid_json"
            ? CLOSE_BAD_DATA
            : CLOSE_POLICY,
      );
    }
    const message = parsed.message;
    if (!state.roomCode) {
      if (message.type === "create") return this.createRoom(ws, state, message);
      if (message.type === "join") return this.joinRoom(ws, state, message);
      return this.sendError(
        ws,
        "handshake_required",
        "A primeira mensagem deve ser create ou join.",
        false,
      );
    }
    if (message.type === "pose") return this.handlePose(ws, state, message);
    if (message.type === "leave") return this.leaveRoom(ws, state, "client");
    return this.sendError(ws, "invalid_message", "Ação não permitida depois do handshake.", false);
  }

  webSocketClose(ws) {
    const state = this.sessions.get(ws) ?? ws.deserializeAttachment();
    this.sessions.delete(ws);
    if (state?.connectionId) this.byConnectionId.delete(state.connectionId);
    if (state?.roomCode && state.playerId)
      this.disconnectPlayer(state.roomCode, state.playerId, "disconnect");
  }

  async alarm() {
    const expired = this.sql.exec("SELECT code FROM rooms WHERE expires_at <= ?", now()).toArray();
    for (const row of expired) await this.expireRoom(row.code);
    const next = this.sql
      .exec("SELECT MIN(expires_at) AS next_expiry FROM rooms")
      .toArray()[0]?.next_expiry;
    if (Number.isFinite(next)) this.scheduleAlarm(Number(next));
    else await this.ctx.storage.deleteAlarm();
  }

  restoreSession(ws, state) {
    this.sessions.set(ws, state);
    if (state.connectionId) this.byConnectionId.set(state.connectionId, ws);
  }

  scheduleAlarm(timestamp) {
    const promise = this.ctx.storage.setAlarm(timestamp);
    if (promise?.catch) promise.catch(() => undefined);
  }

  internalHealth() {
    const rooms = this.sql.exec("SELECT COUNT(*) AS count FROM rooms").toArray()[0]?.count ?? 0;
    const players =
      this.sql.exec("SELECT COUNT(*) AS count FROM players WHERE connected = 1").toArray()[0]
        ?.count ?? 0;
    return Response.json({
      status: "ok",
      protocol: MULTIPLAYER_PROTOCOL,
      rooms: Number(rooms),
      players: Number(players),
      connections: this.sessions.size,
    });
  }

  createRoom(ws, state, message) {
    if (message.name !== undefined && !validatePlayerName(message.name))
      return this.sendError(
        ws,
        "invalid_name",
        "O nome deve ser texto sem controles e ter até 64 caracteres.",
        false,
      );
    const roomCode = normalizeRoomCode(message.roomCode) ?? generateRoomCode();
    if (this.sql.exec("SELECT code FROM rooms WHERE code = ?", roomCode).toArray().length)
      return this.sendError(ws, "room_exists", "Tente criar a sala novamente.", false);
    const current = now();
    const token = generateRandomString(32);
    this.sql.exec(
      "INSERT INTO rooms (code, token, created_at, last_activity_at, expires_at, host_id, snapshot_sequence, next_join_order) VALUES (?, ?, ?, ?, ?, NULL, 0, 0)",
      roomCode,
      token,
      current,
      current,
      current + ROOM_TTL_MS,
    );
    const player = this.addPlayer(roomCode, state, message.name, 0, 0, current, true);
    this.sql.exec(
      "UPDATE rooms SET host_id = ?, next_join_order = 1 WHERE code = ?",
      player.id,
      roomCode,
    );
    this.touchRoom(roomCode, current);
    this.updateAttachment(ws, state, {
      roomCode,
      playerId: player.id,
      name: player.name,
      seat: 0,
      joinOrder: 0,
      sequence: 0,
      lastPoseAt: 0,
      pose: roomDefaultPose(),
    });
    this.send(ws, {
      type: "created",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode,
      token,
      selfId: player.id,
      seat: 0,
      hostId: player.id,
      expiresAt: current + ROOM_TTL_MS,
      players: this.playerSnapshots(roomCode),
    });
    this.broadcastSnapshot(roomCode);
  }

  joinRoom(ws, state, message) {
    const roomCode = normalizeRoomCode(message.roomCode ?? message.code);
    if (!roomCode || typeof message.token !== "string" || message.token.length > 256)
      return this.sendError(ws, "invalid_join", "Informe roomCode e token válidos.", false);
    const room = this.room(roomCode);
    if (!room || room.expires_at <= now())
      return this.sendError(ws, "room_not_found", "Sala inexistente ou expirada.", false);
    if (!constantTimeEqual(room.token, message.token))
      return this.sendError(ws, "invalid_token", "O token da sala não confere.", false);
    if (message.name !== undefined && !validatePlayerName(message.name))
      return this.sendError(
        ws,
        "invalid_name",
        "O nome deve ser texto sem controles e ter até 64 caracteres.",
        false,
      );
    const requestedId =
      typeof message.playerId === "string"
        ? message.playerId
        : typeof message.selfId === "string"
          ? message.selfId
          : null;
    let existing = requestedId
      ? this.sql
          .exec(
            "SELECT * FROM players WHERE id = ? AND room_code = ? AND connected = 0",
            requestedId,
            roomCode,
          )
          .toArray()[0]
      : undefined;
    const count = Number(
      this.sql
        .exec(
          "SELECT COUNT(*) AS count FROM players WHERE room_code = ? AND connected = 1",
          roomCode,
        )
        .toArray()[0]?.count ?? 0,
    );
    if (!existing && count >= MAX_PLAYERS)
      return this.sendError(ws, "room_full", "Esta sala já tem cinco jogadores.", false);
    const current = now();
    const player = existing
      ? this.reconnectPlayer(roomCode, existing, message.name)
      : this.addPlayer(
          roomCode,
          state,
          message.name,
          this.findFreeSeat(roomCode),
          Number(room.next_join_order),
          current,
          true,
        );
    if (!existing)
      this.sql.exec(
        "UPDATE rooms SET next_join_order = next_join_order + 1 WHERE code = ?",
        roomCode,
      );
    this.touchRoom(roomCode, current);
    this.updateAttachment(ws, state, {
      roomCode,
      playerId: player.id,
      name: player.name,
      seat: player.seat,
      joinOrder: player.join_order,
      sequence: player.last_pose_sequence,
      lastPoseAt: 0,
      pose: roomDefaultPose(),
    });
    let updatedRoom = this.room(roomCode);
    if (!updatedRoom.host_id) {
      this.sql.exec("UPDATE rooms SET host_id = ? WHERE code = ?", player.id, roomCode);
      updatedRoom = this.room(roomCode);
    }
    this.send(ws, {
      type: "joined",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode,
      token: updatedRoom.token,
      selfId: player.id,
      seat: player.seat,
      hostId: updatedRoom.host_id,
      expiresAt: updatedRoom.expires_at,
      players: this.playerSnapshots(roomCode),
    });
    this.broadcastSnapshot(roomCode);
  }

  handlePose(ws, state, message) {
    const sequence = message.sequence;
    if (!Number.isSafeInteger(sequence) || sequence <= state.sequence)
      return this.sendError(
        ws,
        "sequence_out_of_order",
        "A sequência da pose precisa avançar.",
        false,
      );
    const pose = validatePose(message.pose);
    if (!pose)
      return this.sendError(
        ws,
        "invalid_pose",
        "Pose inválida: confira coordenadas, zona e campos.",
        false,
      );
    const current = now();
    const elapsed = current - state.lastPoseAt;
    if (state.lastPoseAt > 0 && elapsed < FREE_POSE_MIN_INTERVAL_MS)
      return this.sendError(
        ws,
        "rate_limited",
        "No modo gratuito, envie no máximo quatro poses por segundo.",
        false,
        CLOSE_POLICY,
        { retryAfterMs: FREE_POSE_MIN_INTERVAL_MS - elapsed },
      );
    const changed = !posesEqual(state.pose, pose);
    this.updateAttachment(ws, state, { sequence, lastPoseAt: current, pose });
    this.sql.exec(
      "UPDATE players SET last_pose_sequence = ?, connected = 1 WHERE id = ? AND room_code = ?",
      sequence,
      state.playerId,
      state.roomCode,
    );
    if (!changed) return;
    this.touchRoom(state.roomCode, current);
    this.broadcastSnapshot(state.roomCode);
  }

  leaveRoom(ws, state, reason) {
    if (!state.playerId || !state.roomCode)
      return this.sendError(ws, "not_in_room", "Esta conexão não está em uma sala.", false);
    this.send(ws, {
      type: "left",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: state.roomCode,
      selfId: state.playerId,
      reason,
    });
    this.disconnectPlayer(state.roomCode, state.playerId, "leave");
    this.updateAttachment(ws, state, { roomCode: null, playerId: null, seat: -1, joinOrder: -1 });
    try {
      ws.close(CLOSE_NORMAL, "left");
    } catch {
      /* already closed */
    }
  }

  disconnectPlayer(roomCode, playerId, reason) {
    const player = this.sql
      .exec("SELECT * FROM players WHERE id = ? AND room_code = ?", playerId, roomCode)
      .toArray()[0];
    const room = this.room(roomCode);
    if (!player || !room || !active(player.connected)) return;
    this.sql.exec(
      "UPDATE players SET connected = 0 WHERE id = ? AND room_code = ?",
      playerId,
      roomCode,
    );
    const nextHost =
      this.sql
        .exec(
          "SELECT id FROM players WHERE room_code = ? AND connected = 1 ORDER BY join_order LIMIT 1",
          roomCode,
        )
        .toArray()[0]?.id ?? null;
    if (room.host_id === playerId) {
      this.sql.exec("UPDATE rooms SET host_id = ? WHERE code = ?", nextHost, roomCode);
      if (nextHost)
        this.broadcast(roomCode, {
          type: "host_changed",
          protocol: MULTIPLAYER_PROTOCOL,
          roomCode,
          previousHostId: playerId,
          hostId: nextHost,
          reason,
        });
    }
    this.touchRoom(roomCode, now());
    this.broadcastSnapshot(roomCode);
  }

  async expireRoom(roomCode) {
    const room = this.room(roomCode);
    if (!room) return;
    this.broadcast(roomCode, errorPayload("room_expired", "A sala expirou por inatividade.", true));
    for (const [ws, state] of this.sessions)
      if (state.roomCode === roomCode) {
        try {
          ws.close(CLOSE_NORMAL, "room expired");
        } catch {
          /* ignored */
        }
      }
    this.sql.exec("DELETE FROM players WHERE room_code = ?", roomCode);
    this.sql.exec("DELETE FROM rooms WHERE code = ?", roomCode);
  }

  addPlayer(roomCode, state, rawName, seat, joinOrder, joinedAt, connected) {
    const player = {
      id: `p_${generateRandomString(16)}`,
      name: normalizePlayerName(rawName),
      seat,
      join_order: joinOrder,
      last_pose_sequence: 0,
    };
    this.sql.exec(
      "INSERT INTO players (id, room_code, name, seat, join_order, last_pose_sequence, connected) VALUES (?, ?, ?, ?, ?, 0, ?)",
      player.id,
      roomCode,
      player.name,
      seat,
      joinOrder,
      connected ? 1 : 0,
    );
    return player;
  }

  reconnectPlayer(roomCode, existing, rawName) {
    const name = normalizePlayerName(rawName ?? existing.name);
    this.sql.exec(
      "UPDATE players SET name = ?, connected = 1 WHERE id = ? AND room_code = ?",
      name,
      existing.id,
      roomCode,
    );
    return { ...existing, name, last_pose_sequence: Number(existing.last_pose_sequence) };
  }

  findFreeSeat(roomCode) {
    const occupied = new Set(
      this.sql
        .exec("SELECT seat FROM players WHERE room_code = ? AND connected = 1", roomCode)
        .toArray()
        .map((row) => Number(row.seat)),
    );
    for (let seat = 0; seat < MAX_PLAYERS; seat += 1) if (!occupied.has(seat)) return seat;
    return -1;
  }

  room(roomCode) {
    return this.sql.exec("SELECT * FROM rooms WHERE code = ?", roomCode).toArray()[0] ?? null;
  }

  touchRoom(roomCode, timestamp) {
    const expires = timestamp + ROOM_TTL_MS;
    this.sql.exec(
      "UPDATE rooms SET last_activity_at = ?, expires_at = ? WHERE code = ?",
      timestamp,
      expires,
      roomCode,
    );
    this.scheduleAlarm(expires);
  }

  playerSnapshots(roomCode) {
    const room = this.room(roomCode);
    const attachments = new Map(
      [...this.sessions.values()]
        .filter((state) => state.roomCode === roomCode && state.playerId)
        .map((state) => [state.playerId, state]),
    );
    return this.sql
      .exec("SELECT * FROM players WHERE room_code = ? AND connected = 1 ORDER BY seat", roomCode)
      .toArray()
      .map((player) => ({
        id: player.id,
        name: player.name,
        seat: Number(player.seat),
        host: player.id === room?.host_id,
        ...(attachments.get(player.id)?.pose ?? roomDefaultPose()),
      }));
  }

  broadcastSnapshot(roomCode) {
    const room = this.room(roomCode);
    if (!room) return;
    const sequence = Number(room.snapshot_sequence) + 1;
    this.sql.exec("UPDATE rooms SET snapshot_sequence = ? WHERE code = ?", sequence, roomCode);
    this.broadcast(roomCode, {
      type: "snapshot",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode,
      sequence,
      hostId: room.host_id,
      expiresAt: Number(room.expires_at),
      players: this.playerSnapshots(roomCode),
    });
  }

  broadcast(roomCode, payload) {
    for (const [ws, state] of this.sessions)
      if (state.roomCode === roomCode) this.send(ws, payload);
  }

  updateAttachment(ws, state, patch) {
    Object.assign(state, patch);
    const next = safeAttachment(state);
    this.sessions.set(ws, next);
    this.byConnectionId.set(next.connectionId, ws);
    ws.serializeAttachment(next);
  }

  send(ws, payload) {
    try {
      const serialized = JSON.stringify(payload);
      if (textBytes(serialized) > MAX_FRAME_BYTES)
        return this.sendError(
          ws,
          "server_frame_too_large",
          "A resposta excede 16 KiB.",
          true,
          CLOSE_TOO_LARGE,
        );
      ws.send(serialized);
    } catch {
      try {
        ws.close(CLOSE_POLICY, "send failed");
      } catch {
        /* ignored */
      }
    }
  }

  sendError(ws, code, message, fatal, closeCode = CLOSE_POLICY, details = {}) {
    this.send(ws, errorPayload(code, message, fatal, details));
    if (fatal) {
      try {
        ws.close(closeCode, code);
      } catch {
        /* ignored */
      }
    }
  }
}
