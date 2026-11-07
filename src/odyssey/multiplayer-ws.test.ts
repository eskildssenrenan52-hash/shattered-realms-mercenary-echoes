import { describe, expect, it, vi } from "vitest";
import {
  DedicatedMultiplayerRoom,
  formatRoomInvite,
  parseRoomInvite,
  validateMultiplayerWsUrl,
} from "./multiplayer-ws";
import { MULTIPLAYER_PROTOCOL, type MultiplayerPose, type MultiplayerRoomState } from "./multiplayer-room";

type Listener = (event: Event) => void;

class FakeWebSocket {
  readyState = 0;
  readonly sent: Record<string, unknown>[] = [];
  private readonly listeners = new Map<string, Listener[]>();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    const callback: Listener = (event) => {
      if (typeof listener === "function") listener(event);
      else listener.handleEvent(event);
    };
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), callback]);
  }

  open() {
    this.readyState = 1;
    this.emit("open", new Event("open"));
  }

  send(raw: string) {
    this.sent.push(JSON.parse(raw) as Record<string, unknown>);
  }

  receive(message: unknown) {
    this.emit("message", { data: JSON.stringify(message) } as MessageEvent);
  }

  close() {
    this.readyState = 3;
    this.emit("close", new Event("close"));
  }

  private emit(type: string, event: Event) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

const HOST_ID = "p_host";
const GUEST_ID = "p_guest";
const ROOM_CODE = "ABCD2345";
const TOKEN = "Q1w2E3r4T5y6U7i8O9p0_abcdefghijklmnopqrstuvwxyz1234567890".slice(0, 43);
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
const serverPlayer = (id: string, name: string, patch: Partial<MultiplayerPose> = {}) => ({
  id,
  name,
  seat: id === HOST_ID ? 0 : 1,
  host: id === HOST_ID,
  ...pose(patch),
});

function harness() {
  const sockets: FakeWebSocket[] = [];
  const onState = vi.fn<(state: MultiplayerRoomState) => void>();
  const room = new DedicatedMultiplayerRoom(
    "wss://rooms.example.test/ws",
    onState,
    () => {
      const socket = new FakeWebSocket();
      sockets.push(socket);
      return socket as unknown as WebSocket;
    },
  );
  return { room, sockets, onState };
}

describe("cliente do servidor multiplayer WSS", () => {
  it("formata e lê convites completos sem alterar a chave sensível a maiúsculas", () => {
    const invite = formatRoomInvite(ROOM_CODE, TOKEN);
    expect(invite).toBe(`ABCD-2345.${TOKEN}`);
    expect(parseRoomInvite(invite)).toEqual({ roomCode: ROOM_CODE, token: TOKEN });
    expect(parseRoomInvite("ABCD-2345")).toBeNull();
    expect(parseRoomInvite(`ABCD-2345.${"x".repeat(42)}`)).toBeNull();
  });

  it("aceita endpoint WSS com /ws e rejeita esquema, caminho e credenciais inválidos", () => {
    expect(validateMultiplayerWsUrl("wss://rooms.example.test/ws")).toBe("wss://rooms.example.test/ws");
    expect(validateMultiplayerWsUrl("https://rooms.example.test/ws")).toBeNull();
    expect(validateMultiplayerWsUrl("wss://rooms.example.test/")).toBeNull();
    expect(validateMultiplayerWsUrl("wss://user:pass@rooms.example.test/ws")).toBeNull();
  });

  it("cria sala, recebe token/roster, sincroniza poses e filtra participantes por zona", () => {
    const { room, sockets } = harness();
    expect(room.create("  Anfitrião  ")).toBe(true);
    const socket = sockets[0]!;
    socket.open();
    expect(socket.sent[0]).toEqual({ type: "create", protocol: MULTIPLAYER_PROTOCOL, name: "Anfitrião" });

    socket.receive({
      type: "created",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: ROOM_CODE,
      token: TOKEN,
      selfId: HOST_ID,
      seat: 0,
      hostId: HOST_ID,
      players: [serverPlayer(HOST_ID, "Anfitrião")],
    });
    expect(room.state()).toMatchObject({
      status: "waiting",
      role: "host",
      roomCode: ROOM_CODE,
      selfId: HOST_ID,
      inviteToken: TOKEN,
    });

    room.tick(pose({ x: 321 }), 1_000);
    expect(socket.sent.at(-1)).toMatchObject({
      type: "pose",
      protocol: MULTIPLAYER_PROTOCOL,
      sequence: 1,
      pose: { x: 321, y: 240, zone: "overworld" },
    });

    socket.receive({
      type: "snapshot",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: ROOM_CODE,
      sequence: 1,
      hostId: HOST_ID,
      players: [serverPlayer(HOST_ID, "Anfitrião", { x: 321 }), serverPlayer(GUEST_ID, "Visitante")],
    });
    expect(room.remotePlayers("overworld")).toMatchObject([{ id: GUEST_ID, name: "Visitante" }]);
    expect(room.remotePlayers("farlands")).toEqual([]);

    room.leave();
    expect(socket.sent.at(-1)).toEqual({ type: "leave", protocol: MULTIPLAYER_PROTOCOL });
    expect(room.remotePlayers("overworld")).toEqual([]);
  });

  it("entra apenas com convite completo e aceita roster/token do servidor", () => {
    const { room, sockets } = harness();
    expect(room.join("Visitante", formatRoomInvite(ROOM_CODE, TOKEN))).toBe(true);
    const socket = sockets[0]!;
    socket.open();
    expect(socket.sent[0]).toEqual({
      type: "join",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: ROOM_CODE,
      token: TOKEN,
      name: "Visitante",
    });
    socket.receive({
      type: "joined",
      protocol: MULTIPLAYER_PROTOCOL,
      roomCode: ROOM_CODE,
      token: TOKEN,
      selfId: GUEST_ID,
      seat: 1,
      hostId: HOST_ID,
      players: [serverPlayer(HOST_ID, "Anfitrião"), serverPlayer(GUEST_ID, "Visitante")],
    });
    expect(room.state()).toMatchObject({ status: "connected", role: "guest", selfId: GUEST_ID, inviteToken: TOKEN });
    expect(room.remotePlayers("overworld").map((player) => player.id)).toEqual([HOST_ID]);
  });

  it("recusa somente código sem chave quando usa transporte dedicado", () => {
    const { room, sockets, onState } = harness();
    expect(room.join("Visitante", ROOM_CODE)).toBe(false);
    expect(sockets).toHaveLength(0);
    expect(room.state()).toMatchObject({ status: "error", role: "guest" });
    expect(room.state().error).toContain("convite completo");
    expect(onState).toHaveBeenCalled();
  });
});
