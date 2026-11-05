import { describe, expect, it } from "vitest";
import { ITEMS } from "./data";
import { BIOME_LIST } from "./world";
import { FARLANDS_PORTALS, FARLANDS_SEED, FARLANDS_SITES, farlandsInteractionId, generateFarlandsWorld, resolveFarlandsSites } from "./farlands";
import { generateWorld, SOLID, T, W } from "./world";
import { carveBiomeMineEntrances } from "./biome-mine-sites";
import { farlandsNpcs } from "./farlands-npcs";

describe("Farlands", () => {
  it("expõe 24 locais nomeados, em biomas existentes e com recompensas do catálogo", () => {
    expect(FARLANDS_SITES).toHaveLength(24);
    expect(new Set(FARLANDS_SITES.map((s) => s.id)).size).toBe(24);
    expect(new Set(FARLANDS_SITES.map((s) => farlandsInteractionId(s.id))).size).toBe(24);
    for (const site of FARLANDS_SITES) {
      expect(BIOME_LIST).toContain(site.biome);
      expect(ITEMS[site.reward]).toBeDefined();
      expect(site.name.length).toBeGreaterThan(0);
      expect(site.lore.length).toBeGreaterThan(0);
      expect(site.illustration).toBeDefined();
    }
  });

  it("resolve coordenadas determinísticas, únicas e caminháveis", () => {
    const world = generateFarlandsWorld();
    const first = resolveFarlandsSites(world);
    const second = resolveFarlandsSites(world);
    expect(first.map(({ x, y }) => [x, y])).toEqual(second.map(({ x, y }) => [x, y]));
    expect(new Set(first.map(({ x, y }) => y * W + x)).size).toBe(24);
    for (const site of first) expect(SOLID.has(world.tiles[site.y * W + site.x]!)).toBe(false);
    const mines = carveBiomeMineEntrances(world);
    expect(mines).toHaveLength(BIOME_LIST.length);
    expect(new Set(mines.map((mine) => mine.biome)).size).toBe(BIOME_LIST.length);
    for (const mine of mines) {
      expect(world.tiles[mine.ty * W + mine.tx]).toBe(T.PATH);
      expect(SOLID.has(world.tiles[mine.ty * W + mine.tx]!)).toBe(false);
    }
  });

  it("distribui moradores exclusivos de Farlands em locais caminháveis e sem cobrir os marcos", () => {
    const world = generateFarlandsWorld();
    const npcs = farlandsNpcs(world);
    expect(npcs).toHaveLength(9);
    expect(new Set(npcs.map((npc) => npc.id)).size).toBe(9);
    const arrivalGuide = npcs.find((npc) => npc.id === "farlands_gate_guide")!;
    expect(Math.hypot(arrivalGuide.tx - FARLANDS_PORTALS[0].x, arrivalGuide.ty - FARLANDS_PORTALS[0].y) * 16).toBeGreaterThan(60);
    expect(new Set(npcs.map((npc) => npc.ty * W + npc.tx)).size).toBe(9);
    for (const npc of npcs) {
      expect(SOLID.has(world.tiles[npc.ty * W + npc.tx]!)).toBe(false);
      expect(npc.id).toMatch(/^farlands_/);
      expect(npc.lines.length).toBeGreaterThan(0);
      const nearestSite = Math.min(...resolveFarlandsSites(world).map((site) => Math.hypot(npc.tx - site.x, npc.ty - site.y)));
      expect(nearestSite).toBeGreaterThan(2);
    }
  });

  it("usa geografia diferente da seed legada zero", () => {
    expect(FARLANDS_SEED).not.toBe(0);
    const farlands = generateFarlandsWorld();
    const legacy = generateWorld(0);
    const samples = [0, 126 * W + 122, 215 * W + 315, 900 * W + 1800, 2100 * W + 3000];
    expect(samples.some((i) => farlands.tiles[i] !== legacy.tiles[i] || farlands.biomes[i] !== legacy.biomes[i])).toBe(true);
  });
});
