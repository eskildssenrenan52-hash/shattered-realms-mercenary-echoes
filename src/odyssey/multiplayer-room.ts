import Peer, { type DataConnection, type PeerError } from "peerjs";

export const MULTIPLAYER_MAX_PLAYERS = 5;
export const MULTIPLAYER_PROTOCOL = "shattered-realms-room-v1";
const ROOM_CODE_LENGTH = 8;
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SEND_INTERVAL_MS = 50;
const SNAPSHOT_INTERVAL_MS = 100;
const ROOM_ID_PREFIX = "sr";

type RoomRole = "host" | "guest";
export type MultiplayerStatus = "idle" | "connecting" | "waiting" | "connected" | "error";
export type MultiplayerTransport = "public-p2p" | "dedicated-ws";

export interface MultiplayerPose {
  x: number;
  y: number;
  zone: string;
  dir: number;
  frame: number;
  palette: number;
  attacking: boolean;
}

export interface MultiplayerPlayer extends MultiplayerPose {
  id: string;
  name: string;
}

export interface MultiplayerRoomState {
  status: MultiplayerStatus;
  transport: MultiplayerTransport;
  role: RoomRole | null;
  roomCode: string;
  selfId: string;
  players: MultiplayerPlayer[];
  error: string;
  /** Chave de convite WSS, presente somente no estado local da sala dedicada. */
  inviteToken?: string;
}

export interface MultiplayerRoomClient {
  state(): MultiplayerRoomState;
  create(name: string): boolean;
  join(name: string, input: string): boolean;
  tick(pose: MultiplayerPose, now?: number): void;
  remotePlayers(zone: string): MultiplayerPlayer[];
  leave(): void;
}

type PeerFactory = (id?: string) => Peer;
type WireMessage = Record<string, unknown>;

const EMPTY_POSE: MultiplayerPose = {
  x: 0,
  y: 0,
  zone: "",
  dir: 0,
  frame: 0,
  palette: 0,
  attacking: false,
};

function isRecord(value: unknown): value is WireMessage {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function normalizeRoomCode(input: string): string | null {
  const code = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (
    code.length !== ROOM_CODE_LENGTH ||
    [...code].some((char) => !ROOM_CODE_ALPHABET.includes(char))
  )
    return null;
  return code;
}

export function displayRoomCode(code: string): string {
  const normalized = normalizeRoomCode(code);
  return normalized ? `${normalized.slice(0, 4)}-${normalized.slice(4)}` : "";
}

export function normalizePlayerName(input: string): string {
  const printable = [...input]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 0x20 && code !== 0x7f;
    })
    .join("");
  const name = [...printable.replace(/\s+/g, " ").trim()].slice(0, 18).join("");
  return name || "Aventureiro";
}

export function validateMultiplayerPose(value: unknown): MultiplayerPose | null {
  if (!isRecord(value)) return null;
  const { x, y, zone, dir, frame, palette, attacking } = value;
  if (typeof x !== "number" || !Number.isFinite(x) || Math.abs(x) > 250_000) return null;
  if (typeof y !== "number" || !Number.isFinite(y) || Math.abs(y) > 250_000) return null;
  if (typeof zone !== "string" || zone.length > 160) return null;
  if (typeof dir !== "number" || !Number.isInteger(dir) || dir < 0 || dir > 3) return null;
  if (typeof frame !== "number" || !Number.isInteger(frame) || frame < 0 || frame > 3) return null;
  if (typeof palette !== "number" || !Number.isInteger(palette) || palette < 0 || palette > 15)
    return null;
  if (typeof attacking !== "boolean") return null;
  return { x, y, zone, dir, frame, palette, attacking };
}

export function generateRoomCode(random: Crypto = crypto): string {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH);
  random.getRandomValues(bytes);
  return [...bytes].map((value) => ROOM_CODE_ALPHABET[value % ROOM_CODE_ALPHABET.length]).join("");
}

function peerIdFor(code: string) {
  return `${ROOM_ID_PREFIX}${code.toLowerCase()}`;
}

function stablePalette(id: string): number {
  let result = 0;
  for (let i = 0; i < id.length; i++) result = (result * 31 + id.charCodeAt(i)) >>> 0;
  return result % 8;
}

function peerErrorMessage(error: PeerError<string>, role: RoomRole | null): string {
  if (error.type === "unavailable-id")
    return "Este código já está em uso. Gere uma nova sala e compartilhe o novo código.";
  if (error.type === "peer-unavailable")
    return "Sala não encontrada. Confira o código e verifique se o anfitrião ainda está conectado.";
  if (error.type === "browser-incompatible")
    return "Este navegador não oferece suporte à conexão WebRTC necessária.";
  if (["network", "socket-error", "socket-closed"].includes(error.type))
    return "Sem conexão com o serviço gratuito de sinalização. Verifique a internet e tente novamente.";
  if (role === "guest")
    return "Não foi possível entrar na sala. Tente novamente ou peça ao anfitrião para criar outra sala.";
  return "Não foi possível criar a sala. Verifique a conexão e tente novamente.";
}

export class MultiplayerRoom implements MultiplayerRoomClient {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private readonly connections = new Map<string, DataConnection>();
  private readonly players = new Map<string, MultiplayerPlayer>();
  private readonly lastPoseAt = new Map<string, number>();
  private readonly lastPoseSequence = new Map<string, number>();
  private role: RoomRole | null = null;
  private status: MultiplayerStatus = "idle";
  private roomCode = "";
  private selfId = "";
  private localName = "Aventureiro";
  private localPose: MultiplayerPose = { ...EMPTY_POSE };
  private error = "";
  private outgoingSequence = 0;
  private outgoingSnapshotSequence = 0;
  private incomingSnapshotSequence = -1;
  private lastPoseSentAt = 0;
  private lastSnapshotSentAt = 0;
  private lastUiSentAt = 0;
  private stopping = false;
  private readonly onState: (state: MultiplayerRoomState) => void;

  constructor(
    onState: (state: MultiplayerRoomState) => void,
    private readonly peerFactory: PeerFactory = (id) => (id ? new Peer(id) : new Peer()),
  ) {
    this.onState = onState;
  }

  state(): MultiplayerRoomState {
    return {
      status: this.status,
      transport: "public-p2p",
      role: this.role,
      roomCode: this.roomCode,
      selfId: this.selfId,
      players: this.currentPlayers(),
      error: this.error,
    };
  }

  create(name: string): boolean {
    if (!this.begin("host", name)) return false;
    this.roomCode = generateRoomCode();
    this.status = "connecting";
    this.openPeer(peerIdFor(this.roomCode));
    return true;
  }

  join(name: string, inputCode: string): boolean {
    const code = normalizeRoomCode(inputCode);
    if (!code) {
      this.role = "guest";
      this.status = "error";
      this.error = "Digite o código de oito caracteres mostrado na tela do anfitrião.";
      this.publish();
      return false;
    }
    if (!this.begin("guest", name)) return false;
    this.roomCode = code;
    this.status = "connecting";
    this.openPeer();
    return true;
  }

  tick(pose: MultiplayerPose, now = Date.now()) {
    if (!this.peer || this.stopping) return;
    const clean = validateMultiplayerPose(pose);
    if (clean) this.localPose = clean;
    if (
      this.role === "guest" &&
      this.status === "connected" &&
      this.connection?.open &&
      now - this.lastPoseSentAt >= SEND_INTERVAL_MS
    ) {
      this.lastPoseSentAt = now;
      this.send(this.connection, {
        type: "pose",
        sequence: ++this.outgoingSequence,
        pose: this.localPose,
      });
    }
    if (
      this.role === "host" &&
      (this.status === "connected" || this.status === "waiting") &&
      now - this.lastSnapshotSentAt >= SNAPSHOT_INTERVAL_MS
    ) {
      this.lastSnapshotSentAt = now;
      this.broadcastSnapshot();
    }
    if (now - this.lastUiSentAt >= 350) {
      this.lastUiSentAt = now;
      this.publish();
    }
  }

  remotePlayers(zone: string): MultiplayerPlayer[] {
    return this.currentPlayers().filter(
      (player) => player.id !== this.selfId && player.zone === zone,
    );
  }

  leave() {
    if (!this.peer || this.stopping) return;
    if (this.role === "host") this.broadcast({ type: "closed", protocol: MULTIPLAYER_PROTOCOL });
    else if (this.connection?.open)
      this.send(this.connection, {
        type: "leave",
        protocol: MULTIPLAYER_PROTOCOL,
        playerId: this.selfId,
      });
    this.stopping = true;
    this.cleanup();
  }

  private begin(role: RoomRole, name: string): boolean {
    if (this.peer && !this.stopping) return false;
    this.stopping = false;
    this.role = role;
    this.localName = normalizePlayerName(name);
    this.roomCode = "";
    this.selfId = "";
    this.error = "";
    this.status = "connecting";
    this.localPose = { ...EMPTY_POSE };
    this.players.clear();
    this.connections.clear();
    this.lastPoseAt.clear();
    this.lastPoseSequence.clear();
    this.incomingSnapshotSequence = -1;
    this.outgoingSequence = 0;
    this.outgoingSnapshotSequence = 0;
    this.publish();
    return true;
  }

  private openPeer(id?: string) {
    try {
      this.peer = this.peerFactory(id);
      this.peer.on("open", (peerId) => {
        if (this.stopping) return;
        this.selfId = peerId;
        if (this.role === "host") {
          this.status = "waiting";
          this.publish();
        } else this.connectToHost();
      });
      this.peer.on("connection", (connection) => this.acceptConnection(connection));
      this.peer.on("error", (error) => this.fail(peerErrorMessage(error, this.role)));
      this.peer.on("disconnected", () => {
        if (!this.stopping) this.fail("A conexão com o serviço de sinalização foi interrompida.");
      });
      this.peer.on("close", () => {
        if (!this.stopping) this.fail("A sessão da sala foi encerrada.");
      });
    } catch {
      this.fail(
        "Este ambiente não conseguiu iniciar WebRTC. Atualize o navegador ou use outro dispositivo.",
      );
    }
  }

  private connectToHost() {
    if (!this.peer || this.role !== "guest") return;
    try {
      const connection = this.peer.connect(peerIdFor(this.roomCode), {
        reliable: true,
        serialization: "json",
      });
      this.connection = connection;
      connection.on("open", () =>
        this.send(connection, {
          type: "hello",
          protocol: MULTIPLAYER_PROTOCOL,
          name: this.localName,
        }),
      );
      connection.on("data", (data) => this.handleGuestMessage(data));
      connection.on("close", () => {
        if (!this.stopping)
          this.fail("A conexão com o anfitrião foi encerrada. Você pode tentar entrar novamente.");
      });
      connection.on("error", () => {
        if (!this.stopping) this.fail("A conexão P2P falhou. Tente novamente ou use outra rede.");
      });
      window.setTimeout(() => {
        if (!this.stopping && this.status === "connecting")
          this.fail("A sala não respondeu. Confira o código e tente de novo.");
      }, 18_000);
    } catch {
      this.fail("Não foi possível abrir a conexão com essa sala.");
    }
  }

  private acceptConnection(connection: DataConnection) {
    if (this.role !== "host" || this.stopping) {
      connection.close();
      return;
    }
    if (this.connections.size >= MULTIPLAYER_MAX_PLAYERS - 1) {
      connection.on("open", () => {
        this.send(connection, { type: "reject", message: "Esta sala já tem cinco jogadores." });
        window.setTimeout(() => connection.close(), 150);
      });
      return;
    }
    this.connections.set(connection.peer, connection);
    const helloTimer = window.setTimeout(() => {
      if (!this.players.has(connection.peer)) connection.close();
    }, 10_000);
    connection.on("data", (data) => this.handleHostMessage(connection, data));
    connection.on("close", () => {
      window.clearTimeout(helloTimer);
      this.removeConnection(connection.peer);
    });
    connection.on("error", () => {
      window.clearTimeout(helloTimer);
      this.removeConnection(connection.peer);
    });
  }

  private handleHostMessage(connection: DataConnection, data: unknown) {
    if (!isRecord(data) || this.stopping) return;
    if (data["type"] === "hello") {
      if (data["protocol"] !== MULTIPLAYER_PROTOCOL || this.players.has(connection.peer)) return;
      const name =
        typeof data["name"] === "string" ? normalizePlayerName(data["name"]) : "Aventureiro";
      this.players.set(connection.peer, {
        id: connection.peer,
        name,
        ...EMPTY_POSE,
        palette: stablePalette(connection.peer),
      });
      this.lastPoseSequence.set(connection.peer, -1);
      this.lastPoseAt.set(connection.peer, 0);
      this.status = "connected";
      this.send(connection, {
        type: "welcome",
        protocol: MULTIPLAYER_PROTOCOL,
        roomCode: this.roomCode,
        selfId: connection.peer,
        players: this.currentPlayers(),
      });
      this.broadcastSnapshot();
      this.publish();
      return;
    }
    if (
      data["type"] === "leave" &&
      data["protocol"] === MULTIPLAYER_PROTOCOL &&
      data["playerId"] === connection.peer
    ) {
      connection.close();
      this.removeConnection(connection.peer);
      return;
    }
    if (data["type"] !== "pose" || !this.players.has(connection.peer)) return;
    const sequence = data["sequence"];
    const pose = validateMultiplayerPose(data["pose"]);
    if (
      !pose ||
      typeof sequence !== "number" ||
      !Number.isInteger(sequence) ||
      sequence <= (this.lastPoseSequence.get(connection.peer) ?? -1)
    )
      return;
    const now = Date.now();
    if (now - (this.lastPoseAt.get(connection.peer) ?? 0) < 35) return;
    this.lastPoseAt.set(connection.peer, now);
    this.lastPoseSequence.set(connection.peer, sequence);
    const player = this.players.get(connection.peer)!;
    this.players.set(connection.peer, { ...player, ...pose });
  }

  private handleGuestMessage(data: unknown) {
    if (!isRecord(data) || this.stopping) return;
    if (data["type"] === "reject") {
      this.fail(
        typeof data["message"] === "string"
          ? data["message"].slice(0, 180)
          : "A sala recusou a conexão.",
      );
      return;
    }
    if (data["protocol"] !== MULTIPLAYER_PROTOCOL) return;
    if (data["type"] === "closed") {
      this.fail("O anfitrião encerrou a sala.");
      return;
    }
    if (data["type"] === "welcome") {
      if (
        typeof data["selfId"] !== "string" ||
        data["selfId"] !== this.selfId ||
        !Array.isArray(data["players"])
      )
        return;
      this.incomingSnapshotSequence = -1;
      this.replacePlayers(data["players"]);
      this.status = "connected";
      this.error = "";
      this.publish();
      return;
    }
    if (
      data["type"] !== "snapshot" ||
      typeof data["sequence"] !== "number" ||
      !Number.isInteger(data["sequence"]) ||
      data["sequence"] <= this.incomingSnapshotSequence ||
      !Array.isArray(data["players"])
    )
      return;
    this.incomingSnapshotSequence = data["sequence"];
    this.replacePlayers(data["players"]);
    this.status = "connected";
    this.publish();
  }

  private replacePlayers(values: unknown[]) {
    const next = new Map<string, MultiplayerPlayer>();
    for (const value of values.slice(0, MULTIPLAYER_MAX_PLAYERS)) {
      if (
        !isRecord(value) ||
        typeof value["id"] !== "string" ||
        value["id"].length > 128 ||
        typeof value["name"] !== "string"
      )
        continue;
      const pose = validateMultiplayerPose(value);
      if (!pose) continue;
      const palette =
        typeof value["palette"] === "number" && Number.isInteger(value["palette"])
          ? Math.min(15, Math.max(0, value["palette"]))
          : stablePalette(value["id"]);
      next.set(value["id"], {
        id: value["id"],
        name: normalizePlayerName(value["name"]),
        ...pose,
        palette,
      });
    }
    this.players.clear();
    for (const [id, player] of next) this.players.set(id, player);
  }

  private currentPlayers(): MultiplayerPlayer[] {
    const self: MultiplayerPlayer = {
      id: this.selfId || "local",
      name: this.localName,
      ...this.localPose,
      palette: stablePalette(this.selfId || this.localName),
    };
    if (this.role === "host")
      return [self, ...this.players.values()].slice(0, MULTIPLAYER_MAX_PLAYERS);
    return [...this.players.values()].slice(0, MULTIPLAYER_MAX_PLAYERS);
  }

  private broadcastSnapshot() {
    if (this.role !== "host") return;
    const message = {
      type: "snapshot",
      protocol: MULTIPLAYER_PROTOCOL,
      sequence: ++this.outgoingSnapshotSequence,
      players: this.currentPlayers(),
    };
    this.broadcast(message);
  }

  private broadcast(message: unknown) {
    const isSnapshot = isRecord(message) && message["type"] === "snapshot";
    for (const [id, connection] of this.connections) {
      if (!connection.open || (isSnapshot && !this.players.has(id))) continue;
      this.send(connection, message);
    }
  }

  private send(connection: DataConnection, message: unknown) {
    if (!connection.open) return;
    try {
      connection.send(message);
    } catch {
      /* Canais fechados durante o envio serão removidos no evento close. */
    }
  }

  private removeConnection(id: string) {
    this.connections.delete(id);
    this.players.delete(id);
    this.lastPoseAt.delete(id);
    this.lastPoseSequence.delete(id);
    if (this.role === "host" && !this.stopping) {
      this.status = this.players.size ? "connected" : "waiting";
      this.broadcastSnapshot();
      this.publish();
    }
  }

  private fail(message: string) {
    if (this.stopping) return;
    this.stopping = true;
    this.status = "error";
    this.error = message;
    this.publish();
    this.cleanup();
  }

  private cleanup() {
    for (const connection of this.connections.values()) connection.close();
    this.connections.clear();
    this.connection?.close();
    this.connection = null;
    this.peer?.destroy();
    this.peer = null;
    this.players.clear();
  }

  private publish() {
    if (this.stopping && this.status !== "error") return;
    this.onState(this.state());
  }
}
