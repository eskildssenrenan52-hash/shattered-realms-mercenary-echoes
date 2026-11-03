import { afterEach, describe, expect, it, vi } from "vitest";
import { ITEMS, RECIPES } from "./data";
import { ADVANCED_ORES, registerForgeExpansion } from "./forge-expansion";

const expansionIds = [
  ...ADVANCED_ORES.map((ore) => ore.id),
  ...ADVANCED_ORES.map((ore) => ore.id.replace("_ore", "_ingot")),
  "forge_amber_sabre", "forge_amber_mail", "forge_amber_ring",
  "forge_tide_trident", "forge_tide_coat", "forge_tide_charm",
  "forge_mire_blade", "forge_mire_scale", "forge_mire_band",
  "forge_canopy_bow", "forge_canopy_vest", "forge_canopy_charm",
  "forge_ember_sword", "forge_ember_plate", "forge_ember_ring",
  "forge_mycelium_staff", "forge_mycelium_mantle", "forge_mycelium_ring",
  "forge_moon_glaive", "forge_moon_armor", "forge_moon_ring",
  "forge_marble_blade", "forge_marble_aegis", "forge_marble_ring",
];
const originalItems = new Map<string, (typeof ITEMS)[string] | undefined>();
const originalRecipes = [...RECIPES];
afterEach(() => {
  for (const id of expansionIds) {
    const previous = originalItems.get(id);
    if (previous) ITEMS[id] = previous;
    else delete ITEMS[id];
  }
  RECIPES.splice(0, RECIPES.length, ...originalRecipes);
  originalItems.clear();
});

describe("Expansão da forja", () => {
  it("define oito minérios com bioma e profundidade únicos e progressão válida", () => {
    expect(ADVANCED_ORES).toHaveLength(8);
    expect(new Set(ADVANCED_ORES.map((ore) => ore.id)).size).toBe(8);
    expect(new Set(ADVANCED_ORES.map((ore) => ore.biomes.join(","))).size).toBe(8);
    expect(new Set(ADVANCED_ORES.map((ore) => ore.depth.join("-"))).size).toBe(8);
    for (const ore of ADVANCED_ORES) {
      expect(ore.biomes).toHaveLength(1);
      expect(ore.depth[0]).toBeGreaterThan(0);
      expect(ore.depth[1]).toBeGreaterThan(ore.depth[0]);
      expect(ore.minLevel).toBeGreaterThan(0);
      expect(ore.dropWeight).toBeGreaterThan(0);
      expect(ore.dropWeight).toBeLessThanOrEqual(1);
    }
  });

  it("não altera catálogos até o registro explícito", () => {
    for (const id of expansionIds) originalItems.set(id, ITEMS[id]);
    expect(expansionIds.every((id) => !ITEMS[id])).toBe(true);
    expect(RECIPES).toEqual(originalRecipes);
  });

  it("registra oito materiais e 24 equipamentos sem duplicar em chamadas repetidas", () => {
    for (const id of expansionIds) originalItems.set(id, ITEMS[id]);
    registerForgeExpansion();
    const itemCount = Object.keys(ITEMS).length;
    const recipeCount = RECIPES.length;
    registerForgeExpansion();
    expect(Object.keys(ITEMS)).toHaveLength(itemCount);
    expect(RECIPES).toHaveLength(recipeCount);
    expect(ADVANCED_ORES.every((ore) => ITEMS[ore.id]?.type === "material")).toBe(true);
    expect(RECIPES.filter((recipe) => recipe.out.endsWith("_ingot") && recipe.out.startsWith("forge_")).length).toBe(8);
    expect(RECIPES.filter((recipe) => recipe.out.startsWith("forge_") && !recipe.out.endsWith("_ore") && !recipe.out.endsWith("_ingot")).length).toBe(24);
  });

  it("usa ingredientes existentes, atributos válidos, sprites do arsenal e preserva IDs antigos", () => {
    for (const id of expansionIds) originalItems.set(id, ITEMS[id]);
    const legacy = new Map(["iron_ore", "crystal_ore", "mana_shard", "iron_ingot", "iron_spear", "mana_sword"].map((id) => [id, ITEMS[id]]));
    registerForgeExpansion();
    const recipes = RECIPES.filter((recipe) => expansionIds.includes(recipe.out));
    expect(recipes.length).toBe(32);
    for (const recipe of recipes) {
      expect(ITEMS[recipe.out]).toBeDefined();
      expect(recipe.qty).toBeGreaterThan(0);
      expect(recipe.gold).toBeGreaterThanOrEqual(0);
      expect(Object.keys(recipe.cost).length).toBeGreaterThan(0);
      for (const [ingredient, amount] of Object.entries(recipe.cost)) {
        expect(ITEMS[ingredient], `ingrediente inexistente ${ingredient}`).toBeDefined();
        expect(amount).toBeGreaterThan(0);
      }
    }
    for (const id of expansionIds) {
      const item = ITEMS[id];
      expect(item.id).toBe(id);
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(item.price).toBeGreaterThan(0);
      if (id.includes("_ore") || id.endsWith("_ingot")) expect(item.type).toBe("material");
      else expect(["weapon", "armor", "ring", "amulet"]).toContain(item.type);
      if (item.type === "weapon") {
        expect(item.weapon).toBeDefined();
        expect(item.atk).toBeGreaterThan(0);
      }
      if (item.type === "armor") expect(item.def).toBeGreaterThan(0);
      if (item.sprite) expect(["goldsword", "ironsword", "goldspear", "firesword", "bowsun", "bloodmoonstaff", "timelessglaive", "angelicblade"]).toContain(item.sprite);
    }
    for (const [id, value] of legacy) expect(ITEMS[id]).toBe(value);
  });

  it("não escreve em console durante o registro", () => {
    for (const id of expansionIds) originalItems.set(id, ITEMS[id]);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    registerForgeExpansion();
    expect(log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
