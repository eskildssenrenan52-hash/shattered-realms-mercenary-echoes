import { beforeEach, describe, expect, it } from "vitest";
import { findWalkableRoute } from "./quest-routing";
import { H, T, W, type World } from "./world";

const world: World = { tiles: new Uint8Array(W * H), biomes: new Uint8Array(1), nodes: [] };

beforeEach(() => world.tiles.fill(T.GRASS));

describe("rotas pontilhadas de missão", () => {
  it("liga duas posições caminháveis sem diagonalizar cantos", () => {
    const route = findWalkableRoute(world, { tx: 20, ty: 20 }, { tx: 28, ty: 24 });
    expect(route.at(-1)).toEqual({ tx: 28, ty: 24 });
    const fullPath = [{ tx: 20, ty: 20 }, ...route];
    for (let i = 1; i < fullPath.length; i++) {
      const prev = fullPath[i - 1]!;
      const next = fullPath[i]!;
      expect(Math.abs(prev.tx - next.tx) + Math.abs(prev.ty - next.ty)).toBe(1);
    }
  });

  it("contorna paredes e nunca inclui tiles sólidos no traçado", () => {
    for (let ty = 4; ty <= 10; ty++) world.tiles[ty * W + 24] = T.TREE;
    const route = findWalkableRoute(world, { tx: 20, ty: 7 }, { tx: 28, ty: 7 });
    expect(route.length).toBeGreaterThan(0);
    expect(route.some((tile) => tile.ty < 4 || tile.ty > 10)).toBe(true);
    expect(route.every((tile) => world.tiles[tile.ty * W + tile.tx] !== T.TREE)).toBe(true);
  });

  it("não inventa um trajeto quando origem e destino já são o mesmo tile", () => {
    expect(findWalkableRoute(world, { tx: 12, ty: 12 }, { tx: 12, ty: 12 })).toEqual([]);
  });
});
