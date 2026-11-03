import { BIOME_NAMES, type Biome } from "./data";
import { BIOME_LIST, H, TS, W, hash, solidAt, type World } from "./world";

/** Fragmentos adicionais: 650 cadeias existentes + 44.350 locais = 45.000 segredos. */
export const MAP_SECRET_TOTAL = 44_350;
export const MAP_SECRET_CHUNK = 80;
export const MAP_SECRET_COLUMNS = Math.ceil(W / MAP_SECRET_CHUNK);
export const MAP_SECRET_ROWS = Math.ceil(H / MAP_SECRET_CHUNK);
export const MAP_SECRET_CHUNK_COUNT = MAP_SECRET_COLUMNS * MAP_SECRET_ROWS;
const BASE_PER_CHUNK = 37;
const REDUCED_CHUNKS = MAP_SECRET_CHUNK_COUNT * BASE_PER_CHUNK - MAP_SECRET_TOTAL;
const MAX_CHUNK_CACHE = 64;

export interface MapSecret {
  id: string;
  key: string;
  tx: number;
  ty: number;
  biome: Biome;
  name: string;
  lore: string;
  color: string;
  item: string;
  qty: number;
  gold: number;
  xp: number;
}

const NAMES = [
  "Cápsula de Viajante",
  "Eco Engarrafado",
  "Semente de Canção",
  "Mapa Rasgado",
  "Lembrança de Âmbar",
  "Sino Sem Badalo",
  "Carta Nunca Enviada",
  "Fóssil de Luz",
  "Bolsa do Cartógrafo",
  "Ninho de Estrelas",
  "Relicário da Estrada",
  "Pétala Imortal",
  "Pedaço de Aurora",
  "Moeda do Barqueiro",
  "Vela de Vigília",
  "Brasa Adormecida",
  "Página Sem Tinta",
  "Concha que Sonha",
  "Dado do Destino",
  "Selo de Mana",
];
const LORE = [
  "A marca no estojo diz: “se alguém encontrar isto, a estrada continua”.",
  "A voz dentro do fragmento agradece por finalmente poder descansar.",
  "Uma criança desenhou três luas e escreveu que voltaria antes do inverno.",
  "O mapa termina aqui, mas uma seta aponta para uma aventura que ainda não aconteceu.",
  "O objeto guarda o calor de mãos que já não existem; a memória, não.",
  "O silêncio abre espaço para uma única nota, pequena e teimosa.",
  "No verso há uma receita, uma piada e o nome de alguém que ninguém esqueceu.",
  "Lírien deixou uma linha nas margens: “o mundo inteiro merece ser procurado”.",
  "A relíquia muda de cor conforme o chão, como se ainda estivesse aprendendo a pertencer.",
  "Alguém escondeu uma lembrança feliz no pior dia da viagem.",
  "O viajante que a deixou prometeu voltar. A promessa continua aqui.",
  "A poeira se desfaz e revela uma constelação minúscula no metal.",
  "Uma fita amarrada ao achado diz apenas: “para quem chegar depois”.",
  "As marcas contam uma história sem herói: uma cidade ajudou a outra a sobreviver.",
  "O tesouro não era valioso quando foi escondido. Tornou-se precioso porque esperou.",
  "Um pequeno verso sugere que outras coisas perdidas ainda dormem pelo mapa.",
];
const ITEMS = [
  "mana_shard",
  "herb",
  "wood",
  "stone",
  "coal",
  "frost_herb",
  "crystal_ore",
  "iron_ore",
  "ether",
  "hi_potion",
  "desert_rose",
  "chitin",
];
const COLORS = [
  "#ffe4a3",
  "#a7e9ff",
  "#e3b7ff",
  "#aff0c5",
  "#ffb3c6",
  "#b9c7ff",
  "#f6d97c",
  "#b1f4ed",
];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mapSecretsInChunk(index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= MAP_SECRET_CHUNK_COUNT) return 0;
  return BASE_PER_CHUNK - (index < REDUCED_CHUNKS ? 1 : 0);
}

function walkable(world: World, tx: number, ty: number) {
  return tx > 1 && ty > 1 && tx < W - 2 && ty < H - 2 && !solidAt(world, tx * TS + 8, ty * TS + 8);
}

function position(
  world: World,
  chunkX: number,
  chunkY: number,
  seed: number,
  occupied: Set<number>,
) {
  const random = rng(seed);
  const ox = chunkX * MAP_SECRET_CHUNK;
  const oy = chunkY * MAP_SECRET_CHUNK;
  const spanX = Math.min(MAP_SECRET_CHUNK, W - ox);
  const spanY = Math.min(MAP_SECRET_CHUNK, H - oy);
  const start = Math.floor(random() * spanX * spanY);
  const total = spanX * spanY;
  // Walkable cells are normally found within a few attempts. The modular scan is
  // deterministic and remains bounded even in an obstacle-dense frontier sector.
  for (let i = 0; i < total; i++) {
    const slot = (start + i * 7919) % total;
    const tx = ox + (slot % spanX);
    const ty = oy + Math.floor(slot / spanX);
    const key = ty * W + tx;
    if (!occupied.has(key) && walkable(world, tx, ty)) {
      occupied.add(key);
      return { tx, ty };
    }
  }
  // Coastal sectors can be all water. Move the lost cache to the closest land
  // within one sector so it remains discoverable; callers inspect a one-sector halo.
  const cx = Math.min(W - 3, ox + Math.floor(spanX / 2));
  const cy = Math.min(H - 3, oy + Math.floor(spanY / 2));
  for (let r = 1; r <= MAP_SECRET_CHUNK; r++) {
    for (let k = -r; k <= r; k++) {
      for (const [tx, ty] of [
        [cx + k, cy - r],
        [cx + k, cy + r],
        [cx - r, cy + k],
        [cx + r, cy + k],
      ] as const) {
        const key = ty * W + tx;
        if (!occupied.has(key) && walkable(world, tx, ty)) {
          occupied.add(key);
          return { tx, ty };
        }
      }
    }
  }
  // The authored world always has land, but keep a deterministic safe fallback
  // if a future custom map omits it entirely.
  return { tx: Math.max(2, Math.min(W - 3, cx)), ty: Math.max(2, Math.min(H - 3, cy)) };
}

const cacheByWorld = new WeakMap<World, Map<number, MapSecret[]>>();
function buildChunk(world: World, index: number): MapSecret[] {
  const chunkX = index % MAP_SECRET_COLUMNS;
  const chunkY = Math.floor(index / MAP_SECRET_COLUMNS);
  const seed = Math.floor(hash(chunkX + 81, chunkY + 37, 0x5ec2e7) * 0xffffffff) >>> 0;
  const random = rng(seed);
  const occupied = new Set<number>();
  const out: MapSecret[] = [];
  const count = mapSecretsInChunk(index);
  for (let i = 0; i < count; i++) {
    const p = position(world, chunkX, chunkY, seed + i * 7919 + 17, occupied);
    const biomeIndex = world.biomes[p.ty * W + p.tx] ?? 0;
    const biome = BIOME_LIST[biomeIndex] ?? "plains";
    const item = ITEMS[(index * 7 + i * 11 + Math.floor(random() * ITEMS.length)) % ITEMS.length]!;
    out.push({
      id: `m${index.toString(36)}_${i.toString(36)}`,
      key: `map-secret:m${index.toString(36)}_${i.toString(36)}`,
      tx: p.tx,
      ty: p.ty,
      biome,
      name: `${NAMES[(index * 5 + i * 3) % NAMES.length]} · ${BIOME_NAMES[biome]}`,
      lore: LORE[(index * 13 + i * 7 + Math.floor(random() * LORE.length)) % LORE.length]!,
      color: COLORS[(index + i * 3) % COLORS.length]!,
      item,
      qty: 1 + ((index + i) % 3),
      gold: 18 + ((index * 31 + i * 47) % 203),
      xp: 12 + ((index * 19 + i * 29) % 89),
    });
  }
  return out;
}

function chunk(world: World, index: number) {
  let cache = cacheByWorld.get(world);
  if (!cache) {
    cache = new Map();
    cacheByWorld.set(world, cache);
  }
  const hit = cache.get(index);
  if (hit) {
    cache.delete(index);
    cache.set(index, hit);
    return hit;
  }
  const created = buildChunk(world, index);
  cache.set(index, created);
  if (cache.size > MAX_CHUNK_CACHE) cache.delete(cache.keys().next().value!);
  return created;
}

/** Query only the intersecting sectors plus a halo for coastline relocation. */
export function mapSecretsInRect(world: World, x0: number, y0: number, x1: number, y1: number) {
  const halo = MAP_SECRET_CHUNK;
  const left = Math.max(0, Math.floor((x0 - halo) / MAP_SECRET_CHUNK));
  const top = Math.max(0, Math.floor((y0 - halo) / MAP_SECRET_CHUNK));
  const right = Math.min(MAP_SECRET_COLUMNS - 1, Math.floor((x1 + halo) / MAP_SECRET_CHUNK));
  const bottom = Math.min(MAP_SECRET_ROWS - 1, Math.floor((y1 + halo) / MAP_SECRET_CHUNK));
  const out: MapSecret[] = [];
  for (let cy = top; cy <= bottom; cy++)
    for (let cx = left; cx <= right; cx++) {
      const index = cy * MAP_SECRET_COLUMNS + cx;
      for (const secret of chunk(world, index))
        if (secret.tx >= x0 && secret.tx <= x1 && secret.ty >= y0 && secret.ty <= y1)
          out.push(secret);
    }
  return out;
}

export function mapSecretById(world: World, id: string) {
  const match = /^m([0-9a-z]+)_([0-9a-z]+)$/.exec(id);
  if (!match) return undefined;
  const index = Number.parseInt(match[1]!, 36);
  const local = Number.parseInt(match[2]!, 36);
  return chunk(world, index)[local];
}
