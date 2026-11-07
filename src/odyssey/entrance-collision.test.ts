import { describe, expect, it } from "vitest";
import { BUILDINGS, doorOf, prepareExploration } from "./exploration";
import { carveEntrances } from "./depthplay";
import { biomeMineEntrances, carveBiomeMineEntrances } from "./biome-mine-sites";
import { carveMainFarlandsGate } from "./farlands-play";
import { generateWorld, T, W } from "./world";

describe("Geração combinada de portas e entradas", () => {
  it("preserva a soleira do Mercado do Oásis após cada carver do mapa completo", () => {
    const world = generateWorld();
    const building = BUILDINGS.find((entry) => entry.id === "city_lavender_mercado_do_oasis")!;
    const door = doorOf(building);
    const tile = () => world.tiles[door.ty * W + door.tx];
    const stages: [string, number][] = [];

    prepareExploration(world);
    stages.push(["prepareExploration", tile()]);
    carveEntrances(world);
    stages.push(["carveEntrances", tile()]);
    carveMainFarlandsGate(world);
    stages.push(["carveMainFarlandsGate", tile()]);
    carveBiomeMineEntrances(world);
    stages.push(["carveBiomeMineEntrances", tile()]);

    expect(stages).toEqual([
      ["prepareExploration", T.DOOR],
      ["carveEntrances", T.DOOR],
      ["carveMainFarlandsGate", T.DOOR],
      ["carveBiomeMineEntrances", T.DOOR],
    ]);
  });

  it("mantém as entradas de minas afastadas de todas as soleiras", () => {
    const world = generateWorld();
    prepareExploration(world);
    const entrances = biomeMineEntrances(world);
    for (const building of BUILDINGS) {
      const door = doorOf(building);
      expect(
        entrances.every(
          (entrance) => Math.hypot(entrance.tx - door.tx, entrance.ty - door.ty) >= 3,
        ),
        building.id,
      ).toBe(true);
    }
  });
});
