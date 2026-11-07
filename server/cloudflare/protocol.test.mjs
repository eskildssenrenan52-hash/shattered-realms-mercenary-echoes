import { describe, expect, it } from "vitest";
import {
  EMPTY_POSE,
  MAX_FRAME_BYTES,
  MULTIPLAYER_PROTOCOL,
  constantTimeEqual,
  normalizePlayerName,
  normalizeRoomCode,
  originAllowed,
  parseOrigins,
  parseWireMessage,
  posesEqual,
  validatePose,
} from "./protocol.mjs";

describe("Cloudflare room protocol", () => {
  it("keeps the Node wire constants and room-code alphabet", () => {
    expect(MULTIPLAYER_PROTOCOL).toBe("shattered-realms-room-v1");
    expect(normalizeRoomCode("abcd-2345")).toBe("ABCD2345");
    expect(normalizeRoomCode("ABCD0OIL")).toBeNull();
  });

  it("normalizes names and validates the exact pose shape", () => {
    expect(normalizePlayerName("  A\nventureiro  ")).toBe("Aventureiro");
    expect(validatePose(EMPTY_POSE)).toEqual(EMPTY_POSE);
    expect(validatePose({ ...EMPTY_POSE, x: 250_001 })).toBeNull();
    expect(validatePose({ ...EMPTY_POSE, attacking: 1 })).toBeNull();
  });

  it("enforces protocol and the 16 KiB client frame limit", () => {
    expect(
      parseWireMessage(JSON.stringify({ type: "ping", protocol: MULTIPLAYER_PROTOCOL })),
    ).toEqual({ message: { type: "ping", protocol: MULTIPLAYER_PROTOCOL } });
    expect(parseWireMessage(JSON.stringify({ type: "ping", protocol: "wrong" })).error).toBe(
      "protocol_mismatch",
    );
    expect(parseWireMessage("x".repeat(MAX_FRAME_BYTES + 1)).error).toBe("frame_too_large");
  });

  it("uses allowlist matching and change coalescing helpers", () => {
    expect(
      originAllowed(
        "https://game.example",
        parseOrigins("https://game.example, https://appassets.androidplatform.net"),
      ),
    ).toBe(true);
    expect(originAllowed("https://evil.example", parseOrigins("https://game.example"))).toBe(false);
    expect(posesEqual(EMPTY_POSE, { ...EMPTY_POSE })).toBe(true);
    expect(posesEqual(EMPTY_POSE, { ...EMPTY_POSE, x: 1 })).toBe(false);
    expect(constantTimeEqual("abc", "abc")).toBe(true);
    expect(constantTimeEqual("abc", "abd")).toBe(false);
  });
});
