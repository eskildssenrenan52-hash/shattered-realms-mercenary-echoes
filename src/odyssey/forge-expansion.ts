import { ITEMS, RECIPES, type Biome, type ItemDef, type Recipe } from "./data";

export interface AdvancedOre {
  id: string;
  name: string;
  color: string;
  biomes: Biome[];
  depth: [number, number];
  minLevel: number;
  dropWeight: number;
}

/** Minérios exclusivos de biomas e estratos; metadados não alteram geração de mundo. */
export const ADVANCED_ORES: AdvancedOre[] = [
  { id: "forge_amber_ore", name: "Minério Âmbar", color: "#d99a37", biomes: ["autumn"], depth: [2, 5], minLevel: 8, dropWeight: 0.34 },
  { id: "forge_tide_ore", name: "Minério de Maré", color: "#39aeb5", biomes: ["coast"], depth: [3, 6], minLevel: 12, dropWeight: 0.30 },
  { id: "forge_mire_ore", name: "Minério de Lodo-ferro", color: "#718d55", biomes: ["swamp"], depth: [4, 7], minLevel: 16, dropWeight: 0.27 },
  { id: "forge_canopy_ore", name: "Minério de Jadeiro", color: "#36a879", biomes: ["jungle"], depth: [5, 8], minLevel: 20, dropWeight: 0.24 },
  { id: "forge_ember_ore", name: "Minério de Brasa", color: "#e65c36", biomes: ["volcanic"], depth: [6, 9], minLevel: 24, dropWeight: 0.21 },
  { id: "forge_mycelium_ore", name: "Minério Micelial", color: "#bb70a8", biomes: ["mushroom"], depth: [7, 10], minLevel: 28, dropWeight: 0.19 },
  { id: "forge_moon_ore", name: "Minério de Luar", color: "#83b5db", biomes: ["meadow"], depth: [8, 11], minLevel: 32, dropWeight: 0.16 },
  { id: "forge_marble_ore", name: "Minério de Mármore Antigo", color: "#c1c6d0", biomes: ["ruins"], depth: [9, 12], minLevel: 36, dropWeight: 0.13 },
];

interface MaterialDef { item: ItemDef; recipe: Recipe }
interface EquipmentDef { item: ItemDef; cost: Record<string, number>; gold: number }
const MATERIALS: MaterialDef[] = ADVANCED_ORES.map((ore, i) => {
  const id = ore.id.replace("_ore", "_ingot");
  return {
    item: { id, name: `${ore.name.replace("Minério de ", "")} Refinado`, type: "material", desc: `Material processado do bioma ${ore.biomes[0]}.`, color: ore.color, price: 24 + i * 16 },
    recipe: { out: id, qty: 1, station: "smith", cost: { [ore.id]: 2 + Math.floor(i / 2), coal: 1 + Math.floor(i / 3) }, gold: 12 + i * 14 },
  };
});

// Todos os sprites abaixo existem no arsenal preexistente de data.ts.
const EQUIPMENT: EquipmentDef[] = [
  { item: { id: "forge_amber_sabre", name: "Sabre Âmbar", type: "weapon", weapon: "sword", atk: 15, color: "#d99a37", sprite: "goldsword", desc: "Lâmina leve de brilho outonal.", price: 250 }, cost: { forge_amber_ingot: 2, wood: 2 }, gold: 90 },
  { item: { id: "forge_amber_mail", name: "Cota Âmbar", type: "armor", def: 12, bonus: { vit: 1 }, color: "#d99a37", sprite: "ironsword", desc: "Cota reforçada com metal das folhas douradas.", price: 280 }, cost: { forge_amber_ingot: 3, wolf_pelt: 2 }, gold: 100 },
  { item: { id: "forge_amber_ring", name: "Anel Âmbar", type: "ring", bonus: { str: 2, vit: 1 }, color: "#d99a37", sprite: "goldsword", desc: "Aquece a força de quem o usa.", price: 290 }, cost: { forge_amber_ingot: 2, desert_rose: 1 }, gold: 110 },
  { item: { id: "forge_tide_trident", name: "Tridente da Maré", type: "weapon", weapon: "spear", atk: 19, color: "#39aeb5", sprite: "goldspear", desc: "Ponta forjada com metal costeiro.", price: 360 }, cost: { forge_tide_ingot: 3, wood: 3 }, gold: 150 },
  { item: { id: "forge_tide_coat", name: "Couraça de Maré", type: "armor", def: 16, bonus: { vit: 1, wis: 1 }, color: "#39aeb5", sprite: "ironsword", desc: "Placas resistentes à água e ao impacto.", price: 390 }, cost: { forge_tide_ingot: 3, chitin: 2 }, gold: 170 },
  { item: { id: "forge_tide_charm", name: "Anel da Maré", type: "ring", bonus: { dex: 3, mp: 8 }, color: "#39aeb5", sprite: "goldspear", desc: "Acompanha o ritmo das águas.", price: 410 }, cost: { forge_tide_ingot: 2, mana_shard: 2 }, gold: 180 },
  { item: { id: "forge_mire_blade", name: "Lâmina do Brejo", type: "weapon", weapon: "sword", atk: 23, color: "#718d55", sprite: "firesword", desc: "Aço escurecido pelas águas antigas.", price: 480 }, cost: { forge_mire_ingot: 3, chitin: 3 }, gold: 210 },
  { item: { id: "forge_mire_scale", name: "Armadura de Escamas do Brejo", type: "armor", def: 20, bonus: { vit: 2 }, color: "#718d55", sprite: "ironsword", desc: "Escamas rígidas protegem contra venenos e garras.", price: 520 }, cost: { forge_mire_ingot: 4, chitin: 3 }, gold: 230 },
  { item: { id: "forge_mire_band", name: "Anel do Brejo", type: "ring", bonus: { vit: 2, wis: 2 }, color: "#718d55", sprite: "goldsword", desc: "Um talismã de resistência.", price: 540 }, cost: { forge_mire_ingot: 3, goo: 3 }, gold: 240 },
  { item: { id: "forge_canopy_bow", name: "Arco das Copas", type: "weapon", weapon: "bow", atk: 27, bonus: { dex: 2 }, color: "#36a879", sprite: "bowsun", desc: "Arco de precisão talhado para a selva.", price: 630 }, cost: { forge_canopy_ingot: 3, wood: 5 }, gold: 280 },
  { item: { id: "forge_canopy_vest", name: "Veste de Jadeiro", type: "armor", def: 24, bonus: { dex: 2 }, color: "#36a879", sprite: "ironsword", desc: "Leve, flexível e reforçada com jadeiro.", price: 670 }, cost: { forge_canopy_ingot: 4, wolf_pelt: 3 }, gold: 300 },
  { item: { id: "forge_canopy_charm", name: "Anel das Copas", type: "ring", bonus: { dex: 3, wis: 2 }, color: "#36a879", sprite: "bowsun", desc: "Guia o movimento como um galho ao vento.", price: 690 }, cost: { forge_canopy_ingot: 3, mana_shard: 3 }, gold: 320 },
  { item: { id: "forge_ember_sword", name: "Espada de Brasa", type: "weapon", weapon: "sword", atk: 31, bonus: { str: 2 }, color: "#e65c36", sprite: "firesword", desc: "Lâmina vulcânica que conserva o calor.", price: 780 }, cost: { forge_ember_ingot: 4, coal: 5 }, gold: 350 },
  { item: { id: "forge_ember_plate", name: "Placas da Caldeira", type: "armor", def: 29, bonus: { vit: 2, str: 1 }, color: "#e65c36", sprite: "ironsword", desc: "Blindagem pesada temperada em lava.", price: 830 }, cost: { forge_ember_ingot: 5, chitin: 4 }, gold: 380 },
  { item: { id: "forge_ember_ring", name: "Anel de Brasa", type: "ring", bonus: { str: 3, vit: 2 }, color: "#e65c36", sprite: "firesword", desc: "Concentra o vigor das profundezas.", price: 850 }, cost: { forge_ember_ingot: 4, mana_shard: 3 }, gold: 400 },
  { item: { id: "forge_mycelium_staff", name: "Cajado Micelial", type: "weapon", weapon: "staff", atk: 35, bonus: { int: 3 }, color: "#bb70a8", sprite: "bloodmoonstaff", desc: "Canaliza a rede viva sob a floresta.", price: 950 }, cost: { forge_mycelium_ingot: 4, wood: 4, mana_shard: 3 }, gold: 430 },
  { item: { id: "forge_mycelium_mantle", name: "Manto Micelial", type: "armor", def: 33, bonus: { wis: 3, mp: 12 }, color: "#bb70a8", sprite: "ironsword", desc: "O micélio costurado reverbera mana.", price: 990 }, cost: { forge_mycelium_ingot: 5, goo: 4 }, gold: 460 },
  { item: { id: "forge_mycelium_ring", name: "Anel Micelial", type: "ring", bonus: { int: 3, mp: 15 }, color: "#bb70a8", sprite: "bloodmoonstaff", desc: "Uma colônia luminosa repousa no aro.", price: 1020 }, cost: { forge_mycelium_ingot: 4, mana_shard: 4 }, gold: 480 },
  { item: { id: "forge_moon_glaive", name: "Glaive do Luar", type: "weapon", weapon: "spear", atk: 39, bonus: { dex: 2 }, color: "#83b5db", sprite: "timelessglaive", desc: "Alcança o inimigo com um arco de luz fria.", price: 1110 }, cost: { forge_moon_ingot: 5, wood: 4, crystal_ore: 3 }, gold: 510 },
  { item: { id: "forge_moon_armor", name: "Armadura Lunar", type: "armor", def: 37, bonus: { vit: 2, wis: 2 }, color: "#83b5db", sprite: "ironsword", desc: "Placas prateadas refletem a magia hostil.", price: 1160 }, cost: { forge_moon_ingot: 5, crystal_ore: 3 }, gold: 540 },
  { item: { id: "forge_moon_ring", name: "Anel Lunar", type: "ring", bonus: { wis: 4, mp: 18 }, color: "#83b5db", sprite: "timelessglaive", desc: "Recolhe a luz para alimentar feitiços.", price: 1190 }, cost: { forge_moon_ingot: 4, mana_shard: 5 }, gold: 560 },
  { item: { id: "forge_marble_blade", name: "Lâmina de Mármore", type: "weapon", weapon: "sword", atk: 45, bonus: { str: 3 }, color: "#c1c6d0", sprite: "angelicblade", desc: "Relíquia pesada de uma era esquecida.", price: 1280 }, cost: { forge_marble_ingot: 6, crystal_ore: 4 }, gold: 590 },
  { item: { id: "forge_marble_aegis", name: "Égide de Artis", type: "armor", def: 42, bonus: { vit: 3, hp: 25 }, color: "#c1c6d0", sprite: "ironsword", desc: "Uma couraça digna dos salões antigos.", price: 1340 }, cost: { forge_marble_ingot: 6, iron_ingot: 4, chitin: 4 }, gold: 620 },
  { item: { id: "forge_marble_ring", name: "Anel de Artis", type: "ring", bonus: { str: 3, wis: 3, hp: 15 }, color: "#c1c6d0", sprite: "angelicblade", desc: "Guarda a memória dos antigos artesãos.", price: 1380 }, cost: { forge_marble_ingot: 5, crystal_ore: 4, mana_shard: 3 }, gold: 650 },
];

/** Acrescenta apenas conteúdo desta expansão; repetidas chamadas não duplicam entradas. */
export function registerForgeExpansion(): void {
  for (const ore of ADVANCED_ORES) {
    if (!ITEMS[ore.id]) ITEMS[ore.id] = { id: ore.id, name: ore.name, type: "material", desc: `Minério característico de ${ore.biomes[0]}.`, color: ore.color, price: 18 + ore.minLevel * 2 };
  }
  for (const { item, recipe } of MATERIALS) {
    if (!ITEMS[item.id]) ITEMS[item.id] = item;
    if (!RECIPES.some((existing) => existing.out === recipe.out)) RECIPES.push(recipe);
  }
  for (const { item, cost, gold } of EQUIPMENT) {
    if (!ITEMS[item.id]) ITEMS[item.id] = item;
    if (!RECIPES.some((existing) => existing.out === item.id)) RECIPES.push({ out: item.id, qty: 1, station: "smith", cost, gold });
  }
}
