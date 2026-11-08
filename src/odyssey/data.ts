import { FOES, FOE_KINDS, foesIn, type FoeKind } from "./foes";
import { FRONTIER, type FrontierBiome } from './frontier';
import { SENHOR_BOSSES } from './senhores';
import { STORY_BOSSES, STORY_NPCS, STORY_QUESTS, STORY_ITEMS, STORY_RECIPES } from './story';
import { SIDE_NPCS, SIDE_QUESTS } from './sidequests';
export type Slot = "weapon" | "armor" | "ring" | "amulet";
export type WeaponKind = "sword" | "spear" | "bow" | "staff";
export type ItemType = Slot | "potion" | "material";

export interface Stats { str: number; dex: number; vit: number; int: number; wis: number }

export interface ItemDef {
  id: string;
  name: string;
  type: ItemType;
  desc: string;
  color: string;
  atk?: number;
  def?: number;
  weapon?: WeaponKind;
  bonus?: Partial<Stats> & { hp?: number; mp?: number };
  heal?: number;
  mana?: number;
  price: number;
  /** Folha de arma do primeiro jogo (player/weapon/<sprite>, ícone items/<sprite>). */
  sprite?: string;
}

const I = (d: ItemDef) => d;
export const ITEMS: Record<string, ItemDef> = Object.fromEntries(
  [
    I({ id: "wood_sword", name: "Espada de Madeira", type: "weapon", weapon: "sword", atk: 3, desc: "Uma espada de treino.", color: "#b08850", price: 10 }),
    I({ id: "mana_sword", name: "Espada de Mana", type: "weapon", weapon: "sword", atk: 16, bonus: { int: 3 }, desc: "Lâmina que pulsa com mana.", color: "#7ef0ff", price: 400 }),
    I({ id: "iron_spear", name: "Lança de Ferro", type: "weapon", weapon: "spear", atk: 9, desc: "Longo alcance, golpe perfurante.", color: "#c0c8d0", price: 120 }),
    I({ id: "crystal_spear", name: "Lança de Cristal", type: "weapon", weapon: "spear", atk: 20, desc: "Cristal de mana afiadíssimo.", color: "#c78bff", price: 600 }),
    I({ id: "short_bow", name: "Arco Curto", type: "weapon", weapon: "bow", atk: 5, desc: "Dispara flechas (DES).", color: "#a0703a", price: 60 }),
    I({ id: "elven_bow", name: "Arco Élfico", type: "weapon", weapon: "bow", atk: 15, bonus: { dex: 3 }, desc: "Feito com madeira ancestral.", color: "#6fe08a", price: 450 }),
    I({ id: "oak_staff", name: "Cajado de Carvalho", type: "weapon", weapon: "staff", atk: 4, desc: "Dispara orbes mágicos (INT).", color: "#8a6a3a", price: 50 }),
    I({ id: "elemental_staff", name: "Cajado Elemental", type: "weapon", weapon: "staff", atk: 17, bonus: { int: 4, mp: 20 }, desc: "Canaliza os 5 espíritos.", color: "#ff7ae0", price: 650 }),
    I({ id: "cloth", name: "Túnica de Pano", type: "armor", def: 1, desc: "Roupa simples de aldeão.", color: "#4a7bd0", price: 10 }),
    I({ id: "leather", name: "Armadura de Couro", type: "armor", def: 4, desc: "Leve e resistente.", color: "#8a5a30", price: 80 }),
    I({ id: "iron_armor", name: "Armadura de Ferro", type: "armor", def: 9, desc: "Forjada por Brunhild.", color: "#9aa4b0", price: 250 }),
    I({ id: "frost_mail", name: "Cota Glacial", type: "armor", def: 15, bonus: { vit: 3 }, desc: "Fria ao toque, quente por dentro.", color: "#a8e0ff", price: 500 }),
    I({ id: "crystal_plate", name: "Placa de Cristal", type: "armor", def: 22, bonus: { vit: 5, wis: 3 }, desc: "Brilha suavemente no escuro.", color: "#d49cff", price: 900 }),
    I({ id: "copper_ring", name: "Anel de Cobre", type: "ring", bonus: { str: 2 }, desc: "+2 Força", color: "#d08040", price: 60 }),
    I({ id: "mana_ring", name: "Anel de Mana", type: "ring", bonus: { int: 4, mp: 20 }, desc: "+4 Int, +20 MP", color: "#60c0ff", price: 300 }),
    I({ id: "wolf_ring", name: "Anel do Lobo", type: "ring", bonus: { dex: 4, str: 2 }, desc: "+4 Des, +2 For", color: "#e0e0f0", price: 280 }),
    I({ id: "herb_amulet", name: "Amuleto de Ervas", type: "amulet", bonus: { wis: 3, hp: 20 }, desc: "+3 Sab, +20 HP", color: "#60d060", price: 120 }),
    I({ id: "sun_amulet", name: "Amuleto Solar", type: "amulet", bonus: { vit: 5, str: 3, hp: 50 }, desc: "Relíquia do deserto.", color: "#ffd040", price: 700 }),
    I({ id: "potion", name: "Poção", type: "potion", heal: 40, desc: "Recupera 40 HP.", color: "#ff5060", price: 15 }),
    I({ id: "hi_potion", name: "Poção Maior", type: "potion", heal: 120, desc: "Recupera 120 HP.", color: "#ff2090", price: 50 }),
    I({ id: "ether", name: "Éter", type: "potion", mana: 30, desc: "Recupera 30 MP.", color: "#4090ff", price: 30 }),
    I({ id: "elixir", name: "Elixir", type: "potion", heal: 9999, mana: 9999, desc: "Restaura tudo.", color: "#ffe060", price: 200 }),
    I({ id: "herb", name: "Erva Medicinal", type: "material", desc: "Usada em poções.", color: "#50c050", price: 3 }),
    I({ id: "frost_herb", name: "Erva Gélida", type: "material", desc: "Cresce na neve.", color: "#a0f0ff", price: 8 }),
    I({ id: "desert_rose", name: "Rosa do Deserto", type: "material", desc: "Flor rara do oásis.", color: "#ff80a0", price: 8 }),
    I({ id: "wood", name: "Madeira Ancestral", type: "material", desc: "Madeira dos espíritos.", color: "#9a6a3a", price: 4 }),
    I({ id: "iron_ore", name: "Minério de Ferro", type: "material", desc: "Para forjar.", color: "#9090a0", price: 6 }),
    I({ id: "crystal_ore", name: "Cristal de Mana", type: "material", desc: "Cristal cheio de energia.", color: "#c080ff", price: 15 }),
    I({ id: "mana_shard", name: "Fragmento de Mana", type: "material", desc: "Essência pura de mana.", color: "#60f0ff", price: 12 }),
    I({ id: "goo", name: "Esporo", type: "material", desc: "Restos de cogumelo.", color: "#e0a060", price: 2 }),
    I({ id: "wolf_pelt", name: "Pele de Lobo", type: "material", desc: "Grossa e quente.", color: "#e8e8f0", price: 10 }),
    I({ id: "chitin", name: "Quitina de Escorpião", type: "material", desc: "Casca dura.", color: "#5a3a6a", price: 10 }),
  ].map((d) => [d.id, d]),
);

export interface Recipe { out: string; qty: number; station: "smith" | "alchemist" | "carpenter"; cost: Record<string, number>; gold: number }
export const RECIPES: Recipe[] = [
  { out: "potion", qty: 2, station: "alchemist", cost: { herb: 2 }, gold: 0 },
  { out: "hi_potion", qty: 1, station: "alchemist", cost: { herb: 2, desert_rose: 1 }, gold: 10 },
  { out: "ether", qty: 1, station: "alchemist", cost: { mana_shard: 1, herb: 1 }, gold: 0 },
  { out: "elixir", qty: 1, station: "alchemist", cost: { frost_herb: 2, desert_rose: 2, mana_shard: 2 }, gold: 50 },
  { out: "herb_amulet", qty: 1, station: "alchemist", cost: { herb: 5, goo: 3 }, gold: 30 },
  { out: "mana_ring", qty: 1, station: "alchemist", cost: { mana_shard: 4, crystal_ore: 1 }, gold: 80 },
  { out: "iron_spear", qty: 1, station: "smith", cost: { iron_ore: 4, wood: 2 }, gold: 30 },
  { out: "short_bow", qty: 1, station: "smith", cost: { wood: 4 }, gold: 10 },
  { out: "oak_staff", qty: 1, station: "smith", cost: { wood: 3, mana_shard: 1 }, gold: 10 },
  { out: "leather", qty: 1, station: "smith", cost: { goo: 3, wolf_pelt: 1 }, gold: 20 },
  { out: "iron_armor", qty: 1, station: "smith", cost: { iron_ore: 6, chitin: 2 }, gold: 80 },
  { out: "wolf_ring", qty: 1, station: "smith", cost: { wolf_pelt: 4, iron_ore: 2 }, gold: 60 },
  { out: "frost_mail", qty: 1, station: "smith", cost: { iron_ore: 6, wolf_pelt: 4, frost_herb: 3 }, gold: 150 },
  { out: "elven_bow", qty: 1, station: "smith", cost: { wood: 8, mana_shard: 3 }, gold: 120 },
  { out: "mana_sword", qty: 1, station: "smith", cost: { iron_ore: 5, mana_shard: 5, crystal_ore: 2 }, gold: 200 },
  { out: "crystal_spear", qty: 1, station: "smith", cost: { crystal_ore: 6, wood: 3 }, gold: 250 },
  { out: "elemental_staff", qty: 1, station: "smith", cost: { crystal_ore: 4, mana_shard: 6, wood: 4 }, gold: 250 },
  { out: "crystal_plate", qty: 1, station: "smith", cost: { crystal_ore: 8, iron_ore: 6, chitin: 3 }, gold: 400 },
];

export const SHOP = ["potion", "hi_potion", "ether", "leather", "short_bow", "oak_staff", "copper_ring"];

export type SpiritId = "salamando" | "undine" | "sylph" | "lumina" | "dryad";
export interface SpiritDef { id: SpiritId; name: string; elem: string; spell: string; mp: number; cd: number; color: string; desc: string }
export const SPIRITS: SpiritDef[] = [
  { id: "salamando", name: "Salamando", elem: "Fogo", spell: "Bola de Fogo", mp: 8, cd: 0.6, color: "#ff6a20", desc: "Projétil que explode em área." },
  { id: "undine", name: "Undine", elem: "Água/Gelo", spell: "Estilhaços de Gelo", mp: 10, cd: 0.8, color: "#60c8ff", desc: "3 estilhaços que congelam." },
  { id: "sylph", name: "Sylph", elem: "Vento", spell: "Tufão", mp: 12, cd: 1.2, color: "#b0ffb0", desc: "Repele e fere todos ao redor." },
  { id: "lumina", name: "Lumina", elem: "Luz", spell: "Explosão Sagrada", mp: 18, cd: 2, color: "#fff4a0", desc: "Grande dano, triplo contra sombras." },
  { id: "dryad", name: "Dryad", elem: "Cura", spell: "Bênção da Floresta", mp: 14, cd: 1.5, color: "#70ff90", desc: "Restaura HP com base em SAB." },
];

export type EnemyKind = "mushroom" | "goblin" | "sporeling" | "scorpion" | "golem" | "wolf" | "shade"
  | "slime" | "rat" | "bat" | "spider" | "skeleton" | "crow" | "frog" | "crab" | "boar" | "pixie" | "wisp"
  | "treant" | "mummy" | "gargoyle" | "serpent" | "beetle" | "jelly" | "imp" | "salamander" | "sprite" | "wraith" | "mimic" | FoeKind;
export interface EnemyDef { kind: EnemyKind; name: string; hp: number; atk: number; def: number; speed: number; xp: number; gold: number; ranged?: boolean; drops: [string, number][]; size: number }
export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  mushroom: { kind: "mushroom", name: "Cogumelo", hp: 22, atk: 5, def: 0, speed: 22, xp: 8, gold: 3, drops: [["goo", 0.6], ["herb", 0.2], ["potion", 0.08]], size: 7 },
  goblin: { kind: "goblin", name: "Goblin", hp: 40, atk: 8, def: 1, speed: 38, xp: 15, gold: 6, drops: [["iron_ore", 0.25], ["potion", 0.12], ["copper_ring", 0.02]], size: 7 },
  sporeling: { kind: "sporeling", name: "Esporito", hp: 45, atk: 10, def: 2, speed: 20, xp: 22, gold: 7, ranged: true, drops: [["goo", 0.5], ["wood", 0.4], ["herb", 0.3]], size: 7 },
  scorpion: { kind: "scorpion", name: "Escorpião Sombrio", hp: 80, atk: 15, def: 4, speed: 48, xp: 34, gold: 12, drops: [["chitin", 0.6], ["desert_rose", 0.15], ["hi_potion", 0.08]], size: 8 },
  golem: { kind: "golem", name: "Golem de Pedra", hp: 170, atk: 22, def: 8, speed: 16, xp: 60, gold: 22, drops: [["iron_ore", 0.7], ["crystal_ore", 0.3], ["mana_shard", 0.3]], size: 10 },
  wolf: { kind: "wolf", name: "Lobo da Neve", hp: 110, atk: 19, def: 5, speed: 60, xp: 48, gold: 16, drops: [["wolf_pelt", 0.6], ["frost_herb", 0.2], ["hi_potion", 0.1]], size: 8 },
  shade: { kind: "shade", name: "Espírito Sombrio", hp: 120, atk: 24, def: 4, speed: 34, xp: 65, gold: 25, ranged: true, drops: [["mana_shard", 0.6], ["ether", 0.2], ["crystal_ore", 0.2]], size: 8 },
  slime: { kind: "slime", name: "Gosma Verde", hp: 18, atk: 4, def: 0, speed: 14, xp: 7, gold: 2, drops: [["goo", 0.7], ["herb", 0.15], ["potion", 0.05]], size: 6 },
  rat: { kind: "rat", name: "Rato Gigante", hp: 26, atk: 6, def: 0, speed: 52, xp: 10, gold: 4, drops: [["goo", 0.3], ["herb", 0.25], ["potion", 0.06]], size: 6 },
  bat: { kind: "bat", name: "Morcego Cego", hp: 34, atk: 9, def: 1, speed: 64, xp: 18, gold: 6, drops: [["goo", 0.3], ["ether", 0.1], ["mana_shard", 0.08]], size: 6 },
  spider: { kind: "spider", name: "Aranha Tecelã", hp: 48, atk: 11, def: 2, speed: 44, xp: 24, gold: 8, drops: [["wood", 0.3], ["goo", 0.4], ["potion", 0.08]], size: 7 },
  skeleton: { kind: "skeleton", name: "Esqueleto Antigo", hp: 95, atk: 18, def: 5, speed: 30, xp: 44, gold: 15, drops: [["stone", 0.4], ["iron_ore", 0.3], ["hi_potion", 0.08]], size: 8 },
  crow: { kind: "crow", name: "Corvo Mensageiro", hp: 40, atk: 10, def: 1, speed: 70, xp: 20, gold: 9, drops: [["herb", 0.3], ["wood", 0.2], ["copper_ring", 0.02]], size: 6 },
  frog: { kind: "frog", name: "Sapo Venenoso", hp: 55, atk: 13, def: 2, speed: 36, xp: 26, gold: 9, drops: [["goo", 0.5], ["herb", 0.35], ["ether", 0.1]], size: 6 },
  crab: { kind: "crab", name: "Caranguejo de Coral", hp: 70, atk: 14, def: 6, speed: 26, xp: 30, gold: 11, drops: [["copper_ore", 0.4], ["desert_rose", 0.15], ["hi_potion", 0.07]], size: 7 },
  boar: { kind: "boar", name: "Javali Bravo", hp: 85, atk: 16, def: 3, speed: 56, xp: 36, gold: 12, drops: [["wolf_pelt", 0.3], ["herb", 0.3], ["potion", 0.1]], size: 8 },
  pixie: { kind: "pixie", name: "Fada Travessa", hp: 42, atk: 12, def: 1, speed: 58, xp: 28, gold: 14, ranged: true, drops: [["mana_shard", 0.4], ["herb", 0.3], ["ether", 0.15]], size: 6 },
  wisp: { kind: "wisp", name: "Fogo-Fátuo", hp: 60, atk: 15, def: 2, speed: 40, xp: 34, gold: 13, ranged: true, drops: [["mana_shard", 0.5], ["goo", 0.3], ["ether", 0.15]], size: 6 },
  treant: { kind: "treant", name: "Arvorido Jovem", hp: 150, atk: 20, def: 7, speed: 18, xp: 55, gold: 20, drops: [["wood", 0.8], ["herb", 0.4], ["herb_amulet", 0.03]], size: 10 },
  mummy: { kind: "mummy", name: "Múmia do Deserto", hp: 130, atk: 21, def: 6, speed: 20, xp: 52, gold: 19, drops: [["desert_rose", 0.3], ["chitin", 0.3], ["sun_amulet", 0.02]], size: 8 },
  gargoyle: { kind: "gargoyle", name: "Gárgula de Vigia", hp: 160, atk: 24, def: 9, speed: 24, xp: 62, gold: 24, drops: [["stone", 0.6], ["iron_ore", 0.4], ["crystal_ore", 0.15]], size: 9 },
  serpent: { kind: "serpent", name: "Serpente das Areias", hp: 90, atk: 17, def: 3, speed: 50, xp: 40, gold: 14, drops: [["desert_rose", 0.25], ["chitin", 0.3], ["hi_potion", 0.08]], size: 8 },
  beetle: { kind: "beetle", name: "Besouro de Quitina", hp: 110, atk: 18, def: 10, speed: 22, xp: 42, gold: 15, drops: [["chitin", 0.7], ["coal", 0.3], ["iron_ore", 0.25]], size: 7 },
  jelly: { kind: "jelly", name: "Medusa de Mana", hp: 65, atk: 16, def: 2, speed: 24, xp: 32, gold: 12, ranged: true, drops: [["mana_shard", 0.45], ["goo", 0.4], ["ether", 0.12]], size: 7 },
  imp: { kind: "imp", name: "Diabrete das Fendas", hp: 75, atk: 19, def: 3, speed: 54, xp: 44, gold: 18, ranged: true, drops: [["coal", 0.5], ["mana_shard", 0.25], ["hi_potion", 0.08]], size: 7 },
  salamander: { kind: "salamander", name: "Salamandra de Brasa", hp: 140, atk: 23, def: 5, speed: 38, xp: 58, gold: 21, drops: [["coal", 0.6], ["iron_ore", 0.3], ["elixir", 0.02]], size: 8 },
  sprite: { kind: "sprite", name: "Duende do Gelo", hp: 100, atk: 20, def: 4, speed: 46, xp: 50, gold: 17, ranged: true, drops: [["frost_herb", 0.5], ["mana_shard", 0.3], ["ether", 0.15]], size: 7 },
  wraith: { kind: "wraith", name: "Aparição Lamuriante", hp: 150, atk: 27, def: 5, speed: 36, xp: 72, gold: 28, ranged: true, drops: [["mana_shard", 0.6], ["crystal_ore", 0.25], ["elixir", 0.03]], size: 8 },
  mimic: { kind: "mimic", name: "Baú Falso", hp: 180, atk: 26, def: 8, speed: 10, xp: 80, gold: 60, drops: [["crystal_ore", 0.4], ["hi_potion", 0.3], ["elixir", 0.05]], size: 8 },
  ...(Object.fromEntries(FOE_KINDS.map((k) => { const f = FOES[k]; return [k, { kind: k, name: f.name, hp: f.hp, atk: f.atk, def: f.def, speed: f.speed, xp: f.xp, gold: f.gold, ranged: f.ranged, drops: f.drops, size: f.size }]; })) as Record<FoeKind, EnemyDef>),
};

export type Biome = FrontierBiome | "plains" | "forest" | "desert" | "cave" | "mountain" | "autumn" | "swamp" | "coast" | "jungle" | "volcanic" | "mushroom" | "meadow" | "ruins";
export const BIOME_NAMES: Record<Biome, string> = {
  ...Object.fromEntries(Object.entries(FRONTIER).map(([id,d])=>[id,d.name])) as Record<FrontierBiome,string>,
  autumn: "Bosque de Âmbar", swamp: "Pântano dos Vagalumes", coast: "Costa de Candor", jungle: "Selva de Argaes", volcanic: "Caldeira de Kaore", mushroom: "Bosque dos Cogumelos", meadow: "Pradaria de Aethyra", ruins: "Ruínas de Artis",
  plains: "Planícies de Potos",
  forest: "Floresta Ancestral dos Espíritos",
  desert: "Deserto das Areias Místicas",
  cave: "Cavernas de Cristais de Mana",
  mountain: "Picos da Montanha Sagrada",
};
const BASE_BIOME_ENEMIES: Record<Biome, EnemyKind[]> = {
  ...Object.fromEntries(Object.entries(FRONTIER).map(([id,d])=>[id,[...d.enemies]])) as Record<FrontierBiome,EnemyKind[]>,
  autumn: ["goblin", "wolf", "crow", "boar"], swamp: ["sporeling", "shade", "frog", "wisp", "jelly"], coast: ["scorpion", "goblin", "crab", "serpent", "jelly"], jungle: ["sporeling", "goblin", "treant", "frog", "spider"], volcanic: ["golem", "shade", "imp", "salamander", "beetle"], mushroom: ["mushroom", "sporeling", "pixie", "slime"], meadow: ["mushroom", "goblin", "slime", "boar"], ruins: ["golem", "shade", "skeleton", "gargoyle", "wraith", "mimic"],
  plains: ["mushroom", "mushroom", "goblin", "slime", "rat"],
  forest: ["goblin", "sporeling", "sporeling", "spider", "treant", "boar", "pixie"],
  desert: ["scorpion", "scorpion", "golem", "serpent", "mummy", "beetle"],
  cave: ["golem", "shade", "shade", "bat", "mimic", "wraith"],
  mountain: ["wolf", "wolf", "golem", "sprite", "gargoyle"],
};
/** Criaturas de cada bioma: as originais mais as novas (foes.ts), sem remover nenhuma. */
export const BIOME_ENEMIES: Record<Biome, EnemyKind[]> = Object.fromEntries(
  (Object.entries(BASE_BIOME_ENEMIES) as [Biome, EnemyKind[]][]).map(([b, list]) => [b, [...list, ...foesIn(b)]]),
) as Record<Biome, EnemyKind[]>;

export interface BossDef { id: string; name: string; biome: Biome; tx: number; ty: number; hp: number; atk: number; xp: number; gold: number; color: string; minion: EnemyKind; reward: string[]; spirit?: SpiritId }
export const BOSSES: BossDef[] = [
  { id: "king_mush", name: "Rei Cogumelo Fungor", biome: "plains", tx: 150, ty: 142, hp: 400, atk: 12, xp: 150, gold: 80, color: "#e04040", minion: "mushroom", reward: ["leather", "hi_potion"] },
  { id: "ent", name: "Ent Ancestral Morvak", biome: "forest", tx: 22, ty: 98, hp: 900, atk: 20, xp: 400, gold: 200, color: "#4a8a3a", minion: "sporeling", reward: ["elven_bow"], spirit: "sylph" },
  { id: "sahr", name: "Sahr, Escorpião-Rei", biome: "desert", tx: 216, ty: 142, hp: 1500, atk: 28, xp: 800, gold: 350, color: "#8a4aa0", minion: "scorpion", reward: ["sun_amulet"] },
  { id: "fenrir", name: "Fenrir Glacial", biome: "mountain", tx: 112, ty: 14, hp: 2200, atk: 34, xp: 1300, gold: 500, color: "#c0e8ff", minion: "wolf", reward: ["frost_mail"], spirit: "undine" },
  { id: "crystal_golem", name: "Colosso de Cristal", biome: "cave", tx: 218, ty: 22, hp: 3200, atk: 42, xp: 2200, gold: 900, color: "#c080ff", minion: "shade", reward: ["crystal_plate", "elixir"], spirit: "lumina" },
];

export interface Statue { id: string; name: string; tx: number; ty: number }
export const STATUES: Statue[] = [
  { id: "village", name: "Vila de Potos", tx: 124, ty: 126 },
  { id: "forest", name: "Clareira dos Espíritos", tx: 46, ty: 108 },
  { id: "desert", name: "Oásis de Kalim", tx: 196, ty: 122 },
  { id: "mountain", name: "Santuário Nevado", tx: 118, ty: 36 },
  { id: "cave", name: "Entrada das Cavernas", tx: 184, ty: 58 },
];

export type QuestGoal =
  | { kind: "kill"; target: EnemyKind; n: number }
  | { kind: "boss"; target: string }
  | { kind: "collect"; item: string; n: number }
  /** Levar um recado: falar com outro morador. */
  | { kind: "talk"; npc: string; line: string }
  /** Alcançar um andar do Abismo do Cântico. */
  | { kind: "floor"; n: number }
  /** Alcançar um andar em uma mina específica de bioma. */
  | { kind: "mine"; biome: Biome; floor: number };
export interface QuestDef { id: string; title: string; main: boolean; giver: string; desc: string; goal: QuestGoal; requires?: string; /** Todas estas missões precisam estar concluídas. */ requiresAll?: string[]; /** Ato da Crônica (2–5) a que a missão pertence. */ act?: number; /** Falas do NPC antes de oferecer a missão. */ intro?: string[]; /** Fala do NPC ao entregar. */ outro?: string; reward: { xp: number; gold: number; items?: string[] } }
export const QUESTS: QuestDef[] = [
  { id: "m1", title: "O Despertar da Mana", main: true, giver: "elder", desc: "Cogumelos infestaram as planícies. Derrote 5 Cogumelos.", goal: { kind: "kill", target: "mushroom", n: 5 }, reward: { xp: 40, gold: 30, items: ["potion", "potion"] } },
  { id: "m2", title: "A Coroa de Esporos", main: true, giver: "elder", requires: "m1", desc: "Derrote o Rei Cogumelo Fungor a sudeste da vila.", goal: { kind: "boss", target: "king_mush" }, reward: { xp: 100, gold: 80 } },
  { id: "m3", title: "Raízes Corrompidas", main: true, giver: "elder", requires: "m2", desc: "Vá à Floresta Ancestral (oeste) e purifique o Ent Morvak.", goal: { kind: "boss", target: "ent" }, reward: { xp: 250, gold: 150 } },
  { id: "m4", title: "O Ferrão das Areias", main: true, giver: "elder", requires: "m3", desc: "No deserto do leste, derrote Sahr, o Escorpião-Rei.", goal: { kind: "boss", target: "sahr" }, reward: { xp: 500, gold: 250 } },
  { id: "m5", title: "O Uivo Gelado", main: true, giver: "elder", requires: "m4", desc: "Suba os Picos Sagrados ao norte e enfrente Fenrir.", goal: { kind: "boss", target: "fenrir" }, reward: { xp: 800, gold: 400 } },
  { id: "m6", title: "O Coração de Mana", main: true, giver: "elder", requires: "m5", desc: "Nas Cavernas de Cristal (nordeste), detenha o Colosso.", goal: { kind: "boss", target: "crystal_golem" }, reward: { xp: 2000, gold: 1000, items: ["elixir"] } },
  { id: "s1", title: "Ervas para Lira", main: false, giver: "alchemist", desc: "Traga 5 Ervas Medicinais para a alquimista.", goal: { kind: "collect", item: "herb", n: 5 }, reward: { xp: 30, gold: 20, items: ["ether", "ether"] } },
  { id: "s2", title: "Ferro para a Forja", main: false, giver: "smith", desc: "Traga 6 Minérios de Ferro para Brunhild.", goal: { kind: "collect", item: "iron_ore", n: 6 }, reward: { xp: 60, gold: 40, items: ["iron_spear"] } },
  { id: "s3", title: "Patrulha Goblin", main: false, giver: "guard", desc: "Elimine 8 Goblins perto da vila e da floresta.", goal: { kind: "kill", target: "goblin", n: 8 }, reward: { xp: 90, gold: 60, items: ["copper_ring"] } },
  { id: "s4", title: "Esporos Malignos", main: false, giver: "ranger", desc: "Derrote 6 Esporitos na floresta.", goal: { kind: "kill", target: "sporeling", n: 6 }, reward: { xp: 140, gold: 70, items: ["hi_potion"] } },
  { id: "s5", title: "Carapaças do Deserto", main: false, giver: "nomad", desc: "Traga 5 Quitinas de Escorpião.", goal: { kind: "collect", item: "chitin", n: 5 }, reward: { xp: 260, gold: 150, items: ["hi_potion", "hi_potion"] } },
  { id: "s6", title: "Peles para o Inverno", main: false, giver: "hermit", desc: "Traga 5 Peles de Lobo ao eremita.", goal: { kind: "collect", item: "wolf_pelt", n: 5 }, reward: { xp: 400, gold: 200, items: ["wolf_ring"] } },
  { id: "s7", title: "Sombras na Escuridão", main: false, giver: "hermit", requires: "s6", desc: "Destrua 6 Espíritos Sombrios nas cavernas.", goal: { kind: "kill", target: "shade", n: 6 }, reward: { xp: 700, gold: 300, items: ["elixir"] } },
  { id: "city_lumen_petals", title: "Pétalas para o arquivo", main: false, giver: "lumen_keeper", desc: "Leve 3 Flores da Lua ao arquivo de Lúmen-Pétala.", goal: { kind: "collect", item: "moonflower", n: 3 }, intro: ["Mira: — O vento levou as pétalas que marcavam o livro de fundação."], outro: "As páginas voltam a florescer. Toda lembrança merece um lugar.", reward: { xp: 180, gold: 120, items: ["mana_shard"] } },
  { id: "city_prism_hum", title: "A nota do prisma", main: false, giver: "prism_keeper", desc: "Traga 3 Cristais de Mana para afinar o sino da cidade.", goal: { kind: "collect", item: "crystal_ore", n: 3 }, intro: ["Orin: — O sino perdeu sua nota fundamental. O cristal certo ainda pode recuperá-la."], outro: "O cristal canta. As janelas se acendem, uma por uma.", reward: { xp: 260, gold: 190, items: ["ether"] } },
  { id: "city_tide_bells", title: "Sinos que voltam", main: false, giver: "tide_keeper", desc: "Reúna 4 Quitinas para reforçar as boias do porto.", goal: { kind: "collect", item: "chitin", n: 4 }, intro: ["Tala: — A maré virou. As boias precisam aguentar a próxima canção submarina."], outro: "O porto está seguro; os sinos podem soar sem medo.", reward: { xp: 320, gold: 220, items: ["hi_potion"] } },
  { id: "city_zephyr_bridge", title: "Pontes para a caravana", main: false, giver: "zephyr_keeper", desc: "Entregue 8 Madeiras para reparar a ponte do vento.", goal: { kind: "collect", item: "wood", n: 8 }, intro: ["Vico: — Uma caravana está a caminho. Sem a ponte, ela vai perder a estação inteira."], outro: "A ponte responde ao vento com uma nota clara. A caravana já consegue atravessar.", reward: { xp: 300, gold: 200, items: ["moon_seed"] } },
  { id: "city_amber_lens", title: "A lente do meio-dia", main: false, giver: "amber_keeper", desc: "Traga 4 Rosas do Deserto para polir a lente do observatório.", goal: { kind: "collect", item: "desert_rose", n: 4 }, intro: ["Senna: — A lente está opaca; sem ela, as trilhas seguras desaparecem ao sol."], outro: "A lente revela uma estrada dourada que sempre esteve diante de nós.", reward: { xp: 390, gold: 270, items: ["elixir"] } },
  { id: "city_storm_drums", title: "Tambores da tempestade", main: false, giver: "storm_keeper", desc: "Reúna 5 Minérios de Ferro para as novas cordas dos tambores.", goal: { kind: "collect", item: "iron_ore", n: 5 }, intro: ["Rumo: — Um tambor rachado confunde os sinais de tempestade e põe a cidade em risco."], outro: "O ritmo certo retorna à muralha. A próxima tempestade será anunciada a tempo.", reward: { xp: 440, gold: 310, items: ["iron_ingot"] } },
  { id: "city_mycelium_glow", title: "Recados luminosos", main: false, giver: "mycelium_keeper", desc: "Traga 6 Ervas Medicinais para replantar os cogumelos mensageiros.", goal: { kind: "collect", item: "herb", n: 6 }, intro: ["Nara: — Os mensageiros miceliais estão perdendo o brilho. Precisamos preparar o solo."], outro: "As luzes percorrem as casas; a cidade inteira recebe a notícia.", reward: { xp: 360, gold: 240, items: ["frost_herb"] } },
  { id: "city_marble_memory", title: "Memória em pedra", main: false, giver: "marble_keeper", desc: "Leve 10 Pedras ao ateliê para completar a escultura vazia da praça.", goal: { kind: "collect", item: "stone", n: 10 }, intro: ["Iven: — A escultura só termina quando cada pessoa deixa uma pedra com uma lembrança."], outro: "O espaço vazio ganha forma sem apagar ninguém que ajudou.", reward: { xp: 500, gold: 350, items: ["crystal_ore", "crystal_ore"] } },
  { id: "city_lumen_2", title: "Vigias da clareira", main: false, giver: "lumen_keeper", requires: "city_lumen_petals", desc: "Derrote 8 Fadas para proteger os mensageiros da avenida.", goal: { kind: "kill", target: "pixie", n: 8 }, reward: { xp: 360, gold: 220, items: ["mana_shard"] } },
  { id: "city_lumen_3", title: "A biblioteca sob as raízes", main: false, giver: "lumen_keeper", requires: "city_lumen_2", desc: "Reúna 5 Cristais de Mana para revelar o mapa antigo do arquivo.", goal: { kind: "collect", item: "crystal_ore", n: 5 }, reward: { xp: 720, gold: 460, items: ["elixir"] } },
  { id: "city_prism_2", title: "Guardião das facetas", main: false, giver: "prism_keeper", requires: "city_prism_hum", desc: "Derrote 10 Golens e recupere as notas que eles engoliram.", goal: { kind: "kill", target: "golem", n: 10 }, reward: { xp: 520, gold: 340, items: ["crystal_ore"] } },
  { id: "city_prism_3", title: "O acorde completo", main: false, giver: "prism_keeper", requires: "city_prism_2", desc: "Entregue 8 Fragmentos de Mana para o acorde final do sino.", goal: { kind: "collect", item: "mana_shard", n: 8 }, reward: { xp: 850, gold: 520, items: ["ether", "ether"] } },
  { id: "city_tide_2", title: "Predadores da enseada", main: false, giver: "tide_keeper", requires: "city_tide_bells", desc: "Afaste 10 Águas-Vivas da rota dos barcos.", goal: { kind: "kill", target: "jelly", n: 10 }, reward: { xp: 480, gold: 320, items: ["hi_potion"] } },
  { id: "city_tide_3", title: "O retorno do capitão", main: false, giver: "tide_keeper", requires: "city_tide_2", desc: "Traga 8 Quitinas para reparar o casco do barco que voltou.", goal: { kind: "collect", item: "chitin", n: 8 }, reward: { xp: 820, gold: 560, items: ["ether", "hi_potion"] } },
  { id: "city_zephyr_2", title: "Trilhas em movimento", main: false, giver: "zephyr_keeper", requires: "city_zephyr_bridge", desc: "Derrote 10 Lobos que fecharam a trilha do norte.", goal: { kind: "kill", target: "wolf", n: 10 }, reward: { xp: 500, gold: 300, items: ["frost_herb"] } },
  { id: "city_zephyr_3", title: "A ponte que canta", main: false, giver: "zephyr_keeper", requires: "city_zephyr_2", desc: "Entregue 16 Madeiras para ampliar a ponte até a estação seguinte.", goal: { kind: "collect", item: "wood", n: 16 }, reward: { xp: 850, gold: 520, items: ["moon_seed", "moon_seed"] } },
  { id: "city_amber_2", title: "Escorpiões do meridiano", main: false, giver: "amber_keeper", requires: "city_amber_lens", desc: "Derrote 12 Escorpiões e proteja a rota dourada.", goal: { kind: "kill", target: "scorpion", n: 12 }, reward: { xp: 560, gold: 360, items: ["desert_rose"] } },
  { id: "city_amber_3", title: "Cartografia celeste", main: false, giver: "amber_keeper", requires: "city_amber_2", desc: "Traga 8 Rosas do Deserto para registrar a estrada no Atlas.", goal: { kind: "collect", item: "desert_rose", n: 8 }, reward: { xp: 920, gold: 620, items: ["elixir", "elixir"] } },
  { id: "city_storm_2", title: "Pedras sob o trovão", main: false, giver: "storm_keeper", requires: "city_storm_drums", desc: "Derrote 10 Golens que bloqueiam os marcos da muralha.", goal: { kind: "kill", target: "golem", n: 10 }, reward: { xp: 600, gold: 390, items: ["iron_ingot"] } },
  { id: "city_storm_3", title: "O ritmo da montanha", main: false, giver: "storm_keeper", requires: "city_storm_2", desc: "Entregue 10 Minérios de Ferro para restaurar todos os tambores.", goal: { kind: "collect", item: "iron_ore", n: 10 }, reward: { xp: 980, gold: 680, items: ["crystal_ore", "crystal_ore"] } },
  { id: "city_mycelium_2", title: "Praga de esporos", main: false, giver: "mycelium_keeper", requires: "city_mycelium_glow", desc: "Derrote 12 Esporitos antes que alcancem o micélio central.", goal: { kind: "kill", target: "sporeling", n: 12 }, reward: { xp: 540, gold: 360, items: ["frost_herb"] } },
  { id: "city_mycelium_3", title: "A rede de notícias", main: false, giver: "mycelium_keeper", requires: "city_mycelium_2", desc: "Reúna 12 Ervas Medicinais para replantar a rede de mensageiros.", goal: { kind: "collect", item: "herb", n: 12 }, reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "city_marble_2", title: "Ecos do salão vazio", main: false, giver: "marble_keeper", requires: "city_marble_memory", desc: "Derrote 12 Esqueletos que despertaram nas galerias de mármore.", goal: { kind: "kill", target: "skeleton", n: 12 }, reward: { xp: 650, gold: 420, items: ["mana_shard", "mana_shard"] } },
  { id: "city_marble_3", title: "Uma cidade para todos", main: false, giver: "marble_keeper", requires: "city_marble_2", desc: "Leve 20 Pedras ao ateliê e conclua o memorial comunitário.", goal: { kind: "collect", item: "stone", n: 20 }, reward: { xp: 1_100, gold: 750, items: ["elixir", "crystal_ore"] } },
];

export interface Palette { skin: string; hair: string; body: string; legs: string; accent?: string }
export interface NpcDef { id: string; name: string; title: string; tx: number; ty: number; pal: Palette; lines: string[]; role?: "smith" | "alchemist" | "shop"; interiorOnly?: boolean }
export const NPCS: NpcDef[] = [
  { id: "elder", name: "Ancião Gorm", title: "Guardião da Árvore de Mana", tx: 120, ty: 118, pal: { skin: "#f0c8a0", hair: "#e8e8e8", body: "#6a3a9a", legs: "#3a2050" }, lines: ["A Árvore de Mana enfraquece, jovem.", "Os Espíritos de Mana atenderão a quem provar seu valor.", "Use as estátuas de Mana para viajar rapidamente."] },
  { id: "smith", name: "Brunhild", title: "Ferreira da Vila", tx: 113, ty: 124, pal: { skin: "#e0a880", hair: "#c04020", body: "#5a4030", legs: "#302018" }, lines: ["Minério e suor, é disso que se faz uma lâmina!", "Traga materiais e eu forjo o que quiser."], role: "smith" },
  { id: "alchemist", name: "Lira", title: "Alquimista", tx: 129, ty: 124, pal: { skin: "#f8d8b8", hair: "#40a060", body: "#2a7a8a", legs: "#1a4050" }, lines: ["Ervas, fragmentos de mana... tudo vira poção!", "Cuidado com as cavernas, a escuridão lá é viva."], role: "alchemist" },
  { id: "merchant", name: "Pip", title: "Mercador", tx: 126, ty: 130, pal: { skin: "#f0c090", hair: "#603010", body: "#d0a020", legs: "#604010" }, lines: ["Os melhores preços de Potos!", "Compro qualquer coisa, também."], role: "shop" },
  { id: "guard", name: "Capitão Tor", title: "Guarda de Potos", tx: 120, ty: 133, pal: { skin: "#d8a070", hair: "#202020", body: "#8090a0", legs: "#404850" }, lines: ["Os goblins estão cada vez mais ousados.", "Siga as estradas, elas levam a todas as regiões."] },
  { id: "ranger", name: "Sylvara", title: "Guardiã da Floresta", tx: 48, ty: 111, pal: { skin: "#e8c8a0", hair: "#f0e080", body: "#2a6a2a", legs: "#1a3a1a" }, lines: ["A floresta sussurra... e está com medo.", "O Ent Morvak fica a oeste, além das raízes."] },
  { id: "nomad", name: "Kassim", title: "Nômade do Oásis", tx: 199, ty: 124, pal: { skin: "#a87048", hair: "#f0f0f0", body: "#d0b080", legs: "#806040" }, lines: ["As areias escondem ruínas de um antigo império.", "Sahr reina ao sul do oásis."], role: "shop" },
  { id: "hermit", name: "Eremita Yorn", title: "Monge da Montanha", tx: 121, ty: 38, pal: { skin: "#f0d0b0", hair: "#b0b0b0", body: "#a03030", legs: "#602020" }, lines: ["O gelo é escorregadio. Ande com cuidado.", "Ao leste, as cavernas de cristal brilham na escuridão."] },
  { id: "lumen_keeper", name: "Mira Dália", title: "Arquivista de Lúmen-Pétala", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#f1c4a2", hair: "#e987b1", body: "#a84572", legs: "#5b324b", accent: "#ffe0a8" }, lines: ["As flores guardam lembranças que a tinta não consegue prender.", "Procure as trilhas onde a luz cai em forma de pétala."] },
  { id: "prism_keeper", name: "Orin Faceta", title: "Afinador de Prisma-Viva", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#d8a57a", hair: "#75d9cb", body: "#466f8b", legs: "#253d60", accent: "#c9fbf1" }, lines: ["Cada cristal responde a uma frequência; nenhuma cor canta sozinha.", "O sino rachado ainda pode ser afinado."] },
  { id: "tide_keeper", name: "Tala Maré", title: "Guardadora do Porto", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#a97052", hair: "#5ab8d2", body: "#357e9a", legs: "#244e68", accent: "#aaf1ed" }, lines: ["O mar devolve aquilo que as pessoas estão prontas para lembrar.", "Antes da maré virar, confira as boias e os sinos."] },
  { id: "zephyr_keeper", name: "Vico Junco", title: "Mestre das Pontes", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#e5bd8a", hair: "#754f3b", body: "#77a96a", legs: "#395d42", accent: "#d8efab" }, lines: ["A ponte não range: ela está perguntando de onde você vem.", "Uma caravana espera do outro lado da corrente de ar."] },
  { id: "amber_keeper", name: "Senna Lente", title: "Astrônoma do Farol", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#e9b78d", hair: "#d9944c", body: "#b57535", legs: "#6d482d", accent: "#ffe1a0" }, lines: ["A lente vê caminhos que o mapa ainda não sabe desenhar.", "Ao meio-dia, a estrada dourada fica visível."] },
  { id: "storm_keeper", name: "Rumo Trovão", title: "Guardião dos Tambores", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#bb8b70", hair: "#384351", body: "#5c7793", legs: "#314155", accent: "#b8d9f2" }, lines: ["A tempestade sempre avisa; o segredo é ouvir a nota entre os raios.", "Um tambor rachado pode pôr toda a muralha em perigo."] },
  { id: "mycelium_keeper", name: "Nara Espora", title: "Intérprete do Micélio", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#d8ae96", hair: "#a77bc5", body: "#70628e", legs: "#423958", accent: "#d8f0a0" }, lines: ["Os fungos trocam notícias antes mesmo de a cidade acordar.", "Replante as ervas; as luzes voltarão a percorrer as casas."] },
  { id: "marble_keeper", name: "Iven Talhador", title: "Curador de Marbleira", tx: 0, ty: 0, interiorOnly: true, pal: { skin: "#c99476", hair: "#d2c9b7", body: "#8b8c88", legs: "#525350", accent: "#f0e6d2" }, lines: ["O vazio da escultura é parte da obra, não um erro.", "Cada pessoa pode acrescentar uma pedra sem apagar as outras."] },
];

// Expansion materials retain the original equipment and item catalog.
ITEMS["stone"] = { id: "stone", name: "Pedra", type: "material", desc: "Recurso do mundo de Mana.", color: "#899c9b", price: 4 };
ITEMS["copper_ore"] = { id: "copper_ore", name: "Minério de Cobre", type: "material", desc: "Recurso do mundo de Mana.", color: "#db9869", price: 4 };
ITEMS["coal"] = { id: "coal", name: "Carvão", type: "material", desc: "Recurso do mundo de Mana.", color: "#596369", price: 4 };
ITEMS["iron_ingot"] = { id: "iron_ingot", name: "Lingote de Ferro", type: "material", desc: "Recurso do mundo de Mana.", color: "#bdcbd0", price: 4 };
ITEMS["plank"] = { id: "plank", name: "Tábuas de Madeira", type: "material", desc: "Recurso do mundo de Mana.", color: "#d0ab77", price: 4 };
ITEMS["carrot_seed"] = { id: "carrot_seed", name: "Sementes de Cenoura", type: "material", desc: "Recurso do mundo de Mana.", color: "#c1aa6b", price: 4 };
ITEMS["wheat_seed"] = { id: "wheat_seed", name: "Sementes de Trigo", type: "material", desc: "Recurso do mundo de Mana.", color: "#e2c778", price: 4 };
ITEMS["moon_seed"] = { id: "moon_seed", name: "Sementes da Lua", type: "material", desc: "Recurso do mundo de Mana.", color: "#bfabdf", price: 4 };
ITEMS["carrot"] = { id: "carrot", name: "Cenoura", type: "material", desc: "Recurso do mundo de Mana.", color: "#ef9c65", price: 4 };
ITEMS["wheat"] = { id: "wheat", name: "Trigo", type: "material", desc: "Recurso do mundo de Mana.", color: "#e4c66e", price: 4 };
ITEMS["moonflower"] = { id: "moonflower", name: "Flor da Lua", type: "material", desc: "Recurso do mundo de Mana.", color: "#c6b8ed", price: 4 };
RECIPES.push({out:"iron_ingot",qty:1,station:"smith",cost:{iron_ore:2,coal:1},gold:0});
ITEMS["torch"] = { id: "torch", name: "Tocha", type: "material", desc: "Ilumina templos escuros e o Abismo. Basta tê-la na bolsa.", color: "#ff9a40", price: 40 };
SHOP.push("carrot_seed", "wheat_seed", "moon_seed", "coal");
// A Tocha fica logo no começo da lista da loja.
SHOP.splice(0, 0, "torch");

// A Crônica do Cântico Partido: 17 Ecos, Vigias, chefes, missões e equipamento de fim de jogo (ver story.ts).
for (const item of STORY_ITEMS) ITEMS[item.id] = item;

// Arsenal do primeiro jogo: as armas antigas ganham sprites próprios e chegam novas lâminas, lanças, arcos e cajados.
const LEGACY_SPRITES: Record<string, string> = {
  wood_sword: "tinsword", mana_sword: "etherialblade", iron_spear: "ironspear", crystal_spear: "cobaltspear",
  short_bow: "woodenbow", elven_bow: "bowwillowtwine", oak_staff: "naturestaff", elemental_staff: "sunshinestaff",
};
for (const [id, sprite] of Object.entries(LEGACY_SPRITES)) if (ITEMS[id]) ITEMS[id].sprite = sprite;
type ArsenalDef = Omit<ItemDef, "type" | "desc" | "price"> & { cost: Record<string, number>; gold: number };
export const ARSENAL = ([
  { id: "k_coppersword", sprite: "coppersword", name: "Espada de Cobre", weapon: "sword", atk: 6, color: "#d08850", cost: { copper_ore: 4, wood: 1 }, gold: 15 },
  { id: "k_ironsword", sprite: "ironsword", name: "Espada de Ferro", weapon: "sword", atk: 10, color: "#c0c8d0", cost: { iron_ingot: 3, wood: 1 }, gold: 40 },
  { id: "k_goldsword", sprite: "goldsword", name: "Espada Dourada", weapon: "sword", atk: 14, bonus: { wis: 1 }, color: "#f0c040", cost: { iron_ingot: 3, mana_shard: 2 }, gold: 120 },
  { id: "k_firesword", sprite: "firesword", name: "Lâmina Flamejante", weapon: "sword", atk: 22, bonus: { str: 2 }, color: "#ff6030", cost: { iron_ingot: 5, coal: 6, mana_shard: 3 }, gold: 260 },
  { id: "k_icesword", sprite: "icesword", name: "Lâmina de Gelo", weapon: "sword", atk: 22, bonus: { int: 2 }, color: "#90e0ff", cost: { iron_ingot: 5, frost_herb: 4, mana_shard: 3 }, gold: 260 },
  { id: "k_bluelightsaber", sprite: "bluelightsaber", name: "Sabre de Luz Azul", weapon: "sword", atk: 26, bonus: { dex: 3 }, color: "#60a0ff", cost: { crystal_ore: 5, mana_shard: 6 }, gold: 380 },
  { id: "k_nightsword", sprite: "nightsword", name: "Espada da Noite", weapon: "sword", atk: 30, bonus: { str: 3, dex: 1 }, color: "#5040a0", cost: { crystal_ore: 6, iron_ingot: 6, chitin: 3 }, gold: 480 },
  { id: "k_angelicblade", sprite: "angelicblade", name: "Lâmina Angelical", weapon: "sword", atk: 36, bonus: { wis: 4, hp: 30 }, color: "#fff4c0", cost: { crystal_ore: 8, mana_shard: 10, desert_rose: 4 }, gold: 700 },
  { id: "k_bladeofdarkness", sprite: "bladeofdarkness", name: "Lâmina das Trevas", weapon: "sword", atk: 42, bonus: { str: 5 }, color: "#40206a", cost: { crystal_ore: 10, iron_ingot: 10, chitin: 6 }, gold: 900 },
  { id: "k_bronzespear", sprite: "bronzespear", name: "Lança de Bronze", weapon: "spear", atk: 7, color: "#c89058", cost: { copper_ore: 4, wood: 3 }, gold: 20 },
  { id: "k_goldspear", sprite: "goldspear", name: "Lança Dourada", weapon: "spear", atk: 16, bonus: { str: 1 }, color: "#f0c040", cost: { iron_ingot: 4, mana_shard: 2, wood: 3 }, gold: 160 },
  { id: "k_timelessglaive", sprite: "timelessglaive", name: "Glaive Atemporal", weapon: "spear", atk: 32, bonus: { dex: 2, str: 2 }, color: "#a0f0d0", cost: { crystal_ore: 8, mana_shard: 8, wood: 4 }, gold: 650 },
  { id: "k_bowpine", sprite: "bowpine", name: "Arco de Pinho", weapon: "bow", atk: 8, color: "#7a5a30", cost: { wood: 6 }, gold: 20 },
  { id: "k_bowocean", sprite: "bowocean", name: "Arco do Oceano", weapon: "bow", atk: 18, bonus: { dex: 2 }, color: "#3080d0", cost: { wood: 8, mana_shard: 3, goo: 3 }, gold: 220 },
  { id: "k_bowsun", sprite: "bowsun", name: "Arco do Sol", weapon: "bow", atk: 28, bonus: { dex: 4 }, color: "#ffd040", cost: { wood: 10, crystal_ore: 5, desert_rose: 3 }, gold: 520 },
  { id: "k_firestaff", sprite: "firestaff", name: "Cajado de Fogo", weapon: "staff", atk: 12, bonus: { int: 2 }, color: "#ff7040", cost: { wood: 4, coal: 4, mana_shard: 2 }, gold: 90 },
  { id: "k_lightningstaff", sprite: "lightningstaff", name: "Cajado do Trovão", weapon: "staff", atk: 21, bonus: { int: 3, mp: 15 }, color: "#f0f060", cost: { wood: 5, crystal_ore: 3, mana_shard: 4 }, gold: 300 },
  { id: "k_bloodmoonstaff", sprite: "bloodmoonstaff", name: "Cajado da Lua de Sangue", weapon: "staff", atk: 33, bonus: { int: 5, mp: 30 }, color: "#c02040", cost: { crystal_ore: 8, mana_shard: 10, moonflower: 3 }, gold: 720 },
] as ArsenalDef[]).map((w) => ({ ...w, type: "weapon" as const, desc: `Arma forjada à moda antiga · ATQ ${w.atk ?? 0}.`, price: Math.round(w.gold * 1.4 + (w.atk ?? 0) * 6) }));
for (const w of ARSENAL) {
  const { cost, gold, ...item } = w; ITEMS[w.id] = item;
  RECIPES.push({ out: w.id, qty: 1, station: "smith", cost, gold });
}
// Petiscos para o sistema de pets (ver pets.ts): vendidos no mercado e feitos na alquimia.
ITEMS["pet_treat"] = { id: "pet_treat", name: "Petisco de Mana", type: "material", desc: "Comida favorita dos pets: +fome, +laço.", color: "#f0a0c0", price: 12 };
ITEMS["pet_feast"] = { id: "pet_feast", name: "Banquete Real", type: "material", desc: "Enche a fome, muito laço e um pouco de XP.", color: "#ffd070", price: 60 };
ITEMS["evo_stone"] = { id: "evo_stone", name: "Pedra da Evolução", type: "material", desc: "Necessária para algumas evoluções de pets.", color: "#a070ff", price: 250 };
SHOP.push("pet_treat");
RECIPES.push({ out: "pet_treat", qty: 3, station: "alchemist", cost: { carrot: 1, wheat: 1 }, gold: 0 });
RECIPES.push({ out: "pet_feast", qty: 1, station: "alchemist", cost: { pet_treat: 3, moonflower: 1 }, gold: 10 });
RECIPES.push({ out: "evo_stone", qty: 1, station: "alchemist", cost: { mana_shard: 5, crystal_ore: 2 }, gold: 80 });
RECIPES.push(...STORY_RECIPES);
BOSSES.push(...STORY_BOSSES, ...SENHOR_BOSSES);
NPCS.push(...STORY_NPCS);
QUESTS.push(...STORY_QUESTS);

// Histórias paralelas (ver sidequests.ts).
NPCS.push(...SIDE_NPCS);
QUESTS.push(...SIDE_QUESTS);

// Segunda metade das cadeias das oito cidades: novos IDs append-only preservam saves antigos.
const FRONTIER_EPILOGUE_QUESTS: QuestDef[] = [
  { id: "city_lumen_4", title: "A vigília das pétalas", main: false, giver: "lumen_keeper", requires: "city_lumen_3", desc: "Afaste 12 Fadas do jardim de memórias recém-reaberto.", intro: ["Mira: — As lembranças voltaram, mas as fadas confundem as páginas com flores."], outro: "As fadas deixam o jardim em paz. As histórias podem florescer sem serem levadas pelo vento.", goal: { kind: "kill", target: "pixie", n: 12 }, reward: { xp: 680, gold: 460, items: ["moon_seed"] } },
  { id: "city_lumen_5", title: "Flores para cada nome", main: false, giver: "lumen_keeper", requires: "city_lumen_4", desc: "Reúna 8 Flores da Lua para marcar as páginas recuperadas.", intro: ["Cada nome merece uma flor. O arquivo ainda tem páginas sem marca."], outro: "Nenhuma lembrança ficou sem lugar. Mira reserva uma semente para a próxima estação.", goal: { kind: "collect", item: "moonflower", n: 8 }, reward: { xp: 920, gold: 620, items: ["moon_seed", "mana_shard"] } },
  { id: "city_lumen_6", title: "O arquivo não esquece", main: false, giver: "lumen_keeper", requires: "city_lumen_5", desc: "Derrote 16 Espíritos Sombrios que tentam apagar o arquivo restaurado.", intro: ["Mira: — A luz revelou algo escondido sob as raízes. Não deixe que apaguem tudo outra vez."], outro: "A última sombra se desfaz. Lúmen-Pétala guarda agora tanto as flores quanto as histórias de seu povo.", goal: { kind: "kill", target: "shade", n: 16 }, reward: { xp: 1_450, gold: 980, items: ["elixir", "mana_shard"] } },

  { id: "city_prism_4", title: "Facetas em harmonia", main: false, giver: "prism_keeper", requires: "city_prism_3", desc: "Traga 10 Cristais de Mana para estabilizar o acorde do prisma.", intro: ["Orin: — O sino voltou a soar, mas cada faceta ainda vibra em um tom diferente."], outro: "As facetas se alinham. O prisma lança uma faixa de luz sobre todas as casas.", goal: { kind: "collect", item: "crystal_ore", n: 10 }, reward: { xp: 720, gold: 500, items: ["ether", "crystal_ore"] } },
  { id: "city_prism_5", title: "O eco das pedreiras", main: false, giver: "prism_keeper", requires: "city_prism_4", desc: "Derrote 14 Golens que avançam sobre as pedreiras de cristal.", intro: ["O som do sino atraiu os guardiões das galerias. Eles estão quebrando a estrada."], outro: "As ferramentas podem voltar ao trabalho; nenhuma faceta precisa ser arrancada à força.", goal: { kind: "kill", target: "golem", n: 14 }, reward: { xp: 1_000, gold: 700, items: ["iron_ingot", "crystal_ore"] } },
  { id: "city_prism_6", title: "A nota que faltava", main: false, giver: "prism_keeper", requires: "city_prism_5", desc: "Reúna 18 Fragmentos de Mana para completar o acorde comunitário.", intro: ["Orin: — O último tom não vem do sino. Ele precisa da energia de quem ajudou a reconstruí-lo."], outro: "O acorde percorre a cidade inteira. Orin entrega um cristal afinado para você guardar.", goal: { kind: "collect", item: "mana_shard", n: 18 }, reward: { xp: 1_550, gold: 1_050, items: ["elixir", "crystal_ore", "crystal_ore"] } },

  { id: "city_tide_4", title: "A enseada em alerta", main: false, giver: "tide_keeper", requires: "city_tide_3", desc: "Derrote 14 Águas-Vivas que cercam os sinos do porto.", intro: ["Tala: — Os sinos chamaram algo das profundezas. Os barcos não podem sair."], outro: "As águas-vivas recuam. O porto volta a escutar a maré, não o perigo.", goal: { kind: "kill", target: "jelly", n: 14 }, reward: { xp: 700, gold: 480, items: ["hi_potion", "chitin"] } },
  { id: "city_tide_5", title: "Reforço para as boias", main: false, giver: "tide_keeper", requires: "city_tide_4", desc: "Traga 10 Quitinas para reforçar as boias da rota marítima.", intro: ["As boias precisam aguentar a próxima maré. Sem elas, os barcos perderão o caminho de volta."], outro: "A rota está segura mesmo sob corrente forte. Tala marca o caminho no mapa do porto.", goal: { kind: "collect", item: "chitin", n: 10 }, reward: { xp: 950, gold: 660, items: ["ether", "hi_potion"] } },
  { id: "city_tide_6", title: "O farol submerso", main: false, giver: "tide_keeper", requires: "city_tide_5", desc: "Derrote 14 Espectros que assombram o antigo farol submerso.", intro: ["Tala: — Agora que a rota está aberta, os pescadores viram luzes sob o recife."], outro: "A luz não era um pedido de socorro, mas uma despedida. Os barcos podem navegar sem levar o passado a bordo.", goal: { kind: "kill", target: "wraith", n: 14 }, reward: { xp: 1_500, gold: 1_000, items: ["elixir", "mana_shard"] } },

  { id: "city_zephyr_4", title: "A trilha dos ventos", main: false, giver: "zephyr_keeper", requires: "city_zephyr_3", desc: "Derrote 14 Lobos que cercam a caravana recém-chegada.", intro: ["Vico: — A ponte canta de novo, mas uma matilha bloqueia a trilha do outro lado."], outro: "A caravana atravessa sem perder ninguém. Os viajantes deixam suprimentos para a cidade.", goal: { kind: "kill", target: "wolf", n: 14 }, reward: { xp: 720, gold: 500, items: ["frost_herb", "moon_seed"] } },
  { id: "city_zephyr_5", title: "Abrigos de estação", main: false, giver: "zephyr_keeper", requires: "city_zephyr_4", desc: "Entregue 20 Madeiras para construir abrigos na rota da caravana.", intro: ["O vento muda depressa nas alturas. Quem viaja precisa de um lugar para esperar a tempestade."], outro: "Os abrigos ficam de pé. A rota agora pertence também a quem anda a pé.", goal: { kind: "collect", item: "wood", n: 20 }, reward: { xp: 980, gold: 680, items: ["iron_ingot", "moon_seed"] } },
  { id: "city_zephyr_6", title: "A última passagem", main: false, giver: "zephyr_keeper", requires: "city_zephyr_5", desc: "Derrote 18 Goblins que tomaram o último abrigo da passagem.", intro: ["Vico: — Um grupo ocupou o abrigo mais alto. A caravana não pode ficar presa lá em cima."], outro: "A passagem fica livre. Vico inscreve seu nome no primeiro mapa completo da rota.", goal: { kind: "kill", target: "goblin", n: 18 }, reward: { xp: 1_500, gold: 1_020, items: ["elixir", "iron_ingot"] } },

  { id: "city_amber_4", title: "A estrada dourada", main: false, giver: "amber_keeper", requires: "city_amber_3", desc: "Derrote 16 Escorpiões que cobrem as marcas da estrada.", intro: ["Senna: — O Atlas revelou o caminho, mas as marcas estão cercadas por escorpiões."], outro: "A estrada volta a brilhar ao meio-dia. Viajantes já conseguem seguir sem se perder.", goal: { kind: "kill", target: "scorpion", n: 16 }, reward: { xp: 760, gold: 520, items: ["desert_rose", "hi_potion"] } },
  { id: "city_amber_5", title: "Lentes de areia", main: false, giver: "amber_keeper", requires: "city_amber_4", desc: "Reúna 10 Rosas do Deserto para polir as lentes do observatório.", intro: ["Uma lente mostra o caminho; a outra precisa revelar quem o percorreu antes."], outro: "As duas lentes capturam o mesmo sol, mas contam histórias diferentes da cidade.", goal: { kind: "collect", item: "desert_rose", n: 10 }, reward: { xp: 1_000, gold: 700, items: ["elixir", "desert_rose"] } },
  { id: "city_amber_6", title: "O mapa sob as ruínas", main: false, giver: "amber_keeper", requires: "city_amber_5", desc: "Derrote 18 Esqueletos que guardam o mapa antigo sob as ruínas.", intro: ["Senna: — A luz encontrou marcas sob a cidade. Os guardiões despertaram quando tentamos ler."], outro: "O mapa mostra rotas que não aparecem no céu. Senna acrescenta uma cópia ao Atlas para todos.", goal: { kind: "kill", target: "skeleton", n: 18 }, reward: { xp: 1_600, gold: 1_080, items: ["elixir", "mana_shard"] } },

  { id: "city_storm_4", title: "O círculo de proteção", main: false, giver: "storm_keeper", requires: "city_storm_3", desc: "Derrote 14 Golens que se aproximam dos tambores restaurados.", intro: ["Rumo: — O ritmo voltou, mas os ecos estão chamando os golens para a muralha."], outro: "Os tambores soam sem interrupção. A cidade pode prever a tempestade e se preparar.", goal: { kind: "kill", target: "golem", n: 14 }, reward: { xp: 780, gold: 540, items: ["iron_ingot", "hi_potion"] } },
  { id: "city_storm_5", title: "Âncoras para os tambores", main: false, giver: "storm_keeper", requires: "city_storm_4", desc: "Reúna 18 Minérios de Ferro para firmar as âncoras da muralha.", intro: ["Rumo: — As cordas aguentam o ritmo; agora precisamos que os suportes resistam ao vento."], outro: "As âncoras seguram a muralha mesmo quando o céu se parte. Rumo marca o ritmo da obra.", goal: { kind: "collect", item: "iron_ore", n: 18 }, reward: { xp: 1_050, gold: 740, items: ["iron_ingot", "crystal_ore"] } },
  { id: "city_storm_6", title: "Depois do trovão", main: false, giver: "storm_keeper", requires: "city_storm_5", desc: "Derrote 18 Espectros que se escondem na tempestade que passou.", intro: ["Rumo: — O céu abriu. Há sombras rondando os marcos que sobreviveram."], outro: "A muralha permanece inteira. Pela primeira vez, o silêncio depois do trovão parece tranquilo.", goal: { kind: "kill", target: "wraith", n: 18 }, reward: { xp: 1_650, gold: 1_120, items: ["elixir", "crystal_ore"] } },

  { id: "city_mycelium_4", title: "O jardim que responde", main: false, giver: "mycelium_keeper", requires: "city_mycelium_3", desc: "Derrote 16 Cogumelos que brotaram nos caminhos de mensagem.", intro: ["Nara: — As notícias chegaram, mas cogumelos enormes cresceram sobre as trilhas."], outro: "As trilhas voltam a respirar. Os cogumelos menores começam a piscar em resposta.", goal: { kind: "kill", target: "mushroom", n: 16 }, reward: { xp: 700, gold: 480, items: ["herb", "frost_herb"] } },
  { id: "city_mycelium_5", title: "Sementes para a rede", main: false, giver: "mycelium_keeper", requires: "city_mycelium_4", desc: "Reúna 20 Ervas Medicinais para replantar a rede luminosa.", intro: ["Nara: — Cada mensagem precisa de um novo ponto de luz. Vamos plantar uma rede maior."], outro: "A rede alcança todos os bairros. Até quem está longe pode enviar uma resposta.", goal: { kind: "collect", item: "herb", n: 20 }, reward: { xp: 1_000, gold: 700, items: ["elixir", "frost_herb"] } },
  { id: "city_mycelium_6", title: "A mensagem do micélio", main: false, giver: "mycelium_keeper", requires: "city_mycelium_5", desc: "Derrote 18 Esporitos que cercam o coração do micélio.", intro: ["Nara: — A cidade inteira recebeu uma mensagem, mas ninguém consegue entender o final."], outro: "O micélio responde com uma luz calma. Nara registra a mensagem para que nenhuma cidade volte a ficar isolada.", goal: { kind: "kill", target: "sporeling", n: 18 }, reward: { xp: 1_550, gold: 1_050, items: ["elixir", "mana_shard"] } },

  { id: "city_marble_4", title: "Os nomes na galeria", main: false, giver: "marble_keeper", requires: "city_marble_3", desc: "Derrote 18 Esqueletos que cobrem os nomes do memorial.", intro: ["Iven: — A cidade ganhou um memorial, mas as galerias antigas se abriram sob a praça."], outro: "Os nomes ficam visíveis outra vez. Iven promete não deixar que a história vire pedra fria.", goal: { kind: "kill", target: "skeleton", n: 18 }, reward: { xp: 800, gold: 560, items: ["mana_shard", "iron_ingot"] } },
  { id: "city_marble_5", title: "Pedras com memória", main: false, giver: "marble_keeper", requires: "city_marble_4", desc: "Leve 30 Pedras ao ateliê para ampliar o memorial comunitário.", intro: ["Cada pessoa pediu espaço para uma lembrança nova. O memorial precisa crescer sem apagar o antigo."], outro: "A galeria se expande com espaço para as histórias que ainda serão contadas.", goal: { kind: "collect", item: "stone", n: 30 }, reward: { xp: 1_100, gold: 780, items: ["crystal_ore", "elixir"] } },
  { id: "city_marble_6", title: "A cidade que permanece", main: false, giver: "marble_keeper", requires: "city_marble_5", desc: "Derrote 18 Espectros que ameaçam o salão restaurado.", intro: ["Iven: — Há vozes no salão. Não pedem para serem esquecidas, só para serem ouvidas."], outro: "O salão fica em paz. A cidade escolhe lembrar sem viver presa ao passado.", goal: { kind: "kill", target: "wraith", n: 18 }, reward: { xp: 1_700, gold: 1_180, items: ["elixir", "mana_shard", "crystal_ore"] } },
];
QUESTS.push(...FRONTIER_EPILOGUE_QUESTS);

// 24 rotas opcionais inéditas, quatro etapas cada; usam apenas catálogos existentes.
QUESTS.push(
  { id: "deep_route_01_1", title: "Potos, a cidade desperta — etapa 1", main: false, giver: "guard", desc: "Leve notícias da expedição a merchant.", goal: { kind: "talk", npc: "merchant", line: "Conte o que descobriu nesta expedição." }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_01_2", title: "Potos, a cidade desperta — etapa 2", main: false, giver: "guard", desc: "Reúna 4 unidades de herb.", goal: { kind: "collect", item: "herb", n: 4 }, requires: "deep_route_01_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_01_3", title: "Potos, a cidade desperta — etapa 3", main: false, giver: "guard", desc: "Derrote 5 criaturas da rota: goblin.", goal: { kind: "kill", target: "goblin", n: 5 }, requires: "deep_route_01_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_01_4", title: "Potos, a cidade desperta — etapa 4", main: false, giver: "guard", desc: "Alcance o 3º andar da Mina de planícies.", goal: { kind: "mine", biome: "plains", floor: 3 }, requiresAll: ["deep_route_01_1", "deep_route_01_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_02_1", title: "Lúmen-Pétala e os arquivos — etapa 1", main: false, giver: "lumen_keeper", desc: "Reúna 3 unidades de moonflower.", goal: { kind: "collect", item: "moonflower", n: 3 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_02_2", title: "Lúmen-Pétala e os arquivos — etapa 2", main: false, giver: "lumen_keeper", desc: "Leve notícias da expedição a lumen_keeper.", goal: { kind: "talk", npc: "lumen_keeper", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_02_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_02_3", title: "Lúmen-Pétala e os arquivos — etapa 3", main: false, giver: "lumen_keeper", desc: "Derrote 6 criaturas da rota: pixie.", goal: { kind: "kill", target: "pixie", n: 6 }, requires: "deep_route_02_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_02_4", title: "Lúmen-Pétala e os arquivos — etapa 4", main: false, giver: "lumen_keeper", desc: "Enfrente o guardião ent.", goal: { kind: "boss", target: "ent" }, requiresAll: ["deep_route_02_1", "deep_route_02_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_03_1", title: "Prisma-Viva e o sino — etapa 1", main: false, giver: "prism_keeper", desc: "Reúna 3 unidades de crystal_ore.", goal: { kind: "collect", item: "crystal_ore", n: 3 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_03_2", title: "Prisma-Viva e o sino — etapa 2", main: false, giver: "prism_keeper", desc: "Derrote 5 criaturas da rota: golem.", goal: { kind: "kill", target: "golem", n: 5 }, requires: "deep_route_03_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_03_3", title: "Prisma-Viva e o sino — etapa 3", main: false, giver: "prism_keeper", desc: "Leve notícias da expedição a prism_keeper.", goal: { kind: "talk", npc: "prism_keeper", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_03_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_03_4", title: "Prisma-Viva e o sino — etapa 4", main: false, giver: "prism_keeper", desc: "Enfrente o guardião crystal_golem.", goal: { kind: "boss", target: "crystal_golem" }, requiresAll: ["deep_route_03_1", "deep_route_03_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_04_1", title: "Porto das Marés — etapa 1", main: false, giver: "tide_keeper", desc: "Derrote 5 criaturas da rota: crab.", goal: { kind: "kill", target: "crab", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_04_2", title: "Porto das Marés — etapa 2", main: false, giver: "tide_keeper", desc: "Reúna 4 unidades de chitin.", goal: { kind: "collect", item: "chitin", n: 4 }, requires: "deep_route_04_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_04_3", title: "Porto das Marés — etapa 3", main: false, giver: "tide_keeper", desc: "Alcance o 5º andar da Mina de litoral.", goal: { kind: "mine", biome: "coast", floor: 5 }, requires: "deep_route_04_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_04_4", title: "Porto das Marés — etapa 4", main: false, giver: "tide_keeper", desc: "Derrote 8 criaturas da rota: jelly.", goal: { kind: "kill", target: "jelly", n: 8 }, requiresAll: ["deep_route_04_1", "deep_route_04_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_05_1", title: "Pontes de Zéfiro — etapa 1", main: false, giver: "zephyr_keeper", desc: "Reúna 6 unidades de wood.", goal: { kind: "collect", item: "wood", n: 6 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_05_2", title: "Pontes de Zéfiro — etapa 2", main: false, giver: "zephyr_keeper", desc: "Derrote 5 criaturas da rota: wolf.", goal: { kind: "kill", target: "wolf", n: 5 }, requires: "deep_route_05_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_05_3", title: "Pontes de Zéfiro — etapa 3", main: false, giver: "zephyr_keeper", desc: "Leve notícias da expedição a zephyr_keeper.", goal: { kind: "talk", npc: "zephyr_keeper", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_05_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_05_4", title: "Pontes de Zéfiro — etapa 4", main: false, giver: "zephyr_keeper", desc: "Enfrente o guardião fenrir.", goal: { kind: "boss", target: "fenrir" }, requiresAll: ["deep_route_05_1", "deep_route_05_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_06_1", title: "Farol Âmbar — etapa 1", main: false, giver: "amber_keeper", desc: "Reúna 3 unidades de desert_rose.", goal: { kind: "collect", item: "desert_rose", n: 3 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_06_2", title: "Farol Âmbar — etapa 2", main: false, giver: "amber_keeper", desc: "Derrote 6 criaturas da rota: scorpion.", goal: { kind: "kill", target: "scorpion", n: 6 }, requires: "deep_route_06_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_06_3", title: "Farol Âmbar — etapa 3", main: false, giver: "amber_keeper", desc: "Leve notícias da expedição a amber_keeper.", goal: { kind: "talk", npc: "amber_keeper", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_06_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_06_4", title: "Farol Âmbar — etapa 4", main: false, giver: "amber_keeper", desc: "Enfrente o guardião sahr.", goal: { kind: "boss", target: "sahr" }, requiresAll: ["deep_route_06_1", "deep_route_06_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_07_1", title: "Tambores da Tempestade — etapa 1", main: false, giver: "storm_keeper", desc: "Reúna 5 unidades de iron_ore.", goal: { kind: "collect", item: "iron_ore", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_07_2", title: "Tambores da Tempestade — etapa 2", main: false, giver: "storm_keeper", desc: "Derrote 6 criaturas da rota: golem.", goal: { kind: "kill", target: "golem", n: 6 }, requires: "deep_route_07_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_07_3", title: "Tambores da Tempestade — etapa 3", main: false, giver: "storm_keeper", desc: "Alcance o 7º andar da Mina de Trovão.", goal: { kind: "mine", biome: "thunder", floor: 7 }, requires: "deep_route_07_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_07_4", title: "Tambores da Tempestade — etapa 4", main: false, giver: "storm_keeper", desc: "Leve notícias da expedição a storm_keeper.", goal: { kind: "talk", npc: "storm_keeper", line: "Conte o que descobriu nesta expedição." }, requiresAll: ["deep_route_07_1", "deep_route_07_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_08_1", title: "Micélio Mensageiro — etapa 1", main: false, giver: "mycelium_keeper", desc: "Reúna 5 unidades de herb.", goal: { kind: "collect", item: "herb", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_08_2", title: "Micélio Mensageiro — etapa 2", main: false, giver: "mycelium_keeper", desc: "Derrote 7 criaturas da rota: sporeling.", goal: { kind: "kill", target: "sporeling", n: 7 }, requires: "deep_route_08_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_08_3", title: "Micélio Mensageiro — etapa 3", main: false, giver: "mycelium_keeper", desc: "Leve notícias da expedição a mycelium_keeper.", goal: { kind: "talk", npc: "mycelium_keeper", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_08_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_08_4", title: "Micélio Mensageiro — etapa 4", main: false, giver: "mycelium_keeper", desc: "Enfrente o guardião king_mush.", goal: { kind: "boss", target: "king_mush" }, requiresAll: ["deep_route_08_1", "deep_route_08_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_09_1", title: "Memorial de Marbleira — etapa 1", main: false, giver: "marble_keeper", desc: "Reúna 8 unidades de stone.", goal: { kind: "collect", item: "stone", n: 8 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_09_2", title: "Memorial de Marbleira — etapa 2", main: false, giver: "marble_keeper", desc: "Derrote 6 criaturas da rota: skeleton.", goal: { kind: "kill", target: "skeleton", n: 6 }, requires: "deep_route_09_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_09_3", title: "Memorial de Marbleira — etapa 3", main: false, giver: "marble_keeper", desc: "Alcance o 8º andar da Mina de Mármore.", goal: { kind: "mine", biome: "marble", floor: 8 }, requires: "deep_route_09_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_09_4", title: "Memorial de Marbleira — etapa 4", main: false, giver: "marble_keeper", desc: "Derrote 5 criaturas da rota: gargoyle.", goal: { kind: "kill", target: "gargoyle", n: 5 }, requiresAll: ["deep_route_09_1", "deep_route_09_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_10_1", title: "Veios das Minas Antigas — etapa 1", main: false, giver: "smith", desc: "Reúna 6 unidades de iron_ore.", goal: { kind: "collect", item: "iron_ore", n: 6 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_10_2", title: "Veios das Minas Antigas — etapa 2", main: false, giver: "smith", desc: "Derrote 5 criaturas da rota: beetle.", goal: { kind: "kill", target: "beetle", n: 5 }, requires: "deep_route_10_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_10_3", title: "Veios das Minas Antigas — etapa 3", main: false, giver: "smith", desc: "Reúna 4 unidades de coal.", goal: { kind: "collect", item: "coal", n: 4 }, requires: "deep_route_10_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_10_4", title: "Veios das Minas Antigas — etapa 4", main: false, giver: "smith", desc: "Enfrente o guardião crystal_golem.", goal: { kind: "boss", target: "crystal_golem" }, requiresAll: ["deep_route_10_1", "deep_route_10_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_11_1", title: "Galerias de Cristal — etapa 1", main: false, giver: "alchemist", desc: "Derrote 6 criaturas da rota: bat.", goal: { kind: "kill", target: "bat", n: 6 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_11_2", title: "Galerias de Cristal — etapa 2", main: false, giver: "alchemist", desc: "Reúna 4 unidades de mana_shard.", goal: { kind: "collect", item: "mana_shard", n: 4 }, requires: "deep_route_11_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_11_3", title: "Galerias de Cristal — etapa 3", main: false, giver: "alchemist", desc: "Derrote 6 criaturas da rota: shade.", goal: { kind: "kill", target: "shade", n: 6 }, requires: "deep_route_11_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_11_4", title: "Galerias de Cristal — etapa 4", main: false, giver: "alchemist", desc: "Alcance o 10º andar da Mina de Prisma.", goal: { kind: "mine", biome: "prism", floor: 10 }, requiresAll: ["deep_route_11_1", "deep_route_11_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_12_1", title: "A mina de carvão — etapa 1", main: false, giver: "smith", desc: "Reúna 5 unidades de coal.", goal: { kind: "collect", item: "coal", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_12_2", title: "A mina de carvão — etapa 2", main: false, giver: "smith", desc: "Derrote 5 criaturas da rota: imp.", goal: { kind: "kill", target: "imp", n: 5 }, requires: "deep_route_12_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_12_3", title: "A mina de carvão — etapa 3", main: false, giver: "smith", desc: "Reúna 8 unidades de iron_ore.", goal: { kind: "collect", item: "iron_ore", n: 8 }, requires: "deep_route_12_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_12_4", title: "A mina de carvão — etapa 4", main: false, giver: "smith", desc: "Derrote 4 criaturas da rota: salamander.", goal: { kind: "kill", target: "salamander", n: 4 }, requiresAll: ["deep_route_12_1", "deep_route_12_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_13_1", title: "Ilhas de Coral — etapa 1", main: false, giver: "tide_keeper", desc: "Derrote 6 criaturas da rota: crab.", goal: { kind: "kill", target: "crab", n: 6 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_13_2", title: "Ilhas de Coral — etapa 2", main: false, giver: "tide_keeper", desc: "Reúna 3 unidades de desert_rose.", goal: { kind: "collect", item: "desert_rose", n: 3 }, requires: "deep_route_13_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_13_3", title: "Ilhas de Coral — etapa 3", main: false, giver: "tide_keeper", desc: "Leve notícias da expedição a tide_keeper.", goal: { kind: "talk", npc: "tide_keeper", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_13_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_13_4", title: "Ilhas de Coral — etapa 4", main: false, giver: "tide_keeper", desc: "Alcance o 4º andar da Mina de Coral.", goal: { kind: "mine", biome: "coral", floor: 4 }, requiresAll: ["deep_route_13_1", "deep_route_13_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_14_1", title: "Naufrágio das Correntes — etapa 1", main: false, giver: "tide_keeper", desc: "Derrote 5 criaturas da rota: serpent.", goal: { kind: "kill", target: "serpent", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_14_2", title: "Naufrágio das Correntes — etapa 2", main: false, giver: "tide_keeper", desc: "Reúna 6 unidades de chitin.", goal: { kind: "collect", item: "chitin", n: 6 }, requires: "deep_route_14_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_14_3", title: "Naufrágio das Correntes — etapa 3", main: false, giver: "tide_keeper", desc: "Alcance o 6º andar da Mina de Manguezais.", goal: { kind: "mine", biome: "mangrove", floor: 6 }, requires: "deep_route_14_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_14_4", title: "Naufrágio das Correntes — etapa 4", main: false, giver: "tide_keeper", desc: "Enfrente o guardião sahr.", goal: { kind: "boss", target: "sahr" }, requiresAll: ["deep_route_14_1", "deep_route_14_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_15_1", title: "Atóis de Argaes — etapa 1", main: false, giver: "ranger", desc: "Derrote 5 criaturas da rota: frog.", goal: { kind: "kill", target: "frog", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_15_2", title: "Atóis de Argaes — etapa 2", main: false, giver: "ranger", desc: "Reúna 5 unidades de wood.", goal: { kind: "collect", item: "wood", n: 5 }, requires: "deep_route_15_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_15_3", title: "Atóis de Argaes — etapa 3", main: false, giver: "ranger", desc: "Derrote 4 criaturas da rota: treant.", goal: { kind: "kill", target: "treant", n: 4 }, requires: "deep_route_15_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_15_4", title: "Atóis de Argaes — etapa 4", main: false, giver: "ranger", desc: "Leve notícias da expedição a ranger.", goal: { kind: "talk", npc: "ranger", line: "Conte o que descobriu nesta expedição." }, requiresAll: ["deep_route_15_1", "deep_route_15_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_16_1", title: "Faróis do Arquipélago — etapa 1", main: false, giver: "merchant", desc: "Reúna 4 unidades de mana_shard.", goal: { kind: "collect", item: "mana_shard", n: 4 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_16_2", title: "Faróis do Arquipélago — etapa 2", main: false, giver: "merchant", desc: "Derrote 6 criaturas da rota: wisp.", goal: { kind: "kill", target: "wisp", n: 6 }, requires: "deep_route_16_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_16_3", title: "Faróis do Arquipélago — etapa 3", main: false, giver: "merchant", desc: "Leve notícias da expedição a merchant.", goal: { kind: "talk", npc: "merchant", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_16_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_16_4", title: "Faróis do Arquipélago — etapa 4", main: false, giver: "merchant", desc: "Alcance o 5º andar da Mina de Aurora.", goal: { kind: "mine", biome: "aurora", floor: 5 }, requiresAll: ["deep_route_16_1", "deep_route_16_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_17_1", title: "Profundezas do Cântico I — etapa 1", main: false, giver: "hermit", desc: "Alcance o 2º andar da Mina de Cavernas.", goal: { kind: "mine", biome: "cave", floor: 2 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_17_2", title: "Profundezas do Cântico I — etapa 2", main: false, giver: "hermit", desc: "Derrote 5 criaturas da rota: bat.", goal: { kind: "kill", target: "bat", n: 5 }, requires: "deep_route_17_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_17_3", title: "Profundezas do Cântico I — etapa 3", main: false, giver: "hermit", desc: "Reúna 1 unidades de torch.", goal: { kind: "collect", item: "torch", n: 1 }, requires: "deep_route_17_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_17_4", title: "Profundezas do Cântico I — etapa 4", main: false, giver: "hermit", desc: "Derrote 7 criaturas da rota: shade.", goal: { kind: "kill", target: "shade", n: 7 }, requiresAll: ["deep_route_17_1", "deep_route_17_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_18_1", title: "Profundezas do Cântico II — etapa 1", main: false, giver: "hermit", desc: "Alcance o 4º andar da Mina de Vulcânica.", goal: { kind: "mine", biome: "volcanic", floor: 4 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_18_2", title: "Profundezas do Cântico II — etapa 2", main: false, giver: "hermit", desc: "Derrote 6 criaturas da rota: skeleton.", goal: { kind: "kill", target: "skeleton", n: 6 }, requires: "deep_route_18_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_18_3", title: "Profundezas do Cântico II — etapa 3", main: false, giver: "hermit", desc: "Reúna 6 unidades de mana_shard.", goal: { kind: "collect", item: "mana_shard", n: 6 }, requires: "deep_route_18_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_18_4", title: "Profundezas do Cântico II — etapa 4", main: false, giver: "hermit", desc: "Enfrente o guardião crystal_golem.", goal: { kind: "boss", target: "crystal_golem" }, requiresAll: ["deep_route_18_1", "deep_route_18_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_19_1", title: "Ecos do Abismo — etapa 1", main: false, giver: "elder", desc: "Alcance o 3º andar do Abismo do Cântico.", goal: { kind: "floor", n: 3 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_19_2", title: "Ecos do Abismo — etapa 2", main: false, giver: "elder", desc: "Derrote 4 criaturas da rota: wraith.", goal: { kind: "kill", target: "wraith", n: 4 }, requires: "deep_route_19_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_19_3", title: "Ecos do Abismo — etapa 3", main: false, giver: "elder", desc: "Reúna 5 unidades de crystal_ore.", goal: { kind: "collect", item: "crystal_ore", n: 5 }, requires: "deep_route_19_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_19_4", title: "Ecos do Abismo — etapa 4", main: false, giver: "elder", desc: "Alcance o 9º andar do Abismo do Cântico.", goal: { kind: "floor", n: 9 }, requiresAll: ["deep_route_19_1", "deep_route_19_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_20_1", title: "Ruínas submersas — etapa 1", main: false, giver: "prism_keeper", desc: "Derrote 6 criaturas da rota: jelly.", goal: { kind: "kill", target: "jelly", n: 6 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_20_2", title: "Ruínas submersas — etapa 2", main: false, giver: "prism_keeper", desc: "Reúna 4 unidades de crystal_ore.", goal: { kind: "collect", item: "crystal_ore", n: 4 }, requires: "deep_route_20_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_20_3", title: "Ruínas submersas — etapa 3", main: false, giver: "prism_keeper", desc: "Derrote 2 criaturas da rota: mimic.", goal: { kind: "kill", target: "mimic", n: 2 }, requires: "deep_route_20_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_20_4", title: "Ruínas submersas — etapa 4", main: false, giver: "prism_keeper", desc: "Leve notícias da expedição a prism_keeper.", goal: { kind: "talk", npc: "prism_keeper", line: "Conte o que descobriu nesta expedição." }, requiresAll: ["deep_route_20_1", "deep_route_20_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_21_1", title: "Caravana das Areias — etapa 1", main: false, giver: "nomad", desc: "Derrote 5 criaturas da rota: scorpion.", goal: { kind: "kill", target: "scorpion", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_21_2", title: "Caravana das Areias — etapa 2", main: false, giver: "nomad", desc: "Reúna 4 unidades de desert_rose.", goal: { kind: "collect", item: "desert_rose", n: 4 }, requires: "deep_route_21_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_21_3", title: "Caravana das Areias — etapa 3", main: false, giver: "nomad", desc: "Leve notícias da expedição a nomad.", goal: { kind: "talk", npc: "nomad", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_21_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_21_4", title: "Caravana das Areias — etapa 4", main: false, giver: "nomad", desc: "Enfrente o guardião sahr.", goal: { kind: "boss", target: "sahr" }, requiresAll: ["deep_route_21_1", "deep_route_21_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_22_1", title: "Vigias da Montanha — etapa 1", main: false, giver: "hermit", desc: "Derrote 6 criaturas da rota: wolf.", goal: { kind: "kill", target: "wolf", n: 6 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_22_2", title: "Vigias da Montanha — etapa 2", main: false, giver: "hermit", desc: "Reúna 4 unidades de frost_herb.", goal: { kind: "collect", item: "frost_herb", n: 4 }, requires: "deep_route_22_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_22_3", title: "Vigias da Montanha — etapa 3", main: false, giver: "hermit", desc: "Leve notícias da expedição a hermit.", goal: { kind: "talk", npc: "hermit", line: "Conte o que descobriu nesta expedição." }, requires: "deep_route_22_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_22_4", title: "Vigias da Montanha — etapa 4", main: false, giver: "hermit", desc: "Enfrente o guardião fenrir.", goal: { kind: "boss", target: "fenrir" }, requiresAll: ["deep_route_22_1", "deep_route_22_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_23_1", title: "Raízes sob a cidade — etapa 1", main: false, giver: "lumen_keeper", desc: "Derrote 5 criaturas da rota: spider.", goal: { kind: "kill", target: "spider", n: 5 }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_23_2", title: "Raízes sob a cidade — etapa 2", main: false, giver: "lumen_keeper", desc: "Reúna 3 unidades de moonflower.", goal: { kind: "collect", item: "moonflower", n: 3 }, requires: "deep_route_23_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_23_3", title: "Raízes sob a cidade — etapa 3", main: false, giver: "lumen_keeper", desc: "Derrote 4 criaturas da rota: treant.", goal: { kind: "kill", target: "treant", n: 4 }, requires: "deep_route_23_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_23_4", title: "Raízes sob a cidade — etapa 4", main: false, giver: "lumen_keeper", desc: "Enfrente o guardião ent.", goal: { kind: "boss", target: "ent" }, requiresAll: ["deep_route_23_1", "deep_route_23_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
  { id: "deep_route_24_1", title: "Confluência das rotas — etapa 1", main: false, giver: "elder", desc: "Leve notícias da expedição a elder.", goal: { kind: "talk", npc: "elder", line: "Conte o que descobriu nesta expedição." }, reward: { xp: 110, gold: 75, items: ["potion"] } },
  { id: "deep_route_24_2", title: "Confluência das rotas — etapa 2", main: false, giver: "elder", desc: "Reúna 5 unidades de mana_shard.", goal: { kind: "collect", item: "mana_shard", n: 5 }, requires: "deep_route_24_1", reward: { xp: 260, gold: 170, items: ["ether"] } },
  { id: "deep_route_24_3", title: "Confluência das rotas — etapa 3", main: false, giver: "elder", desc: "Derrote 5 criaturas da rota: wraith.", goal: { kind: "kill", target: "wraith", n: 5 }, requires: "deep_route_24_2", reward: { xp: 520, gold: 340, items: ["hi_potion"] } },
  { id: "deep_route_24_4", title: "Confluência das rotas — etapa 4", main: false, giver: "elder", desc: "Enfrente o guardião crystal_golem.", goal: { kind: "boss", target: "crystal_golem" }, requiresAll: ["deep_route_24_1", "deep_route_24_3"], reward: { xp: 900, gold: 600, items: ["elixir"] } },
);
