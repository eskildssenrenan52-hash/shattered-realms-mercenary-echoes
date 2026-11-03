import { describe, expect, it } from 'vitest';
import { BIOME_MINE_FLOORS, biomeMineBestFloor, biomeMineBossId, generateBiomeMineFloor, recordBiomeMineFloor } from './biome-mines';
import { BIOME_LIST, SOLID, W } from './world';
import { reachable } from './dungeon';

describe('biome mines', () => {
  it('has one unique exclusive boss id per biome and bosses only on floor 10', () => {
    const ids = BIOME_LIST.map(biomeMineBossId);
    expect(new Set(ids).size).toBe(30);
    for (const biome of BIOME_LIST) {
      expect(ids[BIOME_LIST.indexOf(biome)]).toMatch(/^mine_boss_/);
      for (let floor = 1; floor < BIOME_MINE_FLOORS; floor++) expect(generateBiomeMineFloor(biome, floor).boss).toBeNull();
      expect(generateBiomeMineFloor(biome, 10).boss?.id).toBe(biomeMineBossId(biome));
    }
  });
  it('is deterministic, uses local biome theme and has reachable stairs and ore loot', () => {
    const a = generateBiomeMineFloor('autumn', 4), b = generateBiomeMineFloor('autumn', 4);
    expect(a.theme.biome).toBe('autumn');
    expect(a.style).toBe('mirror');
    expect([...a.world.tiles]).toEqual([...b.world.tiles]);
    expect(a.spawns).toEqual(b.spawns);
    expect(a.start).not.toEqual(a.stairs);
    expect(a.world.nodes.some(n => n.item === 'forge_amber_ore')).toBe(true);
    expect(a.chests.some(c => c.item === 'forge_amber_ore')).toBe(true);
    expect(a.world.tiles[a.start.ty * W + a.start.tx]).toBe(a.theme.floor);
    expect(a.world.tiles[a.stairs.ty * W + a.stairs.tx]).toBe(a.theme.floor);
    expect(reachable(a, SOLID)).toBe(true);
  });
  it('persists contiguous progress under discoveries keys and blocks skips', () => {
    const discoveries = new Set<string>();
    expect(biomeMineBestFloor(discoveries, 'plains')).toBe(0);
    recordBiomeMineFloor(discoveries, 'plains', 2);
    expect(biomeMineBestFloor(discoveries, 'plains')).toBe(0);
    recordBiomeMineFloor(discoveries, 'plains', 1);
    expect(discoveries.has('mine:plains:floor:1')).toBe(true);
    expect(biomeMineBestFloor(discoveries, 'plains')).toBe(1);
    recordBiomeMineFloor(discoveries, 'plains', 2);
    expect(biomeMineBestFloor(discoveries, 'plains')).toBe(2);
    recordBiomeMineFloor(discoveries, 'abyss', 1);
    expect(biomeMineBestFloor(discoveries, 'abyss')).toBe(0);
    expect(() => generateBiomeMineFloor('abyss', 1)).toThrow();
    expect(() => generateBiomeMineFloor('plains', 1.5)).toThrow();
    expect(() => generateBiomeMineFloor('plains', 11)).toThrow();
  });
});
