import { describe, expect, it } from "vitest";
import { BOSSES, ENEMIES, ITEMS, NPCS, QUESTS } from "./data";
import { BIOME_LIST } from "./world";

describe("deep route quest expansion", () => {
  const routes = QUESTS.filter((q) => q.id.startsWith("deep_route_"));
  it("adds exactly 24 optional chains of four stages", () => {
    expect(routes).toHaveLength(96);
    expect(routes.every((q) => !q.main)).toBe(true);
    for (let route = 1; route <= 24; route++) {
      const chain = routes.filter((q) => q.id.startsWith(`deep_route_${String(route).padStart(2, "0")}_`));
      expect(chain.map((q) => q.id)).toEqual([1, 2, 3, 4].map((stage) => `deep_route_${String(route).padStart(2, "0")}_${stage}`));
    }
  });
  it("keeps IDs unique and all goal/reward references valid", () => {
    expect(new Set(QUESTS.map((q) => q.id)).size).toBe(QUESTS.length);
    const npcIds = new Set(NPCS.map((n) => n.id));
    const bossIds = new Set(BOSSES.map((b) => b.id));
    for (const q of routes) {
      const g = q.goal;
      if (g.kind === "kill") expect(ENEMIES[g.target]).toBeDefined();
      if (g.kind === "boss") expect(bossIds.has(g.target)).toBe(true);
      if (g.kind === "collect") expect(ITEMS[g.item]).toBeDefined();
      if (g.kind === "talk") expect(npcIds.has(g.npc)).toBe(true);
      if (g.kind === "mine") expect(BIOME_LIST).toContain(g.biome);
      for (const item of q.reward.items ?? []) expect(ITEMS[item]).toBeDefined();
    }
  });
  it("uses valid, acyclic prerequisites and covers every supported goal kind", () => {
    const byId = new Map(QUESTS.map((q) => [q.id, q]));
    const goalKinds = new Set(routes.map((q) => q.goal.kind));
    expect(goalKinds).toEqual(new Set(["kill", "boss", "collect", "talk", "floor", "mine"]));
    expect(routes.some((q) => (q.requiresAll?.length ?? 0) > 1)).toBe(true);
    for (const q of routes) {
      for (const requirement of [q.requires, ...(q.requiresAll ?? [])].filter((id): id is string => Boolean(id))) {
        expect(byId.has(requirement)).toBe(true);
      }
    }
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string) => {
      if (visited.has(id)) return;
      expect(visiting.has(id)).toBe(false);
      visiting.add(id);
      const q = byId.get(id)!;
      for (const dependency of [q.requires, ...(q.requiresAll ?? [])].filter((x): x is string => Boolean(x))) visit(dependency);
      visiting.delete(id);
      visited.add(id);
    };
    routes.forEach((q) => visit(q.id));
  });
});
