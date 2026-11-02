// Defesa de Aurélia: dados puros do modo de ondas (mapa, rotas, composição das ondas e chefões a cada 10 ondas).
import type { BossDef, EnemyKind } from './data';
import { BIOME_LIST, T, W, H, hash, type World } from './world';

/** Portal na Vila de Potos (lado leste da praça). */
export const SIEGE_PORTAL = { tx: 142, ty: 124 };
export const SIEGE_CITY_MAX = 20;
export const SIEGE_BOSS_EVERY = 10;
export const SIEGE_INTERMISSION = 9;

// Mapa local: origem fixa e tamanho do campo de batalha.
export const SX = 6, SY = 6, SW = 36, SH = 48;
export const CITY_WALL_Y = 11;
export const GATE = { tx: 18, ty: CITY_WALL_Y };
export const HEART = { tx: 18, ty: 5 };
export const PLAYER_START = { tx: 18, ty: 14 };

type Pt = [number, number];
/** Três rotas (esquerda, centro, direita) dos rifts até o portão. Coordenadas locais em tiles. */
export const LANES: Pt[][] = [
  [[5, 44], [5, 35], [11, 29], [9, 21], [16, 16], [18, 12]],
  [[18, 45], [18, 37], [25, 31], [18, 24], [18, 17], [18, 12]],
  [[31, 44], [31, 35], [25, 27], [28, 20], [20, 16], [18, 12]],
];
export const RIFTS = LANES.map((l) => l[0]!);

export interface SiegeSpawn { kind: EnemyKind; lane: number; level: number; elite: boolean; delay: number }
export interface SiegeWave { n: number; spawns: SiegeSpawn[]; boss: (BossDef & { lane: number; kind: EnemyKind; tint: string; scale: number }) | null }

const TIERS: EnemyKind[][] = [
  ['goblin', 'mushroom', 'rat', 'slime', 'wolf', 'sporeling', 'bat'],
  ['boar', 'skeleton', 'spider', 'scorpion', 'crow', 'pixie', 'imp'],
  ['golem', 'gargoyle', 'mummy', 'wraith', 'serpent', 'beetle', 'jelly'],
  ['shade', 'treant', 'salamander', 'sprite', 'mimic', 'wraith', 'imp'],
];
const RUSHERS: EnemyKind[] = ['wolf', 'bat', 'boar', 'crow'];

export const SIEGE_WARLORDS = [
  { id: 'siege_grommak', name: 'Grommak, Aríete das Brechas', kind: 'golem' as EnemyKind, tint: '#d08a4a', scale: 2.4, minion: 'goblin' as EnemyKind, color: '#d08a4a' },
  { id: 'siege_velis', name: 'Velis, Rainha das Teias', kind: 'spider' as EnemyKind, tint: '#9a5ad0', scale: 2.6, minion: 'spider' as EnemyKind, color: '#b070ff' },
  { id: 'siege_oskar', name: 'Oskar, Rei dos Ossos', kind: 'skeleton' as EnemyKind, tint: '#e8e0c8', scale: 2.5, minion: 'skeleton' as EnemyKind, color: '#f0e6c0' },
  { id: 'siege_thorn', name: 'Thorn, o Bosque que Marcha', kind: 'treant' as EnemyKind, tint: '#5aa040', scale: 2.3, minion: 'sporeling' as EnemyKind, color: '#70c050' },
  { id: 'siege_ashka', name: 'Ashka, Dragoa das Cinzas', kind: 'salamander' as EnemyKind, tint: '#ff6030', scale: 2.6, minion: 'imp' as EnemyKind, color: '#ff7040' },
];
export const SIEGE_BOSS_LOOK: Record<string, { kind: EnemyKind; tint: string; scale: number }> =
  Object.fromEntries(SIEGE_WARLORDS.map((w) => [w.id, { kind: w.kind, tint: w.tint, scale: w.scale }]));

export const isBossWave = (n: number) => n > 0 && n % SIEGE_BOSS_EVERY === 0;
export const lanesFor = (n: number) => (n >= 6 ? 3 : n >= 3 ? 2 : 1);
/** Nível dos inimigos: acompanha o herói e sobe a cada onda. */
export const siegeLevel = (n: number, playerLevel: number) => Math.max(1, Math.round(Math.max(1, playerLevel - 2) + (n - 1) * 0.5));
export const waveSize = (n: number) => Math.min(36, 3 + Math.floor(n * 1.6));
/** Quanto de vida da cidade cada inimigo arranca ao passar pelo portão. */
export const breachDamage = (elite: boolean, boss: boolean) => (boss ? 10 : elite ? 3 : 1);
export const waveGold = (n: number) => 15 * n + (isBossWave(n) ? 150 * (n / SIEGE_BOSS_EVERY) : 0);

function rand(seed: number) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

export function siegeWave(n: number, playerLevel: number): SiegeWave {
  const r = rand(n * 7919 + 17), level = siegeLevel(n, playerLevel), lanes = lanesFor(n);
  const tier = Math.min(TIERS.length - 1, Math.floor((n - 1) / 10));
  const pool = [...TIERS[tier]!, ...(tier > 0 ? TIERS[tier - 1]!.slice(0, 3) : [])];
  const boss = isBossWave(n);
  const count = boss ? Math.ceil(waveSize(n) / 2) : waveSize(n);
  const elites = n >= 4 ? Math.min(6, Math.floor(n / 4)) : 0;
  const gap = Math.max(0.45, 1.2 - n * 0.025);
  const spawns: SiegeSpawn[] = [];
  let t = 0;
  for (let i = 0; i < count; i++) {
    // Pequenos grupos por rota: a rota muda a cada 3 inimigos, forçando o herói a se reposicionar.
    const lane = lanes === 1 ? 1 : lanes === 2 ? (Math.floor(i / 3) % 2 === 0 ? 0 : 2) : Math.floor(i / 3) % 3;
    const rush = n >= 5 && i % 7 === 6;
    const kind = rush ? RUSHERS[Math.floor(r() * RUSHERS.length)]! : pool[Math.floor(r() * pool.length)]!;
    spawns.push({ kind, lane, level, elite: i >= count - elites, delay: t });
    t += i % 3 === 2 ? gap * 2.4 : gap;
  }
  let bossDef: SiegeWave['boss'] = null;
  if (boss) {
    const k = n / SIEGE_BOSS_EVERY, w = SIEGE_WARLORDS[(k - 1) % SIEGE_WARLORDS.length]!;
    const hp = Math.round((180 + n * 36) * (1 + playerLevel * 0.07));
    bossDef = {
      id: w.id, name: w.name, biome: 'plains', tx: 0, ty: 0, hp, atk: Math.round(8 + n * 0.7 + playerLevel * 0.4),
      xp: 220 + n * 40, gold: 100 + n * 15, color: w.color, minion: w.minion,
      reward: k % 2 === 0 ? ['elixir', 'hi_potion'] : ['hi_potion', 'ether'], lane: 1, kind: w.kind, tint: w.tint, scale: w.scale,
    };
  }
  return { n, spawns, boss: bossDef };
}

/** Rasteriza as rotas em tiles (para cavar o caminho e checar decoração). */
export function laneTiles(): Set<number> {
  const out = new Set<number>();
  for (const lane of LANES) for (let i = 1; i < lane.length; i++) {
    const [ax, ay] = lane[i - 1]!, [bx, by] = lane[i]!, steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2;
    for (let s = 0; s <= steps; s++) { const x = Math.round(ax + ((bx - ax) * s) / steps), y = Math.round(ay + ((by - ay) * s) / steps); for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) out.add((y + k) * SW + x + j); }
  }
  return out;
}

let cached: World | null = null;
/** Campo de batalha determinístico: cidade murada no topo, campo com três rotas e rifts embaixo. */
export function siegeWorld(): World {
  if (cached) return cached;
  const tiles = new Uint8Array(W * H).fill(T.TREE);
  const biomes = new Uint8Array(W * H).fill(Math.max(0, BIOME_LIST.indexOf('plains')));
  const set = (x: number, y: number, t: number) => { if (x >= 0 && y >= 0 && x < SW && y < SH) tiles[(y + SY) * W + x + SX] = t; };
  for (let y = 1; y < SH - 1; y++) for (let x = 1; x < SW - 1; x++) set(x, y, hash(x, y, 41) < 0.08 ? T.FLOWER : T.GRASS);
  // Cidade: praça de pedra, casas e muralha com portão.
  for (let y = 1; y < CITY_WALL_Y; y++) for (let x = 1; x < SW - 1; x++) set(x, y, T.COBBLE);
  const house = (x: number, y: number, w: number) => { for (let i = 0; i < w; i++) { set(x + i, y, T.ROOF); set(x + i, y + 1, T.WALL); } };
  house(3, 2, 4); house(9, 2, 3); house(25, 2, 3); house(30, 2, 4); house(3, 7, 3); house(30, 7, 3); house(9, 7, 2); house(26, 7, 2);
  for (let x = 1; x < SW - 1; x++) set(x, CITY_WALL_Y, Math.abs(x - GATE.tx) <= 1 ? T.COBBLE : T.WALL);
  for (let y = CITY_WALL_Y; y <= CITY_WALL_Y + 1; y++) for (let x = GATE.tx - 1; x <= GATE.tx + 1; x++) set(x, y, T.COBBLE);
  set(HEART.tx, HEART.ty, T.PILLAR);
  // Rotas e decoração longe delas.
  const lane = laneTiles();
  for (let y = CITY_WALL_Y + 1; y < SH - 1; y++) for (let x = 1; x < SW - 1; x++) {
    if (lane.has(y * SW + x)) { set(x, y, T.PATH); continue; }
    let near = false; for (let k = -2; k <= 2 && !near; k++) for (let j = -2; j <= 2; j++) if (lane.has((y + k) * SW + x + j)) { near = true; break; }
    if (near || y < CITY_WALL_Y + 3) continue;
    const h = hash(x, y, 77);
    if (h < 0.05) set(x, y, T.TREE); else if (h < 0.07) set(x, y, T.ROCK); else if (h < 0.1) set(x, y, T.BUSH);
  }
  cached = { tiles, biomes, nodes: [] };
  return cached;
}
