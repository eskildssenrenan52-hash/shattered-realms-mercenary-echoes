import { describe, expect, it, vi } from "vitest";
import { Game } from "./engine";

const fakeCtx = (canvas: unknown) => {
  const store: Record<string | symbol, unknown> = { canvas };
  const noop = () => undefined;
  return new Proxy(store, { get: (target, key) => key in target ? target[key] : key === "createLinearGradient" || key === "createRadialGradient" ? () => ({ addColorStop: noop }) : key === "createImageData" ? (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }) : key === "getImageData" ? () => ({ data: new Uint8ClampedArray(16 * 16 * 4), width: 16, height: 16 }) : key === "measureText" ? () => ({ width: 8 }) : noop, set: (target, key, value) => { target[key] = value; return true; } });
};
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement) { return fakeCtx(this) as never; });

describe("migração defensiva de saves", () => {
  it("recupera skills, listas e espíritos com tipos corrompidos", () => {
    localStorage.setItem("golden-arrow-save", JSON.stringify({
      p: { skills: ["barreira"], spirits: {}, spell: {}, equip: { weapon: "missing" } },
      discoveries: {}, openedChests: "broken", statues: {}, bosses: {}, seenBeats: {}, inventory: {},
    }));
    const canvas = document.createElement("canvas"); canvas.width = 480; canvas.height = 270;
    const game = new Game(canvas);
    expect(() => game.load()).not.toThrow();
    expect(game.p.skills).toEqual({});
    expect(game.p.learnedSkills).toEqual(["barreira"]);
    expect(game.p.spirits.length).toBeGreaterThan(0);
    expect(game.inventory).toEqual([]);
    expect(() => game.skillRanks()).not.toThrow();
  });
});
