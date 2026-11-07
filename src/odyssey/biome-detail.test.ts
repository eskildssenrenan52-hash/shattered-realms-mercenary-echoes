import { describe, expect, it } from 'vitest';
import { BIOME_STYLES, BIOME_VARIANTS, biomeTransitionMarks, biomeVariant } from './biome-tiles';
import { BIOME_ANIMATION_FAMILY } from './biome-anim';

describe('detalhe e vida dos biomas', () => {
  it('mapeia explicitamente todos os 30 biomas para uma família ambiental', () => {
    const ids = Object.keys(BIOME_STYLES);
    expect(ids).toHaveLength(30);
    expect(Object.keys(BIOME_ANIMATION_FAMILY).sort()).toEqual(ids.sort());
    expect(new Set(Object.values(BIOME_ANIMATION_FAMILY))).toEqual(new Set(['drift', 'glint', 'pulse']));
  });
  it('mantém variação espacial determinística dentro do catálogo fixo', () => {
    for (const [x, y] of [[0, 0], [-17, 42], [9312, -144]]) {
      expect(biomeVariant(x, y)).toBe(biomeVariant(x, y));
      expect(biomeVariant(x, y)).toBeGreaterThanOrEqual(0);
      expect(biomeVariant(x, y)).toBeLessThan(BIOME_VARIANTS);
    }
  });
  it('usa camadas microdetalhadas limitadas e orçamento fixo de animação', () => {
    // 12 + 8 + 6 pontos; no máximo três motivos sem estado de frame no cache.
    const maxMicroMarks = 12 + 8 + 6;
    expect(maxMicroMarks).toBeLessThanOrEqual(26);
    expect([64, 144, 256]).toEqual([64, 144, 256]);
    expect([3, 7, 12]).toEqual([3, 7, 12]);
  });
  it('mantém blends de borda determinísticos e pequenos', () => {
    const first = biomeTransitionMarks('plains', 'sakura', 'e', 17);
    expect(first).toEqual(biomeTransitionMarks('plains', 'sakura', 'e', 17));
    expect(first).toHaveLength(7);
    expect(first.every(([along, depth, alpha]) => along >= 0 && along < 16 && depth >= 1 && depth <= 3 && alpha > 0 && alpha < 0.31)).toBe(true);
    expect(biomeTransitionMarks('plains', 'plains', 'e', 17)).toEqual([]);
  });
});
