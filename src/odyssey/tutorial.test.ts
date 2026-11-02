import { describe, expect, it } from "vitest";
import { TUTORIAL_BOSS_ID, TUTORIAL_FLOORS, tutorialFloorData } from "./depthplay";

describe("Treino de Aventureiro", () => {
  it("tem seis pisos determinísticos e preserva o ID do Guardião final", () => {
    expect(TUTORIAL_FLOORS).toBe(6);
    for (let floor = 1; floor <= TUTORIAL_FLOORS; floor++) {
      const first = tutorialFloorData(floor);
      const second = tutorialFloorData(floor);
      expect(first.floor).toBe(floor);
      expect(first.spawns).toEqual(second.spawns);
      expect(first.spawns.length, `piso ${floor}, salas ${first.rooms.length}`).toBeGreaterThan(0);
      expect(
        first.spawns.every((spawn) => spawn.level >= 1 && spawn.level <= 3 && !spawn.elite),
      ).toBe(true);
      if (floor < TUTORIAL_FLOORS) expect(first.boss).toBeNull();
      else expect(first.boss?.id).toBe(TUTORIAL_BOSS_ID);
    }
  });

  it("inclui baús garantidos de poções e éter nas etapas de prática", () => {
    const supplies = tutorialFloorData(3).chests.find((chest) => chest.id === "tutorial-3-supply");
    const ether = tutorialFloorData(5).chests.find((chest) => chest.id === "tutorial-5-ether");
    expect(supplies).toMatchObject({ item: "hi_potion", qty: 2, gold: 24 });
    expect(ether).toMatchObject({ item: "ether", qty: 2, gold: 12 });
  });
});
