import { describe, it, expect } from "vitest";
import { SENHOR_BOSSES } from "./senhores";
import { beatsFor } from "./story";
import { generateWorld, BIOME_LIST, W } from "./world";

describe("Senhores das Terras", () => {
  it("adiciona oito chefes únicos, um em cada bioma antigo sem guardião", () => {
    expect(SENHOR_BOSSES.map((b) => b.biome).sort()).toEqual(["autumn", "coast", "jungle", "meadow", "mushroom", "ruins", "swamp", "volcanic"]);
  });
  it("cada chefe fica no próprio bioma e tem cena de chegada e de vitória", () => {
    const w = generateWorld();
    for (const b of SENHOR_BOSSES) {
      expect(BIOME_LIST[w.biomes[b.ty * W + b.tx]!], b.id).toBe(b.biome);
      expect(beatsFor(`boss:intro:${b.id}`)).toHaveLength(1);
      expect(beatsFor(`boss:${b.id}`)).toHaveLength(1);
    }
  });
});
