export const MULTIPLAYER_PROTOCOL = "shattered-realms-room-v1";
export const MAX_PLAYERS = 5;
export const ROOM_CODE_LENGTH = 8;
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const MAX_FRAME_BYTES = 16 * 1024;
export const FREE_POSE_MIN_INTERVAL_MS = 250;
export const ROOM_TTL_MS = 30 * 60 * 1000;
export const EMPTY_POSE = Object.freeze({
  x: 0,
  y: 0,
  zone: "",
  dir: 0,
  frame: 0,
  palette: 0,
  attacking: false,
});

export function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
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
    .filter((character) => !/[\u0000-\u001f\u007f]/u.test(character))
    .join("");
  const name = [...printable.replace(/\s+/gu, " ").trim()].slice(0, 18).join("");
  return name || "Aventureiro";
}

export function validatePlayerName(input) {
  return typeof input === "string" && input.length <= 64 && !/[\u0000-\u001f\u007f]/u.test(input);
}

export function validatePose(value) {
  if (!isPlainObject(value)) return null;
  const { x, y, zone, dir, frame, palette, attacking } = value;
  if (typeof x !== "number" || !Number.isFinite(x) || Math.abs(x) > 250_000) return null;
  if (typeof y !== "number" || !Number.isFinite(y) || Math.abs(y) > 250_000) return null;
  if (typeof zone !== "string" || zone.length > 160 || /[\u0000-\u001f\u007f]/u.test(zone))
    return null;
  if (typeof dir !== "number" || !Number.isInteger(dir) || dir < 0 || dir > 3) return null;
  if (typeof frame !== "number" || !Number.isInteger(frame) || frame < 0 || frame > 3) return null;
  if (typeof palette !== "number" || !Number.isInteger(palette) || palette < 0 || palette > 15)
    return null;
  if (typeof attacking !== "boolean") return null;
  return { x, y, zone, dir, frame, palette, attacking };
}

export function posesEqual(left, right) {
  return (
    Boolean(left && right) &&
    left.x === right.x &&
    left.y === right.y &&
    left.zone === right.zone &&
    left.dir === right.dir &&
    left.frame === right.frame &&
    left.palette === right.palette &&
    left.attacking === right.attacking
  );
}

export function parseOrigins(value) {
  if (value === null || value === undefined || value === "") return null;
  const values = Array.isArray(value) ? value : String(value).split(",");
  const origins = new Set(values.map((origin) => String(origin).trim()).filter(Boolean));
  return origins.size ? origins : null;
}

export function originAllowed(origin, allowlist) {
  if (!allowlist || allowlist.size === 0 || !origin) return true;
  return allowlist.has("*") || allowlist.has(origin);
}

export function generateRandomString(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function generateRoomCode() {
  let code = "";
  const limit = 256 - (256 % ROOM_CODE_ALPHABET.length);
  while (code.length < ROOM_CODE_LENGTH) {
    const bytes = new Uint8Array(ROOM_CODE_LENGTH);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= limit) continue;
      code += ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length];
      if (code.length === ROOM_CODE_LENGTH) break;
    }
  }
  return code;
}

export function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length)
    return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1)
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export function createEmptyPose() {
  return { ...EMPTY_POSE };
}

export function parseWireMessage(value) {
  if (typeof value !== "string") return { error: "invalid_payload" };
  if (new TextEncoder().encode(value).byteLength > MAX_FRAME_BYTES)
    return { error: "frame_too_large" };
  let message;
  try {
    message = JSON.parse(value);
  } catch {
    return { error: "invalid_json" };
  }
  if (!isPlainObject(message) || typeof message.type !== "string" || message.type.length > 32)
    return { error: "invalid_payload" };
  if (message.protocol !== MULTIPLAYER_PROTOCOL) return { error: "protocol_mismatch" };
  return { message };
}

export function safeAttachment(value) {
  return {
    connectionId: value.connectionId,
    roomCode: value.roomCode ?? null,
    playerId: value.playerId ?? null,
    name: value.name ?? "Aventureiro",
    seat: Number.isInteger(value.seat) ? value.seat : -1,
    joinOrder: Number.isInteger(value.joinOrder) ? value.joinOrder : -1,
    sequence: Number.isSafeInteger(value.sequence) ? value.sequence : 0,
    lastPoseAt: Number.isFinite(value.lastPoseAt) ? value.lastPoseAt : 0,
    pose: validatePose(value.pose) ?? createEmptyPose(),
  };
}
