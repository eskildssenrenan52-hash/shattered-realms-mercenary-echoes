import { describe, expect, it } from "vitest";
import { QUESTS } from "./data";

const cities = [
  { prefix: "city_lumen", first: "city_lumen_petals" },
  { prefix: "city_prism", first: "city_prism_hum" },
  { prefix: "city_tide", first: "city_tide_bells" },
  { prefix: "city_zephyr", first: "city_zephyr_bridge" },
  { prefix: "city_amber", first: "city_amber_lens" },
  { prefix: "city_storm", first: "city_storm_drums" },
  { prefix: "city_mycelium", first: "city_mycelium_glow" },
  { prefix: "city_marble", first: "city_marble_memory" },
] as const;

const oldIds = [
  ...cities.map((city) => city.first),
  ...cities.flatMap((city) => [`${city.prefix}_2`, `${city.prefix}_3`]),
];

describe("cadeias das cidades de fronteira", () => {
  it("dobra de 24 para 48 missões mantendo os IDs originais e liberando seis etapas por cidade", () => {
    const quests = QUESTS.filter((quest) => quest.id.startsWith("city_"));
    expect(quests).toHaveLength(48);
    expect(quests.slice(0, 24).map((quest) => quest.id)).toEqual(oldIds);
    expect(new Set(quests.map((quest) => quest.id)).size).toBe(48);

    for (const city of cities) {
      const chain = [
        city.first,
        ...Array.from({ length: 5 }, (_, index) => `${city.prefix}_${index + 2}`),
      ].map((id) => QUESTS.find((quest) => quest.id === id));
      expect(chain.every(Boolean), city.prefix).toBe(true);
      expect(chain[0]!.requires).toBeUndefined();
      for (let index = 1; index < chain.length; index++)
        expect(chain[index]!.requires, `${city.prefix} etapa ${index + 1}`).toBe(chain[index - 1]!.id);
      expect(chain.every((quest) => !quest!.main)).toBe(true);
    }
  });
});
