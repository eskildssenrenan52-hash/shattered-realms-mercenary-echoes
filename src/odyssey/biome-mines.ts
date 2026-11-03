import { BIOME_ENEMIES, BIOME_NAMES, type Biome, type BossDef, type EnemyKind } from './data';
import { FRONTIER } from './frontier';
import { generateFloor, THEMES, type DungeonFloor, type DungeonStyle, type Theme } from './dungeon';
import { BIOME_LIST, T, W } from './world';

export const BIOME_MINE_FLOORS = 10;
const styles: DungeonStyle[] = ['classic', 'gauntlet', 'vault', 'mirror'];
const ORES: Partial<Record<Biome, string>> = {
  autumn: 'forge_amber_ore', coast: 'forge_tide_ore', swamp: 'forge_mire_ore', jungle: 'forge_canopy_ore', volcanic: 'forge_ember_ore', mushroom: 'forge_mycelium_ore', meadow: 'forge_moon_ore', ruins: 'forge_marble_ore',
};
const BASIC_ORES: Partial<Record<Biome, string>> = { plains: 'iron_ore', forest: 'copper_ore', desert: 'copper_ore', cave: 'crystal_ore', mountain: 'iron_ore', sakura: 'copper_ore', moonwood: 'crystal_ore', prism: 'crystal_ore', coral: 'copper_ore', bamboo: 'iron_ore', thunder: 'iron_ore', obsidian: 'coal', sunflower: 'copper_ore', lavender: 'crystal_ore', mangrove: 'iron_ore', aurora: 'crystal_ore', amber: 'copper_ore', spores: 'crystal_ore', lotus: 'crystal_ore', crimson: 'iron_ore', oasis: 'copper_ore' };
const oreOf = (b: Biome) => ORES[b] ?? BASIC_ORES[b] ?? 'iron_ore';

const PREFIX = ['Ashen', 'Veiled', 'Hollow', 'Gilded', 'Forgotten', 'Shattered', 'Eclipsed', 'Ancient', 'Wandering', 'Silent'];
const SUFFIX = ['Warden', 'Devourer', 'Sentinel'];
const BOSS_DATA: Record<Biome, { id: string; name: string; kind: EnemyKind }> = Object.fromEntries(BIOME_LIST.map((b, i) => {
  const pool = BIOME_ENEMIES[b] ?? FRONTIER[b as keyof typeof FRONTIER]?.enemies ?? ['golem'];
  return [b, { id: `mine_boss_${b}`, name: `${PREFIX[Math.floor(i / 3)]} ${BIOME_NAMES[b]} ${SUFFIX[i % 3]}`, kind: pool[i % pool.length]! }];
})) as Record<Biome, { id: string; name: string; kind: EnemyKind }>;
function biomeOf(temple: string): Biome | null {
  const candidate = temple.startsWith('mine:') ? temple.slice(5) : temple;
  return (BIOME_LIST as string[]).includes(candidate) ? candidate as Biome : null;
}
export function biomeMineBossId(temple: string): string {
  const biome = biomeOf(temple);
  return biome ? BOSS_DATA[biome].id : '';
}
const key = (b: Biome, f: number) => `mine:${b}:floor:${f}`;
export function biomeMineBestFloor(discoveries: ReadonlySet<string>, temple: string): number {
  const biome = biomeOf(temple);
  if (!biome) return 0;
  let best = 0;
  while (best < BIOME_MINE_FLOORS && discoveries.has(key(biome, best + 1))) best++;
  return best;
}
/** Acrescenta apenas a próxima etapa alcançável no Set de discoveries preexistente. */
export function recordBiomeMineFloor(discoveries: Set<string>, temple: string, floor: number): Set<string> {
  const biome = biomeOf(temple);
  if (!biome || !Number.isInteger(floor) || floor < 1 || floor > BIOME_MINE_FLOORS) return discoveries;
  if (floor <= biomeMineBestFloor(discoveries, temple) + 1) discoveries.add(key(biome, floor));
  return discoveries;
}
function themeFor(b: Biome): Theme {
  const match = THEMES.find(t => t.biome === b);
  if (match) return match;
  const fallback: Record<string, Biome> = { forest: 'autumn', plains: 'meadow', mountain: 'mountain', sakura: 'forest', moonwood: 'cave', prism: 'cave', coral: 'coast', bamboo: 'forest', thunder: 'mountain', obsidian: 'volcanic', sunflower: 'meadow', lavender: 'forest', mangrove: 'swamp', aurora: 'mountain', amber: 'desert', spores: 'mushroom', lotus: 'swamp', crimson: 'autumn', oasis: 'desert' };
  return THEMES.find(t => t.biome === (fallback[b] ?? 'cave'))!;
}
export function generateBiomeMineFloor(temple: string, floor: number): DungeonFloor {
  const biome = biomeOf(temple);
  if (!biome) throw new RangeError(`Bioma de mina inválido: ${temple}`);
  if (!Number.isInteger(floor) || floor < 1 || floor > BIOME_MINE_FLOORS) throw new RangeError(`Andar de mina inválido: ${floor}`);
  const theme = { ...themeFor(biome), biome, name: `${BIOME_NAMES[biome]} — Mina` };
  // Encoded integer hash avoids locale/runtime-dependent string hashing.
  let seed = 2166136261;
  for (const c of biome) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619);
  seed = (seed ^ Math.imul(floor, 0x9e3779b1)) >>> 0;
  const mine = generateFloor(floor, { theme, seed, size: { w: 82, h: 62 }, level: 4 + floor * 4, idPrefix: `mine-${biome}`, style: styles[(floor - 1) % styles.length], eliteBonus: 0.04 });
  // Guarantee a collectible node in a traversable room, in addition to the deterministic chest.
  mine.world.nodes.push({ id: 900000 + floor, tx: mine.stairs.tx - 2, ty: mine.stairs.ty, item: oreOf(biome), respawn: 0 });
  mine.chests[0] = mine.chests[0] ?? { id: `mine-${biome}-${floor}-ore-cache`, tx: mine.stairs.tx - 1, ty: mine.stairs.ty, gold: 20 + floor * 10, item: oreOf(biome), qty: 1 + Math.floor(floor / 4) };
  mine.chests[0].item = oreOf(biome);
  if (floor === BIOME_MINE_FLOORS) {
    const def = BOSS_DATA[biome], kind = def.kind;
    mine.boss = { id: def.id, name: def.name, biome, tx: mine.stairs.tx, ty: mine.stairs.ty - 2, hp: 1800 + floor * 850, atk: 18 + floor * 5, xp: 1200 + floor * 400, gold: 500 + floor * 120, color: FRONTIER[biome as keyof typeof FRONTIER]?.base ?? theme.color, minion: kind, reward: [oreOf(biome), 'hi_potion'] } satisfies BossDef;
  } else mine.boss = null;
  // The stair at start is the entry/up stair; generated stairs is the reachable down stair.
  mine.world.tiles[mine.start.ty * W + mine.start.tx] = mine.theme.floor || T.FLOOR;
  return mine;
}
