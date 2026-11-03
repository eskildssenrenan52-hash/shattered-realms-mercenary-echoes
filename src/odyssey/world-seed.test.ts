import { describe, expect, it } from "vitest";
import { generateWorld, H, W } from "./world";

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
    expect(W).toBe(3200);
    expect(H).toBe(2400);
    expect(signature >>> 0).toBe(4135917396);
  });

  it("gera terreno procedural diferente sem redimensionar o mapa", () => {
    const legacy = generateWorld();
    const farlands = generateWorld(2764087);
    expect(farlands.tiles).toHaveLength(legacy.tiles.length);
    expect(farlands.biomes).toHaveLength(legacy.biomes.length);
    const samples = [0, 122 * W + 126, 315 * W + 215, 900 * W + 1800, 2100 * W + 3000];
    expect(samples.some((index) => farlands.tiles[index] !== legacy.tiles[index] || farlands.biomes[index] !== legacy.biomes[index])).toBe(true);
  });
});
