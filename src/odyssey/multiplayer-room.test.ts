import type { Peer } from "peerjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  displayRoomCode,
  generateRoomCode,
  MULTIPLAYER_MAX_PLAYERS,
  MULTIPLAYER_PROTOCOL,
  MultiplayerRoom,
  normalizePlayerName,
  normalizeRoomCode,
  validateMultiplayerPose,
  type MultiplayerPose,
} from "./multiplayer-room";

type Listener = (...args: unknown[]) => void;

class FakeConnection {
  open = false;
  readonly sent: unknown[] = [];
  private readonly listeners = new Map<string, Listener[]>();
  link: FakeConnection | null = null;

  constructor(readonly peer: string) {}

  on(event: string, listener: Listener) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
    return this;
  }

  emit(event: string, ...args: unknown[]) {
    for (const listener of this.listeners.get(event) ?? []) listener(...args);
  }

  openConnection() {
    this.open = true;
    this.emit("open");
  }

  send(message: unknown) {
    this.sent.push(message);
    if (this.link?.open) this.link.emit("data", message);
  }

  receive(message: unknown) {
    this.emit("data", message);
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.emit("close");
  }
}

class FakePeer {
  private readonly listeners = new Map<string, Listener[]>();
  readonly outgoing: FakeConnection[] = [];
  destroyed = false;

  constructor(readonly id: string) {}

  on(event: string, listener: Listener) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
    return this;
  }

  emit(event: string, ...args: unknown[]) {
    for (const listener of this.listeners.get(event) ?? []) listener(...args);
  }

  connect(peerId: string) {
    const connection = new FakeConnection(peerId);
    this.outgoing.push(connection);
    return connection;
  }

  destroy() {
    this.destroyed = true;
    this.emit("close");
  }
}

const pose = (patch: Partial<MultiplayerPose> = {}): MultiplayerPose => ({
  x: 120,
  y: 240,
  zone: "overworld",
  dir: 1,
  frame: 2,
  palette: 3,
  attacking: false,
  ...patch,
});

afterEach(() => vi.useRealTimers());

describe("protocolo de salas multiplayer", () => {
  it("normaliza e formata o código sem caracteres ambíguos", () => {
    expect(normalizeRoomCode("abcd-2345")).toBe("ABCD2345");
    expect(displayRoomCode("abcd2345")).toBe("ABCD-2345");
    expect(normalizeRoomCode("ABCD-234O")).toBeNull();
    expect(normalizeRoomCode("curto")).toBeNull();
  });

  it("gera códigos uniformes no alfabeto permitido e saneia nomes", () => {
    const deterministicCrypto = {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(0);
        return bytes;
      },
    } as Crypto;
    const code = generateRoomCode(deterministicCrypto);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(code).toBe("A".repeat(8));
    expect(normalizePlayerName("  Guerreiro\n\u0000 do Norte ")).toBe("Guerreiro do Norte");
    expect(normalizePlayerName("\u0000  ")).toBe("Aventureiro");
    expect(normalizePlayerName("N".repeat(30))).toHaveLength(18);
  });

  it("aceita poses válidas e rejeita dados não finitos ou fora dos limites", () => {
    expect(validateMultiplayerPose(pose())).toEqual(pose());
    expect(validateMultiplayerPose({ ...pose(), x: Number.POSITIVE_INFINITY })).toBeNull();
    expect(validateMultiplayerPose({ ...pose(), y: 250_001 })).toBeNull();
    expect(validateMultiplayerPose({ ...pose(), zone: "z".repeat(161) })).toBeNull();
    expect(validateMultiplayerPose({ ...pose(), dir: 4 })).toBeNull();
    expect(validateMultiplayerPose({ ...pose(), attacking: "yes" })).toBeNull();
    expect(validateMultiplayerPose(null)).toBeNull();
  });

  it("faz o handshake, sincroniza poses e impede a sala de ultrapassar cinco jogadores", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const hostPeer = new FakePeer("host-peer");
    const guestPeer = new FakePeer("guest-peer");
    const makeRoom = (peer: FakePeer) =>
      new MultiplayerRoom(
        () => undefined,
        () => peer as unknown as Peer,
      );
    const hostRoom = makeRoom(hostPeer);
    const guestRoom = makeRoom(guestPeer);

    expect(hostRoom.create("Anfitriã")).toBe(true);
    hostPeer.emit("open", hostPeer.id);
    expect(hostRoom.state().status).toBe("waiting");
    expect(hostRoom.state().transport).toBe("public-p2p");
    expect(hostRoom.state().roomCode).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    hostRoom.tick(pose({ x: 80, y: 100 }), 1_000);

    const hostLink = new FakeConnection(guestPeer.id);
    expect(guestRoom.join("Visitante", hostRoom.state().roomCode)).toBe(true);
    guestPeer.emit("open", guestPeer.id);
    const guestLink = guestPeer.outgoing[0]!;
    hostLink.link = guestLink;
    guestLink.link = hostLink;
    hostPeer.emit("connection", hostLink);
    hostLink.openConnection();
    guestLink.openConnection();

    expect(guestLink.sent[0]).toMatchObject({
      type: "hello",
      protocol: MULTIPLAYER_PROTOCOL,
      name: "Visitante",
    });
    expect(hostRoom.state().players).toHaveLength(2);
    expect(guestRoom.state().status).toBe("connected");
    expect(guestRoom.remotePlayers("overworld").map((player) => player.id)).toContain(hostPeer.id);

    guestRoom.tick(pose({ x: 320, y: 480 }), 1_040);
    expect(
      hostRoom.remotePlayers("overworld").find((player) => player.id === guestPeer.id),
    ).toMatchObject({ x: 320, y: 480 });

    for (let index = 0; index < MULTIPLAYER_MAX_PLAYERS - 2; index++) {
      const connection = new FakeConnection(`guest-${index}`);
      hostPeer.emit("connection", connection);
      connection.openConnection();
      connection.receive({
        type: "hello",
        protocol: MULTIPLAYER_PROTOCOL,
        name: `Visitante ${index}`,
      });
    }
    expect(hostRoom.state().players).toHaveLength(MULTIPLAYER_MAX_PLAYERS);

    const overflow = new FakeConnection("guest-extra");
    hostPeer.emit("connection", overflow);
    overflow.openConnection();
    expect(overflow.sent[0]).toMatchObject({
      type: "reject",
      message: "Esta sala já tem cinco jogadores.",
    });
    expect(hostRoom.state().players).toHaveLength(MULTIPLAYER_MAX_PLAYERS);

    hostRoom.leave();
    expect(guestRoom.state()).toMatchObject({
      status: "error",
      error: "O anfitrião encerrou a sala.",
    });
  });
});
