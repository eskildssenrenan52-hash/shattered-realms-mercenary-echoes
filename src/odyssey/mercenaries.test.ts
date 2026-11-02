import { describe, expect, it, vi } from "vitest";
import { MERCENARIES, mercSheetKey, MERC_BY_ID, assignMercenary, freshMercenaryState, mercenaryStory, recruitMercenary, rollMercenary, sanitizeMercenaryState } from "./mercenaries";
import type { Game } from "./engine";

const fake = () => ({
  p: { gold: 1000, x: 80, y: 80, hp: 100 }, mercenaries: freshMercenaryState(), toast: vi.fn(), float: vi.fn(), save: vi.fn(), maxHp: () => 100,
} as unknown as Game);

describe("mercenários", () => {
  it("migra saves parciais, remove IDs inválidos e preserva slots válidos", () => {
    const state = sanitizeMercenaryState({ roster: [{ id: "ferrovia", level: 2, hp: 40 }], active: ["ferrovia", "fantasma"], contractSeals: 4, pity: 3 });
    expect(state.roster[0]?.id).toBe("ferrovia");
    expect(state.active).toEqual(["ferrovia", null]);
    expect(state.contractSeals).toBe(4);
    expect(state.roster[0]?.hp).toBe(40);
  });
  it("contrata uma vez, impede duplicata e equipa em dois slots sem duplicar a pessoa", () => {
    const g = fake();
    expect(recruitMercenary(g, "ferrovia")).toBe(true);
    expect(recruitMercenary(g, "ferrovia")).toBe(false);
    expect(assignMercenary(g, "ferrovia", 0)).toBe(true);
    expect(assignMercenary(g, "ferrovia", 1)).toBe(true);
    expect(g.mercenaries.active).toEqual([null, "ferrovia"]);
  });
  it("usa pity para garantir raridade Raro ou superior", () => {
    const g = fake(); g.mercenaries.pity = 9;
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const result = rollMercenary(g, "seal");
    random.mockRestore();
    expect(result).toBeTruthy();
    expect(["raro", "epico", "lendario"]).toContain(result?.rarity);
    expect(g.mercenaries.pity).toBe(0);
  });
  it("mantém capítulos narrativos distintos e coerentes com a personagem", () => {
    expect(mercenaryStory("lia-azul", 0)).toContain("Lia Azul");
    expect(mercenaryStory("rei-sem-rosto", 4)).toContain("promessa");
    expect(MERC_BY_ID["mae-das-brumas"]?.recoverySeconds).toBeGreaterThan(40);
  });
  it("tem dez mercenários, cada um com folha de sprite de IA registrada como as skins", async () => {
    const { K_SHEETS } = await import("./kaetram");
    expect(MERCENARIES).toHaveLength(10);
    for (const m of MERCENARIES) {
      expect(m.sheet).toBe(`/mercenaries/sheets/${m.id}.png`);
      expect(K_SHEETS[mercSheetKey(m.id)]?.anims).toEqual(K_SHEETS["player/base"]?.anims);
      expect(K_SHEETS[`player/weapon/${m.weapon}`]).toBeTruthy();
    }
  });
  it("mantém os cinco contratos originais nas primeiras posições", () => {
    expect(MERCENARIES.slice(0, 5).map((m) => m.id)).toEqual(["ferrovia", "mae-das-brumas", "irmao-cinzas", "lia-azul", "rei-sem-rosto"]);
  });
});
