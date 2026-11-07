import { describe, expect, it, vi } from "vitest";
import {
  BUILDINGS,
  ROOM,
  TREASURES,
  buildingEnteredKey,
  buildingFloorKey,
  buildingFloors,
  buildingObjectiveKey,
  buildingObjectiveDone,
  buildingsInBounds,
  createInterior,
  doorOf,
  generateFrontierBuildings,
  interiorPlanOf,
  prepareExploration,
  recordBuildingFloor,
} from "./exploration";
import { Game } from "./engine";
import { generateWorld, H, SOLID, T, TS, W } from "./world";

function fakeCtx(canvas: unknown) {
  const store: Record<string | symbol, unknown> = { canvas };
  const noop = () => undefined;
  return new Proxy(store, {
    get: (target, key) =>
      key in target
        ? target[key]
        : key === "createRadialGradient" || key === "createLinearGradient"
          ? () => ({ addColorStop: noop })
          : key === "createImageData"
            ? (w: number, h: number) => ({
                data: new Uint8ClampedArray(w * h * 4),
                width: w,
                height: h,
              })
            : key === "measureText"
              ? () => ({ width: 8 })
              : key === "getImageData"
                ? () => ({ data: new Uint8ClampedArray(4) })
                : noop,
    set: (target, key, value) => {
      target[key] = value;
      return true;
    },
  });
}
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
  this: HTMLCanvasElement,
) {
  return fakeCtx(this) as never;
});

function reachable(
  world: ReturnType<typeof generateWorld>,
  from: [number, number],
  target: [number, number],
) {
  const queue = [from],
    seen = new Set<string>();
  while (queue.length) {
    const point = queue.shift()!;
    const [x, y] = point,
      key = `${x},${y}`;
    if (seen.has(key) || x < 0 || y < 0 || x >= W || y >= H || SOLID.has(world.tiles[y * W + x]!))
      continue;
    seen.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return seen.has(`${target[0]},${target[1]}`);
}

describe("expansão procedural de construções", () => {
  it("preserva os 52 prédios legados e acrescenta pelo menos mil instâncias Frontier", () => {
    expect(BUILDINGS.length).toBeGreaterThanOrEqual(1052);
    expect(BUILDINGS.slice(0, 52).map((building) => building.id)).toContain("forge");
    expect(BUILDINGS.slice(0, 52).map((building) => building.id)).toContain(
      "city_lavender_mercado_do_oasis",
    );
    expect(
      BUILDINGS.slice(52).every((building) => building.id.startsWith("frontier-building-")),
    ).toBe(true);
  });

  it("mantém IDs e assinaturas de design únicos", () => {
    expect(new Set(BUILDINGS.map((building) => building.id)).size).toBe(BUILDINGS.length);
    expect(new Set(BUILDINGS.map((building) => building.designSignature)).size).toBe(
      BUILDINGS.length,
    );
    expect(BUILDINGS.every((building) => building.signature === building.designSignature)).toBe(
      true,
    );
  });

  it("é determinística para a mesma seed e muda a assinatura para outra seed", () => {
    const a = generateFrontierBuildings(17),
      b = generateFrontierBuildings(17),
      c = generateFrontierBuildings(19);
    expect(a).toEqual(b);
    expect(a.map((building) => building.designSignature)).not.toEqual(
      c.map((building) => building.designSignature),
    );
    expect(
      a.every(
        (building) =>
          building.x >= 0 &&
          building.y >= 0 &&
          building.x + building.w < W &&
          building.y + building.h + 3 < H,
      ),
    ).toBe(true);
  });

  it("varia biomas, andares e finalidades incluindo todos os tipos solicitados", () => {
    const generated = BUILDINGS.slice(52);
    expect(new Set(generated.map((building) => building.biome)).size).toBeGreaterThanOrEqual(10);
    expect(new Set(generated.map((building) => building.floors)).size).toBeGreaterThanOrEqual(8);
    expect(Math.min(...generated.map((building) => buildingFloors(building)))).toBe(1);
    expect(Math.max(...generated.map((building) => buildingFloors(building)))).toBe(12);
    const purposes = new Set(generated.map((building) => building.purpose));
    for (const purpose of [
      "house",
      "ruin",
      "laboratory",
      "observatory",
      "forge",
      "archive",
      "inn",
      "mine",
      "dungeon",
    ])
      expect(purposes.has(purpose as never)).toBe(true);
    expect(new Set(generated.map((building) => building.objective?.name)).size).toBe(
      generated.length,
    );
    expect(new Set(generated.map((building) => building.objective?.description)).size).toBe(
      generated.length,
    );
  });

  it("protege entradas, deixa portas fora da colisão e mantém saídas navegáveis", () => {
    const world = generateWorld();
    prepareExploration(world);
    for (const building of BUILDINGS) {
      const door = doorOf(building);
      expect(world.tiles[door.ty * W + door.tx], building.id).toBe(T.DOOR);
      expect(SOLID.has(world.tiles[(door.ty + 1) * W + door.tx]!), building.id).toBe(false);
    }
    const generated = BUILDINGS.slice(52)
      .filter((building) => building.floors && building.floors > 1)
      .slice(0, 18);
    for (const building of generated) {
      for (let floor = 1; floor <= buildingFloors(building); floor++) {
        const interior = createInterior(building, floor);
        expect(
          reachable(
            interior,
            [Math.floor(ROOM.spawnX / TS), Math.floor(ROOM.spawnY / TS)],
            [ROOM.exitX, ROOM.exitY],
          ),
        ).toBe(true);
        const plan = interiorPlanOf(building, floor);
        for (const stair of [plan.stairUp, plan.stairDown])
          if (stair) expect(SOLID.has(interior.tiles[stair.ty * W + stair.tx]!)).toBe(false);
      }
    }
  });

  it("expõe chaves aditivas estáveis para entrada, andar, objetivo e recompensa", () => {
    const building = BUILDINGS.find((entry) => entry.id.startsWith("frontier-building-"))!;
    const discoveries = new Set<string>();
    discoveries.add(buildingEnteredKey(building.id));
    recordBuildingFloor(discoveries, building.id, 3);
    expect(discoveries.has(buildingEnteredKey(building.id))).toBe(true);
    expect(discoveries.has(buildingFloorKey(building.id, 3))).toBe(true);
    expect(buildingObjectiveDone(discoveries, building.id)).toBe(false);
    discoveries.add(buildingObjectiveKey(building.id));
    expect(buildingObjectiveDone(discoveries, building.id)).toBe(true);
    expect(TREASURES.some((treasure) => treasure.id === "village-well")).toBe(true);
  });

  it("integra entrada, subir/descer e objetivo com recompensa no engine", () => {
    localStorage.clear();
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    const game = new Game(canvas);
    const building = BUILDINGS.find(
      (entry) => entry.id.startsWith("frontier-building-") && (entry.floors ?? 1) > 1,
    )!;
    game.doorCooldown = 0;
    expect(game.enterInterior(building)).toBe(true);
    const objectiveFloor = building.objective!.floor;
    if (objectiveFloor > 1) expect(game.changeInteriorFloor(objectiveFloor)).toBe(true);
    const plan = interiorPlanOf(building, objectiveFloor);
    expect(plan.objective).not.toBeNull();
    game.p.x = plan.objective!.tx * TS + 8;
    game.p.y = plan.objective!.ty * TS + 8;
    const goldBefore = game.p.gold;
    expect(game.interactExploration()).toBe(true);
    expect(game.discoveries.has(buildingObjectiveKey(building.id))).toBe(true);
    expect(game.p.gold).toBeGreaterThan(goldBefore);
    game.leaveInterior();
    expect(game.interior).toBeNull();
    expect(game.world).toBe(game.overworld);
  });

  it("faz culling espacial sem retornar fachadas distantes", () => {
    const local = buildingsInBounds(95, 95, 140, 145);
    expect(local.length).toBeGreaterThan(0);
    expect(
      local.every(
        (building) =>
          building.x + building.w >= 89 &&
          building.x <= 146 &&
          building.y + building.h >= 89 &&
          building.y <= 151,
      ),
    ).toBe(true);
    expect(local.length).toBeLessThan(BUILDINGS.length);
  });

  it("mantém o prefixo Frontier legado e só depois emite as colunas novas", () => {
    const generated = generateFrontierBuildings(0);
    expect(generated.length).toBeGreaterThanOrEqual(1000);
    const legacyCount = Math.min(1000, generated.length),
      legacyPrefix = generated.slice(0, legacyCount);
    expect(legacyPrefix.map((building) => building.id)).toEqual(
      legacyPrefix.map((_, index) => `frontier-building-${String(index + 1).padStart(4, "0")}`),
    );
    expect(legacyPrefix.every((building) => building.x < 3200)).toBe(true);
    const firstNew = generated.findIndex((building) => building.x >= 3200);
    expect(firstNew === -1 || firstNew >= 1000).toBe(true);
    if (firstNew >= 0) expect(generated.slice(firstNew).every((building) => building.x >= 3200)).toBe(true);
  });

  it("oferece vinte famílias e vinte layouts interiores determinísticos", () => {
    const generated = BUILDINGS.slice(52),
      architectures = new Set(generated.map((building) => building.architecture)),
      layouts = new Set(generated.map((building) => interiorPlanOf(building).layout));
    expect(architectures.size).toBeGreaterThanOrEqual(20);
    expect(layouts.size).toBeGreaterThanOrEqual(20);
    for (const building of generated.slice(0, 40)) {
      const plan = interiorPlanOf(building, building.objective?.floor ?? 1);
      expect(plan.architecture).toBe(building.architecture);
      expect(plan.obstacles.length).toBeGreaterThanOrEqual(3);
      expect(plan).toEqual(interiorPlanOf(building, building.objective?.floor ?? 1));
    }
  });
});
