import { describe, expect, it } from "vitest";
import { Game } from "./engine";
import { walkFollowerToward } from "./follower-navigation";
import { bodyBlockedAt, H, T, TS, W, type World } from "./world";

function testWorld(): World {
  return {
    tiles: new Uint8Array(W * H).fill(T.FLOOR),
    biomes: new Uint8Array(W * H),
    nodes: [],
  };
}
function testGame(world: World): Game {
  return { world, moveBody: Game.prototype.moveBody } as unknown as Game;
}

describe("follower navigation", () => {
  it("walks around a wall without passing through it or freezing behind it", () => {
    const world = testWorld();
    const wallX = 8;
    for (let ty = 6; ty <= 13; ty++) world.tiles[ty * W + wallX] = T.WALL;
    const game = testGame(world);
    const body = { x: 5 * TS + 8, y: 10 * TS + 8 };
    const target = { x: 12 * TS + 8, y: 10 * TS + 8 };

    for (let i = 0; i < 240; i++) {
      walkFollowerToward(game, "test-follower", body, target, 120, 1 / 60);
      expect(bodyBlockedAt(world, body.x, body.y, 4, 3)).toBe(false);
    }

    expect(Math.hypot(body.x - target.x, body.y - target.y)).toBeLessThan(12);
  });

  it("uses a speed cap instead of snapping toward a distant target", () => {
    const world = testWorld();
    const game = testGame(world);
    const body = { x: 50, y: 100 };
    const target = { x: 650, y: 100 };
    walkFollowerToward(game, "far-follower", body, target, 120, 1 / 60);
    expect(body.x).toBeGreaterThan(50);
    expect(body.x).toBeLessThan(54);
    expect(body.x).not.toBe(target.x);
  });

  it("prevents tunneling when a single movement step is larger than a wall tile", () => {
    const world = testWorld();
    const wallX = 14;
    const wallY = 12;
    world.tiles[wallY * W + wallX] = T.WALL;
    const game = testGame(world);
    const body = { x: wallX * TS - 20, y: wallY * TS + 8 };

    Game.prototype.moveBody.call(game, body, 60, 0, 4, 3);

    expect(body.x + 4).toBeLessThan(wallX * TS);
    expect(bodyBlockedAt(world, body.x, body.y, 4, 3)).toBe(false);
  });
});
