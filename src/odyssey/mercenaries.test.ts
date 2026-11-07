import { describe, expect, it, vi } from "vitest";
import { HERO_SKINS } from "./hero-sprite";
import { K_SHEETS } from "./kaetram";
import type { Enemy, Game } from "./engine";
import {
  MERCENARIES,
  MERC_BY_ID,
  MERCENARY_GOLD_COST,
  MERCENARY_PITY_LIMIT,
  MERCENARY_SEAL_COST,
  MERC_SNAP_DISTANCE,
  assignMercenary,
  dismissMercenary,
  formationAnchor,
  freshMercenaryState,
  mercSheetKey,
  mercenaryFilter,
  mercenaryStory,
  mercenaryUnlocked,
  recommendMercenaryDuo,
  recruitMercenary,
  rollMercenary,
  sanitizeMercenaryState,
  tickMercenaries,
} from "./mercenaries";

type StubEnemy = Pick<Enemy, "id" | "x" | "y" | "hp" | "maxhp" | "atk" | "alive"> & {
  summoned?: boolean;
};

const fake = () => {
  const g = {
    p: { gold: 5000, x: 80, y: 80, hp: 100, level: 40 },
    mercenaries: freshMercenaryState(),
    discoveries: new Set<string>(),
    bossesDone: new Set<string>(),
    clock: 0,
    enemies: [] as StubEnemy[],
    interior: null,
    depth: null,
    toast: vi.fn(),
    float: vi.fn(),
    save: vi.fn(),
    maxHp: () => 100,
    damageEnemy: vi.fn((enemy: StubEnemy, amount: number) => {
      enemy.hp -= amount;
      if (enemy.hp <= 0) enemy.alive = false;
    }),
  };
  return g as unknown as Game;
};

describe("mercenários", () => {
  it("migra saves antigos e sanitiza slots, formação e postura", () => {
    const state = sanitizeMercenaryState({
      roster: [
        { id: "ferrovia", level: 2, hp: 40, state: "reserva" },
        { id: "mae-das-brumas", level: 1, hp: 66, state: "reserva" },
      ],
      active: ["ferrovia", "ferrovia"],
      contractSeals: 4,
      pity: 3,
    });
    expect(state.roster.map((m) => m.id)).toEqual(["ferrovia", "mae-das-brumas"]);
    expect(state.active).toEqual(["ferrovia", null]);
    expect(state.roster[0]?.state).toBe("ativo");
    expect(state.contractSeals).toBe(4);
    expect(state.formation).toBe("line");
    expect(state.stance).toBe("balanced");
    expect(state.roster[0]?.hp).toBe(40);
  });

  it("preserva os cinco contratos legados, adiciona 24 personagens distintos e mantém IDs únicos", () => {
    expect(MERCENARIES.length).toBeGreaterThanOrEqual(44);
    expect(new Set(MERCENARIES.map((m) => m.id)).size).toBe(MERCENARIES.length);
    expect(MERCENARIES.slice(0, 5).map((m) => m.id)).toEqual([
      "ferrovia",
      "mae-das-brumas",
      "irmao-cinzas",
      "lia-azul",
      "rei-sem-rosto",
    ]);
    const added = MERCENARIES.slice(20, 44);
    expect(added).toHaveLength(24);
    expect(new Set(added.map((m) => m.name)).size).toBe(24);
    expect(new Set(added.map((m) => m.lore)).size).toBe(24);
    expect(new Set(added.map((m) => m.element)).size).toBe(24);
    expect(new Set(added.map((m) => `${m.maxHp}:${m.atk}:${m.def}:${m.speed}`)).size).toBe(24);
    expect(new Set(added.map((m) => m.minLevel)).size).toBe(24);
    expect(new Set(added.map((m) => m.color)).size).toBe(24);
  });

  it("usa folhas e retratos reais compartilhados, filtro determinístico e armas disponíveis", () => {
    for (const m of MERCENARIES) {
      expect(m.sheet).toBe("/kaetram/img/sprites/player/base.png");
      expect(m.portrait).toBe("/kaetram/img/sprites/player/base.png");
      expect(K_SHEETS[mercSheetKey(m.id)]?.url).toBe("/kaetram/img/sprites/player/base.png");
      expect(K_SHEETS[`player/weapon/${m.weapon}`]).toBeTruthy();
      expect(mercenaryFilter(m.id)).toContain("hue-rotate");
    }
  });

  it("oferece 24 skins de paleta no fim sem alterar índices legados", () => {
    expect(HERO_SKINS.slice(0, 9).every((s) => s.sheet.startsWith("player/"))).toBe(true);
    expect(HERO_SKINS.slice(9, 15).every((s) => s.sheet.startsWith("hero/") && s.ai)).toBe(true);
    const palette = HERO_SKINS.slice(15);
    expect(palette.length).toBeGreaterThanOrEqual(24);
    expect(palette).toHaveLength(24);
    expect(
      palette.every((s) => s.sheet.startsWith("hero/palette/") && s.paletteFilter && s.ai),
    ).toBe(true);
    expect(new Set(palette.map((s) => s.name)).size).toBe(24);
  });

  it("aplica gates de nível e progresso antes de permitir um contrato", () => {
    const g = fake();
    const def = MERC_BY_ID["brisa-lanterna"]!;
    g.p.level = def.minLevel - 1;
    expect(mercenaryUnlocked(g, def)).toBe(false);
    g.p.level = def.minLevel;
    expect(mercenaryUnlocked(g, def)).toBe(false);
    g.discoveries!.add(def.progressKey!);
    expect(mercenaryUnlocked(g, def)).toBe(true);
    expect(recruitMercenary(g, def.id)).toBe(true);
  });

  it("cobra custos substanciais e só garante pity no limite estendido", () => {
    const g = fake();
    g.mercenaries.pity = MERCENARY_PITY_LIMIT - 1;
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const beforeGold = g.p.gold;
    const result = rollMercenary(g, "gold");
    random.mockRestore();
    expect(result).toBeTruthy();
    expect(["raro", "epico", "lendario"]).toContain(result?.rarity);
    expect(g.p.gold).toBe(beforeGold - MERCENARY_GOLD_COST);
    expect(g.mercenaries.pity).toBe(0);
    expect(MERCENARY_GOLD_COST).toBeGreaterThan(140);
    expect(MERCENARY_SEAL_COST).toBeGreaterThan(1);
  });

  it("não cobra quando o pool está vazio", () => {
    const g = fake();
    for (const def of MERCENARIES) {
      if (def.progressKey) g.mercenaries.chapters.push(def.progressKey);
      expect(recruitMercenary(g, def.id)).toBe(true);
    }
    const before = {
      gold: g.p.gold,
      seals: g.mercenaries.contractSeals,
      rolls: g.mercenaries.totalRolls,
      pity: g.mercenaries.pity,
    };
    expect(rollMercenary(g, "gold")).toBeNull();
    expect(rollMercenary(g, "seal")).toBeNull();
    expect(g.p.gold).toBe(before.gold);
    expect(g.mercenaries.contractSeals).toBe(before.seals);
    expect(g.mercenaries.totalRolls).toBe(before.rolls);
    expect(g.mercenaries.pity).toBe(before.pity);
  });

  it("substitui slot sem deixar o companheiro anterior ativo e recomenda uma dupla", () => {
    const g = fake();
    recruitMercenary(g, "ferrovia");
    recruitMercenary(g, "mae-das-brumas");
    recruitMercenary(g, "lia-azul");
    expect(assignMercenary(g, "ferrovia", 0)).toBe(true);
    expect(assignMercenary(g, "lia-azul", 1)).toBe(true);
    expect(assignMercenary(g, "mae-das-brumas", 0)).toBe(true);
    expect(g.mercenaries.active).toEqual(["mae-das-brumas", "lia-azul"]);
    expect(g.mercenaries.roster.find((m) => m.id === "ferrovia")?.state).toBe("reserva");
    expect(dismissMercenary(g, 1)).toBe(true);
    expect(g.mercenaries.roster.find((m) => m.id === "lia-azul")?.state).toBe("reserva");
    expect(recommendMercenaryDuo(g)).toBe(true);
    expect(new Set(g.mercenaries.active.filter(Boolean)).size).toBe(
      g.mercenaries.active.filter(Boolean).length,
    );
  });

  it("segue dentro de casa, reaparece após teleporte e usa formation anchor", () => {
    const g = fake();
    g.interior = {} as NonNullable<Game["interior"]>;
    recruitMercenary(g, "ferrovia");
    assignMercenary(g, "ferrovia", 0);
    g.p.x += 60;
    const m = g.mercenaries.roster[0]!;
    for (let i = 0; i < 60; i++) tickMercenaries(g, 1 / 60);
    const anchor = formationAnchor(g, 0);
    expect(Math.hypot(m.x - anchor.x, m.y - anchor.y)).toBeLessThan(8);
    g.p.x += MERC_SNAP_DISTANCE + 500;
    tickMercenaries(g, 1 / 60);
    expect(m.x).toBe(formationAnchor(g, 0).x);
    expect(m.y).toBe(formationAnchor(g, 0).y);
  });

  it("aproxima-se em combate em postura agressiva/balanceada e volta à formação", () => {
    const g = fake();
    recruitMercenary(g, "ferrovia");
    assignMercenary(g, "ferrovia", 0);
    const m = g.mercenaries.roster[0]!;
    const target: StubEnemy = {
      id: 1,
      x: g.p.x + 80,
      y: g.p.y,
      hp: 100,
      maxhp: 100,
      atk: 0,
      alive: true,
      summoned: false,
    };
    g.enemies = [target as unknown as Enemy];
    g.mercenaries.stance = "aggressive";
    const before = Math.hypot(target.x - m.x, target.y - m.y);
    tickMercenaries(g, 0.5);
    expect(Math.hypot(target.x - m.x, target.y - m.y)).toBeLessThan(before);
    target.alive = false;
    tickMercenaries(g, 0.5);
    const anchor = formationAnchor(g, 0);
    expect(Math.hypot(m.x - anchor.x, m.y - anchor.y)).toBeLessThan(8);
    expect(mercenaryStory("lia-azul", 0)).toContain("Lia Azul");
    expect(mercenaryStory("rei-sem-rosto", 4)).toContain("promessa");
  });
});
