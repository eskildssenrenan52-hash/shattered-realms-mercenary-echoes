export interface DailyLoginState {
  /** Último dia UTC resgatado, YYYY-MM-DD; null antes do primeiro resgate. */
  lastClaimDate: string | null;
  /** Posição no ciclo semanal do último resgate. */
  streak: number;
}

export interface DailyReward {
  day: number;
  gold: number;
  xp: number;
  label: string;
  item: string;
  qty: number;
}

export interface DailyCalendarDay {
  day: number;
  status: "claimed" | "available" | "future";
  reward: DailyReward;
}

export interface DailyLoginSnapshot {
  todayUtc: string;
  streak: number;
  claimedToday: boolean;
  canClaim: boolean;
  days: DailyCalendarDay[];
  nextReward: DailyReward;
  clockRollback: boolean;
}

export interface DailyClaimResult {
  state: DailyLoginState;
  reward: DailyReward | null;
  claimed: boolean;
  reason: "claimed" | "already-claimed" | "clock-rollback";
}

export const DAILY_REWARDS: readonly DailyReward[] = [
  { day: 1, gold: 50, xp: 25, label: "Bolsa do viajante", item: "herb", qty: 3 },
  { day: 2, gold: 75, xp: 35, label: "Moedas de Potos", item: "iron_ore", qty: 2 },
  { day: 3, gold: 100, xp: 50, label: "Provisões de jornada", item: "hi_potion", qty: 2 },
  { day: 4, gold: 125, xp: 65, label: "Tributo de explorador", item: "mana_shard", qty: 2 },
  { day: 5, gold: 150, xp: 80, label: "Tesouro da fronteira", item: "crystal_ore", qty: 1 },
  { day: 6, gold: 200, xp: 100, label: "Bênção de mana", item: "ether", qty: 2 },
  { day: 7, gold: 500, xp: 250, label: "Grande recompensa semanal", item: "elixir", qty: 1 },
];

export function createDailyLoginState(): DailyLoginState {
  return { lastClaimDate: null, streak: 0 };
}

function parseUtcDate(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date ? timestamp : null;
}

function dayDistance(from: string, to: string): number {
  const a = parseUtcDate(from);
  const b = parseUtcDate(to);
  if (a === null || b === null) return 0;
  return Math.round((b - a) / 86_400_000);
}

function normalizeState(state: DailyLoginState): DailyLoginState {
  const streak = Number.isInteger(state.streak) ? Math.max(0, state.streak) : 0;
  const validDate = state.lastClaimDate && parseUtcDate(state.lastClaimDate) !== null ? state.lastClaimDate : null;
  return { lastClaimDate: validDate, streak: validDate ? streak : 0 };
}

export function dailyLoginSnapshot(state: DailyLoginState, todayUtc: string): DailyLoginSnapshot {
  if (parseUtcDate(todayUtc) === null) throw new RangeError("todayUtc deve ser uma data UTC válida (YYYY-MM-DD).");
  const safe = normalizeState(state);
  const clockRollback = !!safe.lastClaimDate && todayUtc < safe.lastClaimDate;
  const sameDay = safe.lastClaimDate === todayUtc;
  const consecutive = !!safe.lastClaimDate && dayDistance(safe.lastClaimDate, todayUtc) === 1;
  const streak = sameDay || clockRollback ? safe.streak : consecutive ? safe.streak : 0;
  const cycleDay = safe.streak > 0 ? ((safe.streak - 1) % 7) + 1 : 0;
  const nextDay = sameDay || clockRollback ? (cycleDay || 1) : consecutive ? (safe.streak % 7) + 1 : 1;
  const days = DAILY_REWARDS.map((reward) => ({
    day: reward.day,
    reward,
    status: (reward.day < nextDay || ((sameDay || clockRollback) && reward.day === cycleDay) || clockRollback && reward.day < cycleDay
      ? "claimed"
      : reward.day === nextDay && !sameDay && !clockRollback
        ? "available"
        : "future") as DailyCalendarDay["status"],
  }));
  return {
    todayUtc,
    streak,
    claimedToday: sameDay || clockRollback,
    canClaim: !sameDay && !clockRollback,
    days,
    nextReward: DAILY_REWARDS[nextDay - 1]!,
    clockRollback,
  };
}

/** Pure transition. Caller persists state and applies reward; this module never touches storage/game state. */
export function claimDailyLogin(state: DailyLoginState, todayUtc: string): DailyClaimResult {
  const snapshot = dailyLoginSnapshot(state, todayUtc);
  const safe = normalizeState(state);
  if (snapshot.clockRollback) return { state: safe, reward: null, claimed: false, reason: "clock-rollback" };
  if (safe.lastClaimDate === todayUtc) return { state: safe, reward: null, claimed: false, reason: "already-claimed" };
  const nextStreak = safe.lastClaimDate && dayDistance(safe.lastClaimDate, todayUtc) === 1 ? safe.streak + 1 : 1;
  const reward = DAILY_REWARDS[(nextStreak - 1) % 7]!;
  return {
    state: { lastClaimDate: todayUtc, streak: nextStreak },
    reward,
    claimed: true,
    reason: "claimed",
  };
}
