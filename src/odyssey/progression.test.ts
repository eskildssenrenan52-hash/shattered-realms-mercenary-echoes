import { describe, expect, it } from "vitest";
import { buySkill, canBuySkill, freshSkillRanks, panelUnlockLevel, panelUnlocked, skillBonuses } from "./progression";

describe("progressão por nível e árvore de habilidades", () => {
  it("libera apenas o núcleo no nível inicial e abre sistemas em marcos", () => {
    expect(panelUnlocked(1, "inv")).toBe(true);
    expect(panelUnlocked(1, "char")).toBe(true);
    expect(panelUnlocked(1, "quest")).toBe(false);
    expect(panelUnlockLevel("mercenaries")).toBe(12);
    expect(panelUnlocked(12, "mercenaries")).toBe(true);
  });
  it("respeita custo, nível, requisito e idempotência", () => {
    const ranks = freshSkillRanks();
    expect(canBuySkill(1, 1, ranks, "vigor")).toBe(false);
    const first = buySkill(2, 1, ranks, "vigor");
    expect(first.ok).toBe(true);
    expect(first.points).toBe(0);
    expect(first.ranks.vigor).toBe(1);
    expect(buySkill(2, 0, first.ranks, "iron_skin").ok).toBe(false);
  });
  it("transforma ranks em bônus determinísticos", () => {
    const result = buySkill(10, 10, { vigor: 1, focus: 2, iron_skin: 1, swift_step: 2, echo_ward: 1 }, "battle_rhythm");
    const b = skillBonuses(result.ranks);
    expect(b.hp).toBe(6);
    expect(b.mp).toBe(8);
    expect(b.defense).toBe(2);
    expect(b.speed).toBeCloseTo(1.06);
    expect(b.damageTaken).toBeCloseTo(0.97);
  });
});
