import { ITEMS, type Biome } from "./data";
import { BIOME_LIST } from "./world";
import { generateWorld, H, SOLID, T, W, type World } from "./world";

/** Seed reservada para a geografia independente de Farlands (nunca a seed legado 0). */
export const FARLANDS_SEED = 2764087;

export interface FarlandsSite {
  id: string;
  name: string;
  biome: Biome;
  target: { x: number; y: number };
  kind: "shrine" | "ruin" | "grove" | "cavern" | "harbor" | "spring";
  illustration: { ground: number; accent: number; mark: number };
  lore: string;
  reward: string;
}

const rows: Array<[string, string, Biome, number, number, FarlandsSite["kind"], number, number, number, string, string]> = [
  ["glass-tide", "Glass Tide", "coast", 570, 320, "harbor", T.SAND, T.WATER, T.BRIDGE, "A maré deixa lâminas de vidro que guardam memórias de navegantes.", "desert_rose"],
  ["windward", "Windward Steps", "mountain", 1010, 300, "shrine", T.SNOW, T.ROCK, T.PILLAR, "Degraus talhados no gelo apontam para um céu que já não existe.", "frost_herb"],
  ["ember-well", "Emberwell", "volcanic", 1480, 350, "spring", T.ASH, T.LAVA, T.ROCK, "Uma nascente morna pulsa sob as cinzas como um coração antigo.", "mana_shard"],
  ["mothwood", "Mothwood", "forest", 1980, 330, "grove", T.GRASS, T.DTREE, T.MUSHROOM, "Mariposas luminosas conduzem viajantes por trilhas que mudam à noite.", "wood"],
  ["salt-oracle", "Salt Oracle", "desert", 2500, 340, "ruin", T.SAND, T.PILLAR, T.CRYSTAL, "O oráculo prevê apenas a próxima tempestade — e nunca erra.", "iron_ore"],
  ["pearl-marsh", "Pearl Marsh", "swamp", 2820, 520, "spring", T.MOSS, T.WATER, T.PILLAR, "Pérolas crescem nas raízes de árvores submersas, alimentadas por canções.", "herb"],
  ["reed-crown", "Reed Crown", "meadow", 2400, 700, "grove", T.MEADOW, T.FLOWER, T.PILLAR, "As ervas altas vergam em círculo, mesmo quando o vento está parado.", "herb_amulet"],
  ["copper-choir", "Copper Choir", "ruins", 1920, 760, "ruin", T.RUINS, T.COBBLE, T.PILLAR, "Sinos de cobre ressoam sob as pedras quando alguém pronuncia seu próprio nome.", "copper_ring"],
  ["blue-archive", "Blue Archive", "cave", 1450, 790, "cavern", T.CAVE, T.CRYSTAL, T.PILLAR, "Prateleiras minerais preservam histórias em veios azuis.", "crystal_ore"],
  ["red-canopy", "Red Canopy", "autumn", 950, 750, "grove", T.AUTUMN, T.AUTUMN_TREE, T.FLOWER, "Folhas vermelhas caem para cima quando a lua está visível.", "wolf_ring"],
  ["sunken-mile", "Sunken Mile", "coast", 520, 900, "harbor", T.SAND, T.WATER, T.BRIDGE, "Marcos de estrada emergem na vazante, marcando uma rota continental afogada.", "mana_ring"],
  ["moss-lantern", "Moss Lantern", "mushroom", 700, 1160, "shrine", T.MOSS, T.MUSHROOM, T.CRYSTAL, "Um fungo enorme ilumina o vale e floresce apenas diante de visitantes gentis.", "goo"],
  ["jade-run", "Jade Run", "jungle", 1150, 1120, "grove", T.MOSS, T.PALM, T.FLOWER, "Uma corrente verde serpenteia entre palmeiras que escondem o curso do rio.", "wood"],
  ["stillglass", "Stillglass Basin", "plains", 1650, 1120, "spring", T.GRASS, T.WATER, T.CRYSTAL, "A lagoa reflete constelações de épocas diferentes da noite presente.", "ether"],
  ["cinder-gate", "Cinder Gate", "volcanic", 2150, 1150, "ruin", T.ASH, T.ROCK, T.PILLAR, "O arco de basalto não tem portas, mas ninguém se lembra de atravessá-lo.", "iron_armor"],
  ["thorn-bell", "Thorn Bell", "forest", 2680, 1120, "shrine", T.GRASS, T.TREE, T.PILLAR, "Uma campânula vegetal toca quando um viajante perdido encontra o caminho.", "hi_potion"],
  ["pale-dunes", "Pale Dunes", "desert", 2820, 1450, "ruin", T.SAND, T.DUNE, T.PILLAR, "Dunas pálidas cobrem uma cidade cujos habitantes partiram em silêncio.", "sun_amulet"],
  ["frost-bloom", "Frost Bloom", "mountain", 2260, 1510, "shrine", T.SNOW, T.ICE, T.FLOWER, "Uma flor azul resiste no topo e descongela a neve ao redor por um instante.", "frost_mail"],
  ["quiet-fen", "Quiet Fen", "swamp", 1770, 1510, "spring", T.MOSS, T.WATER, T.DTREE, "O pântano absorve sons; só o coaxar distante atravessa sua névoa.", "elixir"],
  ["ashen-library", "Ashen Library", "ruins", 1260, 1510, "ruin", T.RUINS, T.ASH, T.PILLAR, "Cada coluna registra uma promessa esquecida por uma civilização inteira.", "mana_sword"],
  ["green-comet", "Green Comet", "meadow", 750, 1550, "grove", T.MEADOW, T.FLOWER, T.CRYSTAL, "Fragmentos celestes repousam entre flores que se voltam para o norte.", "crystal_spear"],
  ["last-palm", "Last Palm", "coast", 550, 1840, "harbor", T.SAND, T.PALM, T.BRIDGE, "A última palmeira da costa traz marcas de muitas gerações de marinheiros.", "short_bow"],
  ["moon-shelf", "Moon Shelf", "cave", 1530, 1880, "cavern", T.CAVE, T.CRYSTAL, T.PILLAR, "Cristais suspensos na abóbada refletem a lua mesmo durante o dia.", "crystal_plate"],
  ["far-seed", "Far Seed", "jungle", 2480, 1900, "shrine", T.MOSS, T.PALM, T.FLOWER, "Uma semente petrificada contém, dizem, a floresta que ainda virá.", "elven_bow"],
];

export const FARLANDS_SITES: readonly FarlandsSite[] = Object.freeze(rows.map(([id, name, biome, x, y, kind, ground, accent, mark, lore, reward]) => Object.freeze({
  id, name, biome, target: Object.freeze({ x, y }), kind,
  illustration: Object.freeze({ ground, accent, mark }), lore, reward,
})) as FarlandsSite[]);

/** Portais de ligação: coordenadas no mapa Farlands e identificador estável. */
export const FARLANDS_PORTALS = Object.freeze([
  { id: "farlands-north", name: "Passagem do Norte", x: 1600, y: 180 },
  { id: "farlands-south", name: "Arco do Horizonte", x: 1600, y: 2210 },
] as const);

/** Busca em anéis, desempate por y/x; não altera o mundo. */
export function findNearbyWalkableTile(world: World, x: number, y: number, used: ReadonlySet<number> = new Set(), maxRadius = 96): { x: number; y: number } | null {
  const cx = Math.round(x), cy = Math.round(y);
  const isFree = (tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < W && ty < H && !SOLID.has(world.tiles[ty * W + tx]!) && !used.has(ty * W + tx);
  if (isFree(cx, cy)) return { x: cx, y: cy };
  for (let r = 1; r <= maxRadius; r++) {
    const candidates: Array<[number, number]> = [];
    for (let dx = -r; dx <= r; dx++) { candidates.push([cx + dx, cy - r], [cx + dx, cy + r]); }
    for (let dy = -r + 1; dy < r; dy++) { candidates.push([cx - r, cy + dy], [cx + r, cy + dy]); }
    candidates.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    for (const [tx, ty] of candidates) if (isFree(tx, ty)) return { x: tx, y: ty };
  }
  return null;
}

export interface ResolvedFarlandsSite extends FarlandsSite { x: number; y: number }
export function resolveFarlandsSites(world: World): ResolvedFarlandsSite[] {
  const used = new Set<number>();
  return FARLANDS_SITES.map((site) => {
    const tile = findNearbyWalkableTile(world, site.target.x, site.target.y, used);
    if (!tile) throw new Error(`No walkable tile found near Farlands site ${site.id}`);
    used.add(tile.y * W + tile.x);
    return { ...site, x: tile.x, y: tile.y };
  });
}

/** Cada site possui um ID de interação estável: farland:<id>. */
export function farlandsInteractionId(siteId: string): string { return `farland:${siteId}`; }
export function generateFarlandsWorld(): World { return generateWorld(FARLANDS_SEED); }

export function isFarlandsRewardValid(site: FarlandsSite): boolean { return Object.hasOwn(ITEMS, site.reward); }
void BIOME_LIST;
void H;
