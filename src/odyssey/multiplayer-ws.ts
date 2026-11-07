import {
  MULTIPLAYER_MAX_PLAYERS,
  MULTIPLAYER_PROTOCOL,
  normalizePlayerName,
  normalizeRoomCode,
  validateMultiplayerPose,
  type MultiplayerPlayer,
  type MultiplayerPose,
  type MultiplayerRoomState,
  type MultiplayerStatus,
} from "./multiplayer-room";

type RoomRole = "host" | "guest";
type WireMessage = Record<string, unknown>;
type WebSocketFactory = (url: string) => WebSocket;

const SEND_INTERVAL_MS = 50;
const UI_INTERVAL_MS = 350;
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

function stablePalette(id: string): number {
  let result = 0;
  for (let i = 0; i < id.length; i++) result = (result * 31 + id.charCodeAt(i)) >>> 0;
  return result % 8;
}

export interface RoomInvite {
  roomCode: string;
  token: string;
}

export function parseRoomInvite(input: string): RoomInvite | null {
  const match = input.trim().match(/^([A-HJ-NP-Z2-9]{4}-?[A-HJ-NP-Z2-9]{4})\.([A-Za-z0-9_-]{43})$/);
  const roomCode = match ? normalizeRoomCode(match[1]!) : null;
  const token = match?.[2] ?? "";
  return roomCode && token ? { roomCode, token } : null;
}

export function formatRoomInvite(roomCode: string, token: string): string {
  const normalized = normalizeRoomCode(roomCode);
  return normalized && /^[A-Za-z0-9_-]{43}$/.test(token)
    ? `${normalized.slice(0, 4)}-${normalized.slice(4)}.${token}`
    : "";
}

export function validateMultiplayerWsUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "wss:" && url.protocol !== "ws:") return null;
    if (url.pathname !== "/ws") return null;
    if (url.username || url.password || url.hash) return null;
    if (typeof window !== "undefined" && window.location.protocol === "https:" && url.protocol !== "wss:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function errorText(code: unknown, message: unknown): string {
  if (typeof message === "string" && message.trim()) return message.slice(0, 180);
  switch (code) {
    case "room_not_found": return "Sala inexistente ou convite expirado. Confira o convite completo.";
    case "invalid_token": return "A chave de convite não confere. Peça ao anfitrião um convite novo.";
    case "room_full": return "Esta sala já tem cinco jogadores.";
    case "protocol_mismatch": return "Cliente e servidor usam versões incompatíveis. Atualize o jogo.";
    case "rate_limited": return "A conexão está enviando atualizações depressa demais. Aguarde um instante.";
    default: return "O servidor recusou a mensagem. Confira o convite e tente novamente.";
  }
}

/** Cliente nativo WebSocket para salas hospedadas no serviço Node do projeto. */
export class DedicatedMultiplayerRoom {
  private socket: WebSocket | null = null;
  private readonly players = new Map<string, MultiplayerPlayer>();
  private role: RoomRole | null = null;
  private status: MultiplayerStatus = "idle";
  private roomCode = "";
  private selfId = "";
  private inviteToken = "";
  private localName = "Aventureiro";
  private localPose: MultiplayerPose = { ...EMPTY_POSE };
  private error = "";
  private outgoingSequence = 0;
  private incomingSequence = -1;
  private lastPoseSentAt = 0;
  private lastUiSentAt = 0;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectingTimer: ReturnType<typeof setTimeout> | null = null;
  private stopping = false;
  private readonly onState: (state: MultiplayerRoomState) => void;
  private readonly socketFactory: WebSocketFactory;
  private readonly endpoint: string;

  constructor(
    endpoint: string,
    onState: (state: MultiplayerRoomState) => void,
    socketFactory: WebSocketFactory = (url) => new WebSocket(url),
  ) {
    const validEndpoint = validateMultiplayerWsUrl(endpoint);
    if (!validEndpoint) throw new Error("Configure o endereço completo wss://servidor/ws para salas dedicadas.");
    this.endpoint = validEndpoint;
    this.onState = onState;
    this.socketFactory = socketFactory;
  }

  state(): MultiplayerRoomState {
    return {
      status: this.status,
      role: this.role,
      roomCode: this.roomCode,
      selfId: this.selfId,
      players: [...this.players.values()].slice(0, MULTIPLAYER_MAX_PLAYERS),
      error: this.error,
      ...(this.inviteToken ? { inviteToken: this.inviteToken } : {}),
    };
  }

  create(name: string): boolean {
    if (!this.begin("host", name)) return false;
    this.openSocket(false);
    return true;
  }

  join(name: string, inviteText: string): boolean {
    const invite = parseRoomInvite(inviteText);
    if (!invite) {
      this.role = "guest";
      this.status = "error";
      this.error = "Cole o convite completo recebido do anfitrião (código e chave).";
      this.publish();
      return false;
    }
    if (!this.begin("guest", name)) return false;
    this.roomCode = invite.roomCode;
    this.inviteToken = invite.token;
    this.openSocket(false, invite);
    return true;
  }

  tick(pose: MultiplayerPose, now = Date.now()) {
    const clean = validateMultiplayerPose(pose);
    if (clean) this.localPose = clean;
    if (
      this.status === "connected" || this.status === "waiting"
    ) {
      const self = this.players.get(this.selfId);
      if (self) this.players.set(this.selfId, { ...self, ...this.localPose });
      if (this.socket?.readyState === WebSocket.OPEN && now - this.lastPoseSentAt >= SEND_INTERVAL_MS) {
        this.lastPoseSentAt = now;
        this.send({
          type: "pose",
          protocol: MULTIPLAYER_PROTOCOL,
          sequence: ++this.outgoingSequence,
          pose: this.localPose,
        });
      }
    }
    if (now - this.lastUiSentAt >= UI_INTERVAL_MS) {
      this.lastUiSentAt = now;
      this.publish();
    }
  }

  remotePlayers(zone: string): MultiplayerPlayer[] {
    return [...this.players.values()].filter(
      (player) => player.id !== this.selfId && player.zone === zone,
    );
  }

  leave() {
    if (this.stopping) return;
    this.stopping = true;
    this.clearTimers();
    if (this.socket?.readyState === WebSocket.OPEN)
      this.send({ type: "leave", protocol: MULTIPLAYER_PROTOCOL });
    this.socket?.close(1000, "left room");
    this.socket = null;
    this.players.clear();
  }

  private begin(role: RoomRole, name: string): boolean {
    if (this.socket && !this.stopping) return false;
    this.stopping = false;
    this.role = role;
    this.status = "connecting";
    this.roomCode = "";
    this.selfId = "";
    this.inviteToken = "";
    this.localName = normalizePlayerName(name);
    this.localPose = { ...EMPTY_POSE };
    this.error = "";
    this.players.clear();
    this.outgoingSequence = 0;
    this.incomingSequence = -1;
    this.lastPoseSentAt = 0;
    this.reconnectAttempts = 0;
    this.publish();
    return true;
  }

  private openSocket(reconnecting: boolean, invite?: RoomInvite) {
    if (this.stopping) return;
    let socket: WebSocket;
    try {
      socket = this.socketFactory(this.endpoint);
      this.socket = socket;
    } catch {
      this.fail("Não foi possível abrir o WebSocket. Verifique o endpoint wss:// e a internet.");
      return;
    }

    this.clearConnectingTimer();
    this.connectingTimer = setTimeout(() => {
      if (this.socket === socket && this.status === "connecting")
        this.fail("O servidor não respondeu ao convite. Confira o endpoint e tente novamente.");
    }, 15_000);

    socket.addEventListener("open", () => {
      if (this.stopping || this.socket !== socket) return;
      const joinInvite = reconnecting
        ? { roomCode: this.roomCode, token: this.inviteToken }
        : invite;
      if (this.role === "host" && !reconnecting) {
        this.send({ type: "create", protocol: MULTIPLAYER_PROTOCOL, name: this.localName });
      } else if (joinInvite) {
        this.send({
          type: "join",
          protocol: MULTIPLAYER_PROTOCOL,
          roomCode: joinInvite.roomCode,
          token: joinInvite.token,
          name: this.localName,
        });
      } else {
        this.fail("Convite incompleto. Crie outra sala ou cole o convite completo.");
      }
    });
    socket.addEventListener("message", (event) => {
      if (this.socket === socket) this.handleMessage((event as MessageEvent).data);
    });
    socket.addEventListener("error", () => {
      if (!this.stopping && this.socket === socket && this.status === "connecting")
        this.error = "Falha de rede no WebSocket. Tentando restabelecer a conexão…";
    });
    socket.addEventListener("close", () => {
      if (this.stopping || this.socket !== socket) return;
      this.socket = null;
      this.clearConnectingTimer();
      this.scheduleReconnect();
    });
  }

  private handleMessage(data: unknown) {
    let value: unknown;
    try {
      value = typeof data === "string" ? JSON.parse(data) : JSON.parse(String(data));
    } catch {
      this.fail("O servidor enviou uma resposta inválida. Atualize o jogo e tente novamente.");
      return;
    }
    if (!isRecord(value)) return;
    if (value["type"] === "error") {
      this.error = errorText(value["code"], value["message"]);
      this.publish();
      if (value["fatal"] === true) this.fail(this.error);
      return;
    }
    if (value["protocol"] !== MULTIPLAYER_PROTOCOL) return;

    if (value["type"] === "created" || value["type"] === "joined") {
      if (
        typeof value["selfId"] !== "string" ||
        typeof value["roomCode"] !== "string" ||
        typeof value["token"] !== "string" ||
        !Array.isArray(value["players"])
      ) {
        this.fail("Resposta de sala incompleta. Atualize o cliente e o servidor juntos.");
        return;
      }
      const normalized = normalizeRoomCode(value["roomCode"]);
      if (!normalized || !/^[A-Za-z0-9_-]{43}$/.test(value["token"])) {
        this.fail("O servidor retornou um convite inválido.");
        return;
      }
      this.clearConnectingTimer();
      this.roomCode = normalized;
      this.selfId = value["selfId"];
      this.inviteToken = value["token"];
      this.replacePlayers(value["players"]);
      this.role = value["hostId"] === this.selfId ? "host" : "guest";
      this.status = this.role === "host" && this.players.size === 1 ? "waiting" : "connected";
      this.error = "";
      this.reconnectAttempts = 0;
      this.publish();
      return;
    }

    if (value["type"] === "host_changed") {
      if (typeof value["hostId"] === "string")
        this.role = value["hostId"] === this.selfId ? "host" : "guest";
      this.publish();
      return;
    }

    if (
      value["type"] === "snapshot" &&
      typeof value["sequence"] === "number" &&
      Number.isSafeInteger(value["sequence"]) &&
      value["sequence"] > this.incomingSequence &&
      Array.isArray(value["players"])
    ) {
      this.incomingSequence = value["sequence"];
      if (typeof value["hostId"] === "string")
        this.role = value["hostId"] === this.selfId ? "host" : "guest";
      this.replacePlayers(value["players"]);
      this.status = this.role === "host" && this.players.size === 1 ? "waiting" : "connected";
      this.error = "";
      this.publish();
      return;
    }

    if (value["type"] === "left") {
      this.fail("Você saiu da sala.");
    }
  }

  private replacePlayers(values: unknown[]) {
    const next = new Map<string, MultiplayerPlayer>();
    for (const value of values.slice(0, MULTIPLAYER_MAX_PLAYERS)) {
      if (!isRecord(value) || typeof value["id"] !== "string" || typeof value["name"] !== "string") continue;
      const pose = validateMultiplayerPose(value);
      if (!pose) continue;
      next.set(value["id"], {
        id: value["id"],
        name: normalizePlayerName(value["name"]),
        ...pose,
        palette: typeof value["palette"] === "number" ? value["palette"] : stablePalette(value["id"]),
      });
    }
    this.players.clear();
    for (const [id, player] of next) this.players.set(id, player);
  }

  private send(message: unknown) {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    try {
      this.socket.send(JSON.stringify(message));
    } catch {
      this.socket.close();
    }
  }

  private scheduleReconnect() {
    if (this.inviteToken && this.roomCode && this.reconnectAttempts < 3) {
      this.reconnectAttempts += 1;
      this.status = "connecting";
      this.error = `Conexão interrompida; tentando novamente (${this.reconnectAttempts}/3)…`;
      this.publish();
      const delay = Math.min(1_000 * 2 ** (this.reconnectAttempts - 1), 4_000);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.openSocket(true);
      }, delay);
      return;
    }
    this.fail("A conexão com o servidor foi encerrada. Volte ao menu e entre com um novo convite.");
  }

  private fail(message: string) {
    if (this.stopping) return;
    this.stopping = true;
    this.status = "error";
    this.error = message.slice(0, 180);
    this.publish();
    this.clearTimers();
    this.socket?.close();
    this.socket = null;
    this.players.clear();
  }

  private publish() {
    this.onState(this.state());
  }

  private clearConnectingTimer() {
    if (this.connectingTimer) clearTimeout(this.connectingTimer);
    this.connectingTimer = null;
  }

  private clearTimers() {
    this.clearConnectingTimer();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}
