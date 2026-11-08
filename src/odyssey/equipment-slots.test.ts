import { describe, expect, it } from "vitest";
import { ITEMS, type Slot } from "./data";

describe("arsenal Kaetram e slots expandidos", () => {
  it("expõe oito slots sem remover os quatro legados", () => {
    const slots: Slot[] = ["weapon", "armor", "helmet", "gloves", "boots", "shield", "ring", "amulet"];
    expect(slots).toHaveLength(8);
    expect(slots.slice(0, 2)).toEqual(["weapon", "armor"]);
    expect(slots).toContain("helmet");
    expect(slots).toContain("shield");
  });
  it("usa sprites Kaetram locais nos quatro slots novos", () => {
    expect(ITEMS["kae_iron_helmet"].sprite).toBe("ironhelmet");
    expect(ITEMS["kae_gold_bracer"].sprite).toBe("braceletgoldruby");
    expect(ITEMS["kae_steel_boots"].sprite).toBe("steelboots");
    expect(ITEMS["kae_iron_shield"].sprite).toBe("ironroundshield");
  });
  it("atribui cada item novo ao slot certo e fornece bônus", () => {
    for (const [id, slot] of [["kae_iron_helmet", "helmet"], ["kae_gold_bracer", "gloves"], ["kae_steel_boots", "boots"], ["kae_iron_shield", "shield"]] as const) {
      expect(ITEMS[id].type).toBe(slot);
      expect((ITEMS[id].def ?? 0) + Object.keys(ITEMS[id].bonus ?? {}).length).toBeGreaterThan(0);
    }
  });
});
