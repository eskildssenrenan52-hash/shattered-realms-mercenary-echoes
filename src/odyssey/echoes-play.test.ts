import { describe, expect, it } from "vitest";
import { beyondBossModifiers } from "./echoes-balance";
import {
  CARAVAN_ORDERS,
  CONSTELLATION_RITES,
  fractureFloorData,
  dreamFloorData,
} from "./echoes-play";
import { freshEchoSystems, sanitizeEchoSystems } from "./echoes-state";
import { ECHOES_BEYOND_REALMS } from "./echoes-beyond";

describe("Ecos Além · estado e migração", () => {
  it("inicializa os dez sistemas sem exigir campos em saves anteriores", () => {
    const state = sanitizeEchoSystems(undefined);
    expect(state.v).toBe(1);
    expect(state.cartography.routes).toEqual([]);
    expect(state.restoration.freedRealms).toEqual([]);
    expect(state.dreams.memories).toBe(0);
    expect(state.constellations.stage).toBe(0);
    expect(state.caravans.active).toBeNull();
    expect(state.storms.active).toBe(false);
    expect(state.beyond.history).toEqual([]);
  });

  it("limita valores inválidos sem perder escolhas corretas e sempre encerra eventos transitórios ao recarregar", () => {
    const state = sanitizeEchoSystems({
      cartography: { routes: ["ferrolume", "ferrolume", 4, "caligo"] },
      restoration: { level: 99, freedRealms: ["ferrolume", "ferrolume", "caligo"] },
      dreams: { memories: -4, runs: 12.8, best: 99, completed: 2 },
      constellations: { stage: 8, failures: 3, completed: true },
      museum: {
        relics: ["beyond_ferrolume"],
        scenes: [],
        variants: { beyond_ferrolume: "remember", invalid: "maybe" },
      },
      storms: {
        optIn: true,
        active: true,
        selectedRealm: "caligo",
        completions: 2,
        lastBossId: "fracture_storm_2",
      },
      beyond: {
        cycle: 1,
        choices: { ferrolume: "preserve", invalid: "skip" },
        history: [{ cycle: 0, choices: { ferrolume: "transform" } }],
      },
    });
    expect(state.cartography.routes).toEqual(["ferrolume", "caligo"]);
    expect(state.restoration.level).toBe(3);
    expect(state.restoration.freedRealms).toEqual(["ferrolume", "caligo"]);
    expect(state.dreams.memories).toBe(0);
    expect(state.dreams.runs).toBe(12);
    expect(state.dreams.best).toBe(10);
    expect(state.constellations.stage).toBe(3);
    expect(state.museum.variants).toEqual({ beyond_ferrolume: "remember" });
    expect(state.storms.active).toBe(false);
    expect(state.storms.optIn).toBe(true);
    expect(state.beyond.choices).toEqual({ ferrolume: "preserve" });
    expect(state.beyond.history[0]?.choices).toEqual({ ferrolume: "transform" });
  });

  it("devolve a memória de uma expedição interrompida por recarga e limpa o marcador transitório", () => {
    const resumed = sanitizeEchoSystems({ dreams: { memories: 2, runs: 6, activeRun: 6 } });
    expect(resumed.dreams.memories).toBe(3);
    expect(resumed.dreams.activeRun).toBeNull();
    expect(resumed.dreams.runs).toBe(6);
  });

  it("registra até 50 ciclos, remove duplicatas de strings e não compartilha o objeto default", () => {
    const a = freshEchoSystems(),
      b = freshEchoSystems();
    a.council.votes.push("rotas:mare");
    expect(b.council.votes).toEqual([]);
    expect(
      sanitizeEchoSystems({ council: { votes: ["rotas:mare", "rotas:mare"] } }).council.votes,
    ).toEqual(["rotas:mare"]);
    expect(
      sanitizeEchoSystems({
        caravans: {
          active: {
            id: "rota-ferrolume",
            realm: "ferrolume",
            acceptedAtCycle: 0,
            arrivalVerified: true,
          },
        },
      }).caravans.active?.arrivalVerified,
    ).toBe(true);
    const history = Array.from({ length: 55 }, (_, cycle) => ({
      cycle,
      choices: { ferrolume: "preserve" },
    }));
    expect(sanitizeEchoSystems({ beyond: { cycle: 60, history } }).beyond.history).toHaveLength(50);
    expect(sanitizeEchoSystems({ beyond: { cycle: 60, history } }).beyond.cycle).toBe(60);
  });
});

describe("Ecos Além · regras e expedições", () => {
  it("tem cinco reinos e três encomendas comerciais ordenadas", () => {
    expect(ECHOES_BEYOND_REALMS).toHaveLength(5);
    expect(CARAVAN_ORDERS.map((order) => order.realm)).toEqual(["ferrolume", "caligo", "auriflor"]);
  });

  it("os três rituais têm pistas próprias e sequências válidas distintas", () => {
    expect(CONSTELLATION_RITES).toHaveLength(3);
    expect(new Set(CONSTELLATION_RITES.map((rite) => rite.answer.join(""))).size).toBe(3);
    for (const rite of CONSTELLATION_RITES) {
      expect(rite.answer).toHaveLength(3);
      expect([...rite.answer].sort()).toEqual([0, 1, 2]);
      expect(rite.clue.length).toBeGreaterThan(15);
    }
  });

  it("gera um Sonho curto, determinístico, com baú, seis criaturas comuns e guardião elite", () => {
    const first = dreamFloorData(1, 18),
      second = dreamFloorData(1, 18);
    expect(first.floor).toBe(1);
    expect(first.theme.name).toBe("Sonho de Vidro");
    expect(first.boss).toBeNull();
    expect(first.spawns).toHaveLength(7);
    expect(first.spawns.filter((spawn) => spawn.elite)).toHaveLength(1);
    expect(first.chests[0]?.id).toBe("dream-1-memory");
    expect(first.rooms).toEqual(second.rooms);
    expect(first.spawns).toEqual(second.spawns);
    expect(first.stairs).toEqual(second.stairs);
  });

  it("gera uma Tempestade temática com cache e Arauto de ID próprio por tentativa", () => {
    const first = fractureFloorData("ferrolume", 1, 22)!;
    const second = fractureFloorData("ferrolume", 2, 22)!;
    expect(first.theme.name).toContain("Ferrólume");
    expect(first.boss?.id).toBe("fracture_storm_1");
    expect(first.boss?.name).toContain("Arauto da Fratura");
    expect(first.boss?.reward).toContain("eco_shard");
    expect(first.chests[0]?.id).toBe("fracture-1-cache");
    expect(second.boss?.id).toBe("fracture_storm_2");
    expect(first.rooms).toEqual(fractureFloorData("ferrolume", 1, 22)!.rooms);
    expect(first.spawns).toEqual(fractureFloorData("ferrolume", 1, 22)!.spawns);
  });

  it("escala chefes de Ciclo seguinte de forma limitada e conforme o desfecho persistido", () => {
    const state = freshEchoSystems();
    expect(beyondBossModifiers(state, "ferrolume")).toEqual({ hp: 1, atk: 1, reward: 1 });
    state.beyond.cycle = 1;
    state.beyond.history.push({
      cycle: 0,
      choices: { ferrolume: "transform", caligo: "preserve" },
    });
    const transformed = beyondBossModifiers(state, "ferrolume");
    const preserved = beyondBossModifiers(state, "caligo");
    expect(transformed.hp).toBeGreaterThan(1);
    expect(transformed.atk).toBeGreaterThan(1);
    expect(preserved.reward).toBeGreaterThan(1);
    expect(beyondBossModifiers(state, "unknown").hp).toBeLessThanOrEqual(2.8);
  });
});
