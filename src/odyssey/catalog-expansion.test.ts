import { describe, expect, it } from "vitest";
import { HERO_SKINS } from "./hero-sprite";
import { K_SHEETS } from "./kaetram";
import { MERCENARIES, MERC_BY_ID, sanitizeMercenaryState } from "./mercenaries";
import { AI_EXPANDED_MERCENARY_SHEET_IDS } from "./mercenary-skins";
import { AI_EXPANDED_HERO_SKIN_IDS } from "./hero-skin-art";
import { DEFAULT_LOOK, sanitizeLook } from "./appearance";

describe("catálogos append-only de contratos e aparência", () => {
  it("preserva os 44 IDs legados e inclui somente mercenários com sheet AI finalizado", () => {
    const legacy = [
      "ferrovia",
      "mae-das-brumas",
      "irmao-cinzas",
      "lia-azul",
      "rei-sem-rosto",
      "tico-fagulha",
      "yara-das-raizes",
      "skadi-garra-de-gelo",
      "vesper-corvo",
      "aurora-partida",
      "bruno-bigorna",
      "nina-lamina-rubra",
      "pip-cogumelo",
      "zara-das-dunas",
      "grom-rachapedra",
      "oraculo-ossian",
      "hana-vento-bambu",
      "irma-lotus",
      "selene-mare-negra",
      "kael-sangue-de-dragao",
      "brisa-lanterna",
      "dario-ponteiro",
      "mira-coral",
      "soren-musgo",
      "tala-vidro",
      "noa-ferrugem",
      "bela-cometa",
      "kaio-marfim",
      "nix-candeia",
      "orion-limo",
      "elara-folha",
      "ravi-cobre",
      "safa-neve",
      "milo-eco",
      "iris-carmesim",
      "tomas-azeviche",
      "luma-vela",
      "cassia-pedra",
      "ren-espelho",
      "talia-cinza",
      "zev-aurora",
      "uma-sino",
      "bento-fumaca",
      "vivi-constelacao",
    ];
    const added = MERCENARIES.slice(44);
    expect(MERCENARIES).toHaveLength(44 + AI_EXPANDED_MERCENARY_SHEET_IDS.length);
    expect(MERCENARIES.slice(0, 44).map((m) => m.id)).toEqual(legacy);
    expect(new Set(MERCENARIES.map((m) => m.id)).size).toBe(MERCENARIES.length);
    expect(added.map((m) => m.id)).toEqual([...AI_EXPANDED_MERCENARY_SHEET_IDS]);
    expect(added.every((m) => m.sheet === `/mercenaries/sheets/${m.id}.png` && m.portrait === `/mercenaries/runtime/${m.id}.webp` && m.design)).toBe(true);
    expect(new Set(added.map((m) => JSON.stringify(m.design))).size).toBe(added.length);
  });

  it("mantém os 39 índices legados e anexa apenas skins com folha AI finalizada", () => {
    const legacy = [
      "base",
      "danbo",
      "danboblue",
      "danbogreen",
      "danbored",
      "taekwondo",
      "oldman",
      "skeleton",
      "darkskeleton",
      "knight",
      "ninja",
      "wizard",
      "orc",
      "pirate",
      "astronaut",
      "palette-ember",
      "palette-tide",
      "palette-moss",
      "palette-lilac",
      "palette-gold",
      "palette-ice",
      "palette-rose",
      "palette-forest",
      "palette-cinder",
      "palette-amethyst",
      "palette-sand",
      "palette-storm",
      "palette-void",
      "palette-pearl",
      "palette-copper",
      "palette-lotus",
      "palette-bamboo",
      "palette-obsidian",
      "palette-moon",
      "palette-saffron",
      "palette-celadon",
      "palette-crimson",
      "palette-aurora",
      "palette-constellation",
    ];
    expect(HERO_SKINS).toHaveLength(39 + AI_EXPANDED_HERO_SKIN_IDS.length);
    expect(HERO_SKINS.slice(0, 39).map((s) => s.id)).toEqual(legacy);
    expect(new Set(HERO_SKINS.map((s) => s.id)).size).toBe(HERO_SKINS.length);
    const added = HERO_SKINS.slice(39);
    expect(added.map((s) => s.id)).toEqual([...AI_EXPANDED_HERO_SKIN_IDS]);
    expect(new Set(added.map((s) => s.name)).size).toBe(added.length);
    expect(new Set(added.map((s) => s.id)).size).toBe(added.length);
    expect(new Set(added.map((s) => s.desc)).size).toBe(added.length);
    expect(
      added.every(
        (s) =>
          s.sheet === `hero/${s.id}` &&
          K_SHEETS[s.sheet]?.url === `/hero-skins/${s.id}.png` &&
          !s.design &&
          s.minLevel >= 1 &&
          s.minLevel <= 80,
      ),
    ).toBe(true);
  });

  it("usa somente roles, raridades, armas, estatísticas e gates válidos", () => {
    const roles = new Set(["guardiao", "duelista", "mago", "curandeira", "lenda"]);
    const rarities = new Set(["comum", "incomum", "raro", "epico", "lendario"]);
    for (const m of MERCENARIES.slice(44)) {
      expect(roles.has(m.role)).toBe(true);
      expect(rarities.has(m.rarity)).toBe(true);
      expect(m.maxHp).toBeGreaterThan(0);
      expect(m.atk).toBeGreaterThan(0);
      expect(m.def).toBeGreaterThan(0);
      expect(m.speed).toBeGreaterThan(0);
      expect(m.attackRange).toBeGreaterThan(0);
      expect(m.attackCooldown).toBeGreaterThan(0);
      expect(m.recoverySeconds).toBeGreaterThan(0);
      expect(m.minLevel).toBeGreaterThanOrEqual(1);
      expect(m.minLevel).toBeLessThanOrEqual(80);
      expect(m.progressKey).toMatch(/^catalog:fronteira:\d{3}$/);
      expect(K_SHEETS[`player/weapon/${m.weapon}`]).toBeTruthy();
      expect(MERC_BY_ID[m.id]).toBe(m);
    }
  });

  it("migra saves com IDs antigos e novos, e mantém Look.kskin indexado", () => {
    const newMerc = MERCENARIES[MERCENARIES.length - 1]!;
    const migrated = sanitizeMercenaryState({
      roster: [
        { id: "ferrovia", level: 2, hp: 40, state: "reserva" },
        { id: newMerc.id, level: 1, hp: newMerc.maxHp, state: "reserva" },
      ],
      active: ["ferrovia", newMerc.id],
    });
    expect(migrated.roster.map((m) => m.id)).toEqual(["ferrovia", newMerc.id]);
    expect(migrated.active).toEqual(["ferrovia", newMerc.id]);
    expect(sanitizeLook({ kskin: 38 }).kskin).toBe(38);
    expect(sanitizeLook({ kskin: 48 }).kskin).toBe(48);
    expect(sanitizeLook({ kskin: 238 })).toEqual(DEFAULT_LOOK);
    expect(sanitizeLook({ kskin: 999 })).toEqual(DEFAULT_LOOK);
  });
});
