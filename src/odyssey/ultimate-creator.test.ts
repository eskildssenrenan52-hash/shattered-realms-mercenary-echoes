import { describe, expect, it } from "vitest";
import { calculateUltimateCost, craftUltimate, normalizeUltimate } from "./ultimate-creator";

function mockGame(overrides: Record<string, unknown> = {}) {
  const items: Record<string, number> = { void_essence: 10, eco_shard: 10, mana_shard: 20, crystal_ore: 80 };
  const g = {
    p: { level: 12, gold: 100000, mp: 999, str: 5, int: 12, ultimate: null },
    count: (id: string) => items[id] ?? 0,
    removeItem: (id: string, qty: number) => { items[id] = (items[id] ?? 0) - qty; },
    stats: () => ({ str: 12, dex: 8, vit: 8, int: 18, wis: 14 }),
    save: () => undefined,
    toast: () => undefined,
    ...overrides,
  } as any;
  return g;
}

describe("Ultimate Creator", () => {
  it("cobra custo maior para uma combinação mais específica", () => {
    const g = mockGame();
    const simple = calculateUltimateCost(g, { school: "arcane", form: "nova", modifier: "freeze", target: "single", essence: "eco_shard" });
    const precise = calculateUltimateCost(g, { school: "void", form: "storm", modifier: "echo", target: "all", essence: "void_essence" });
    expect(precise.gold).toBeGreaterThan(simple.gold);
    expect(precise.mana).toBeGreaterThan(simple.mana);
    expect(precise.specificity).toBeGreaterThan(simple.specificity);
  });
  it("recusa ritual sem nível ou recursos e não muta o jogador", () => {
    const g = mockGame({ p: { level: 7, gold: 0, mp: 0 } });
    const result = craftUltimate(g, { name: "Teste", school: "void", form: "storm", modifier: "echo", target: "all", essence: "void_essence" });
    expect(result.ok).toBe(false);
    expect(result.ultimate).toBeNull();
  });
  it("forja, consome recursos e gera qualidade persistível", () => {
    const g = mockGame();
    const result = craftUltimate(g, { name: "Eclipse da Última Aurora", school: "void", form: "storm", modifier: "echo", target: "all", essence: "void_essence" });
    expect(result.ok).toBe(true);
    expect(result.ultimate?.quality).toBeGreaterThanOrEqual(76);
    expect(result.ultimate?.name).toBe("Eclipse da Última Aurora");
    expect(g.p.gold).toBeLessThan(100000);
    expect(g.p.mp).toBeLessThan(999);
  });
  it("normaliza saves inválidos sem permitir enums ou números corruptos", () => {
    expect(normalizeUltimate({ name: "ok", school: "hack", form: "nova" })).toBeNull();
    const safe = normalizeUltimate({ name: "x", school: "arcane", form: "nova", modifier: "pierce", target: "single", essence: "eco_shard", quality: 500, tier: "Mítico", damage: 8, radius: 3, cooldown: 0, mpCost: 0, charges: 1, createdAtLevel: 0 });
    expect(safe?.quality).toBe(100);
    expect(safe?.radius).toBe(12);
    expect(safe?.cooldown).toBeGreaterThan(0);
  });
});
