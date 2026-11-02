export type RealmEndingChoice = "preserve" | "transform";
export type MemoryVariant = "remember" | "release";

export interface CaravanOrder {
  id: string;
  realm: string;
  acceptedAtCycle: number;
  arrivalVerified: boolean;
}
export interface BeyondCycleRecord {
  cycle: number;
  choices: Record<string, RealmEndingChoice>;
}

/** Estado aditivo: saves antigos recebem defaults sem perder inventário ou progresso. */
export interface EchoSystemsState {
  v: 1;
  cartography: { routes: string[] };
  restoration: { level: number; freedRealms: string[] };
  bonds: { unlocked: boolean; sceneSeen: boolean };
  council: { votes: string[] };
  dreams: {
    memories: number;
    runs: number;
    best: number;
    completed: number;
    activeRun: number | null;
  };
  constellations: { stage: number; failures: number; completed: boolean };
  caravans: { active: CaravanOrder | null; completed: string[]; routes: string[] };
  museum: { relics: string[]; scenes: string[]; variants: Record<string, MemoryVariant> };
  storms: {
    optIn: boolean;
    active: boolean;
    selectedRealm: string;
    completions: number;
    lastBossId: string | null;
  };
  beyond: {
    cycle: number;
    choices: Record<string, RealmEndingChoice>;
    history: BeyondCycleRecord[];
  };
}

export function freshEchoSystems(): EchoSystemsState {
  return {
    v: 1,
    cartography: { routes: [] },
    restoration: { level: 0, freedRealms: [] },
    bonds: { unlocked: false, sceneSeen: false },
    council: { votes: [] },
    dreams: { memories: 0, runs: 0, best: 0, completed: 0, activeRun: null },
    constellations: { stage: 0, failures: 0, completed: false },
    caravans: { active: null, completed: [], routes: [] },
    museum: { relics: [], scenes: [], variants: {} },
    storms: {
      optIn: false,
      active: false,
      selectedRealm: "ferrolume",
      completions: 0,
      lastBossId: null,
    },
    beyond: { cycle: 0, choices: {}, history: [] },
  };
}

const strings = (v: unknown, max = 300): string[] =>
  Array.isArray(v)
    ? [...new Set(v.filter((x): x is string => typeof x === "string" && x.length <= 120))].slice(
        0,
        max,
      )
    : [];
const nonNegativeInt = (v: unknown, max = 1_000_000) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0;
const recordOfStrings = (v: unknown): Record<string, string> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (Object.fromEntries(
        Object.entries(v as Record<string, unknown>).filter(
          ([k, x]) => k.length <= 120 && typeof x === "string" && x.length <= 120,
        ),
      ) as Record<string, string>)
    : {};

export function sanitizeEchoSystems(raw: unknown): EchoSystemsState {
  const d = raw && typeof raw === "object" ? (raw as Partial<EchoSystemsState>) : {};
  const base = freshEchoSystems();
  const caravans = d.caravans && typeof d.caravans === "object" ? d.caravans : base.caravans;
  const active =
    caravans.active &&
    typeof caravans.active === "object" &&
    typeof caravans.active.id === "string" &&
    typeof caravans.active.realm === "string"
      ? {
          id: caravans.active.id.slice(0, 120),
          realm: caravans.active.realm.slice(0, 120),
          acceptedAtCycle: nonNegativeInt(caravans.active.acceptedAtCycle),
          arrivalVerified: caravans.active.arrivalVerified === true,
        }
      : null;
  const museum = d.museum && typeof d.museum === "object" ? d.museum : base.museum;
  const variantsRaw = recordOfStrings(museum.variants);
  const variants = Object.fromEntries(
    Object.entries(variantsRaw).filter(
      ([k, v]) => k.length <= 120 && (v === "remember" || v === "release"),
    ),
  ) as Record<string, MemoryVariant>;
  const beyond = d.beyond && typeof d.beyond === "object" ? d.beyond : base.beyond;
  const dreams = d.dreams && typeof d.dreams === "object" ? d.dreams : base.dreams;
  const choicesRaw =
    beyond.choices && typeof beyond.choices === "object"
      ? (beyond.choices as Record<string, unknown>)
      : {};
  const choices = Object.fromEntries(
    Object.entries(choicesRaw).filter(
      ([k, v]) => k.length <= 120 && (v === "preserve" || v === "transform"),
    ),
  ) as Record<string, RealmEndingChoice>;
  const history = Array.isArray(beyond.history)
    ? beyond.history.slice(-50).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const h = item as { cycle?: unknown; choices?: unknown };
        const c =
          h.choices && typeof h.choices === "object" ? (h.choices as Record<string, unknown>) : {};
        const hs = Object.fromEntries(
          Object.entries(c).filter(
            ([k, v]) => k.length <= 120 && (v === "preserve" || v === "transform"),
          ),
        ) as Record<string, RealmEndingChoice>;
        return [{ cycle: nonNegativeInt(h.cycle, 10_000), choices: hs }];
      })
    : [];
  const storms = d.storms && typeof d.storms === "object" ? d.storms : base.storms;
  return {
    v: 1,
    cartography: { routes: strings(d.cartography?.routes, 100) },
    restoration: {
      level: Math.min(3, nonNegativeInt(d.restoration?.level, 3)),
      freedRealms: strings(d.restoration?.freedRealms, 20),
    },
    bonds: { unlocked: d.bonds?.unlocked === true, sceneSeen: d.bonds?.sceneSeen === true },
    council: { votes: strings(d.council?.votes, 12) },
    dreams: {
      memories: Math.min(
        9,
        nonNegativeInt(dreams.memories, 99) + (nonNegativeInt(dreams.activeRun, 999) > 0 ? 1 : 0),
      ),
      runs: nonNegativeInt(dreams.runs, 999),
      best: nonNegativeInt(dreams.best, 10),
      completed: nonNegativeInt(dreams.completed, 999),
      activeRun: null,
    },
    constellations: {
      stage: Math.min(3, nonNegativeInt(d.constellations?.stage, 3)),
      failures: nonNegativeInt(d.constellations?.failures, 999),
      completed: d.constellations?.completed === true,
    },
    caravans: {
      active,
      completed: strings(caravans.completed, 30),
      routes: strings(caravans.routes, 30),
    },
    museum: { relics: strings(museum.relics, 100), scenes: strings(museum.scenes, 100), variants },
    storms: {
      optIn: storms.optIn === true,
      // Runs são instâncias temporárias e não podem ficar presas como ativas após recarregar o navegador.
      active: false,
      selectedRealm:
        typeof storms.selectedRealm === "string"
          ? storms.selectedRealm.slice(0, 120)
          : base.storms.selectedRealm,
      completions: nonNegativeInt(storms.completions, 999),
      lastBossId: typeof storms.lastBossId === "string" ? storms.lastBossId.slice(0, 120) : null,
    },
    beyond: { cycle: nonNegativeInt(beyond.cycle, 99), choices, history },
  };
}

/** Progresso de Hub salvo em localStorage não carrega instâncias ativas de masmorra. */
export const ECHO_SYSTEMS_SAVE_VERSION = 1;
