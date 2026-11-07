import { describe, expect, it } from "vitest";
import { generateWorld, H, W, BIOME_LIST, SOLID } from "./world";
import { frontierBiomeAt, LEGACY_WORLD_W, WORLD_COLUMNS, WORLD_ROWS } from "./frontier";

describe("geração por seed do continente", () => {
  it("mantém o mapa legado byte a byte na seed padrão", () => {
    const world = generateWorld();
    let signature = 2166136261;
    for (let y = 0; y < 2400; y++) {
      for (let x = 0; x < 3200; x++) {
        const index = y * W + x;
        signature = Math.imul(signature ^ world.tiles[index]!, 16777619);
        signature = Math.imul(signature ^ world.biomes[index]!, 16777619);
      }
    }
    expect(W).toBe(6400);
    expect(H).toBe(2400);
    expect(W * H).toBe(3200 * 2400 * 2);
    expect(WORLD_COLUMNS).toBe(20);
    expect(WORLD_ROWS).toBe(10);
    expect(signature >>> 0).toBe(4135917396);
  });

  it("gera setores novos determinísticos e caminháveis à direita", () => {
    const a = generateWorld(2764087), b = generateWorld(2764087);
    for (const row of [0, 4, 9]) for (const column of [10, 14, 19]) {
      const tx = column * 320 + 160, ty = row * 240 + 120, index = ty * W + tx;
      expect(a.biomes[index]).toBe(b.biomes[index]);
      expect(a.tiles[index]).toBe(b.tiles[index]);
      expect(BIOME_LIST[a.biomes[index]!]).toBe(frontierBiomeAt(tx, ty));
      expect(SOLID.has(a.tiles[index]!)).toBe(false);
    }
    expect(LEGACY_WORLD_W).toBe(3200);
  });

  it("gera terreno procedural diferente por seed sem alterar dimensões", () => {
    const legacy = generateWorld();
    const farlands = generateWorld(2764087);
    expect(farlands.tiles).toHaveLength(legacy.tiles.length);
    expect(farlands.biomes).toHaveLength(legacy.biomes.length);
    const samples = [0, 122 * W + 126, 315 * W + 215, 900 * W + 1800, 2100 * W + 3000];
    expect(samples.some((index) => farlands.tiles[index] !== legacy.tiles[index] || farlands.biomes[index] !== legacy.biomes[index])).toBe(true);
  });
});
