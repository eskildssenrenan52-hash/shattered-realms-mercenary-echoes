import { describe, expect, it } from 'vitest';
import { SECRETS, REALMS, ALL_REALMS, HEART_REALM, REALM_NEED, stepOf, stepKey, realmOpen, chainDone } from './secrets';
import { ITEMS } from './data';
import { realmFloor } from './secret-play';
import { reachable } from './dungeon';
import { SOLID } from './world';
import { MAP_SECRET_TOTAL } from './map-secrets';

describe('Segredos do Cântico Oculto', () => {
  it('preserva os 450 IDs anteriores e acrescenta 200 cadeias, cada uma com 3 a 6 etapas', () => {
    expect(SECRETS.length).toBe(650);
    expect(SECRETS.slice(0, 450).map((s) => s.id)).toEqual(Array.from({ length: 450 }, (_, i) => `s${i}`));
    expect(SECRETS.length + MAP_SECRET_TOTAL).toBe(45_000);
    for (const s of SECRETS) { expect(s.steps.length).toBeGreaterThanOrEqual(3); expect(s.steps.length).toBeLessThanOrEqual(6); }
  });
  it('tem 26 reinos ocultos mais o Coração', () => { expect(REALMS.length).toBe(26); expect(ALL_REALMS.length).toBe(27); });
  it('mantém os quatro reinos secretos anteriores à expansão mais recente', () => {
    const added = REALMS.slice(14, 18);
    expect(added.map((r) => r.id)).toEqual(['cidade_lanternas', 'bosque_relogios', 'catedral_sal', 'forja_cometas']);
    expect(new Set(REALMS.map((r) => r.id)).size).toBe(REALMS.length);
    for (const [index, realm] of added.entries()) {
      expect(SECRETS.filter((s) => s.circle === index + 14)).toHaveLength(25);
      expect(realm.relic).toContain(realm.id);
      expect(realm.lore.length).toBeGreaterThan(30);
    }
  });
  it('acrescenta oito Reinos Ocultos com paletas, biomas e quatro estilos estruturais de dungeon', () => {
    const added = REALMS.slice(-8);
    expect(added.map((r) => r.id)).toEqual(['bastiao_mare_reversa', 'jardim_eclipse', 'observatorio_meridiano', 'palacio_fundo_azul', 'catacumbas_vidro', 'bosque_fosforo', 'cidade_raizes', 'vale_meteoros']);
    expect(new Set(added.map((r) => r.color)).size).toBe(8);
    expect(new Set(added.map((r) => r.biome)).size).toBe(8);
    expect(new Set(added.map((r) => r.dungeonStyle)).size).toBe(4);
    for (const realm of added) {
      const floor = realmFloor(realm);
      expect(floor.style).toBe(realm.dungeonStyle);
      expect(reachable(floor, SOLID)).toBe(true);
      expect(floor.rooms.length).toBeGreaterThanOrEqual(6);
    }
  });
  it('mantém a charada do Coração sincronizada com o catálogo de reinos', () => {
    const riddle = SECRETS.flatMap((secret) => secret.steps).find((step) => step.riddle?.q === 'Quantos Reinos Ocultos cercam o Coração?')?.riddle;
    expect(riddle?.options[riddle.correct]).toBe('Vinte e seis');
    expect(REALMS.length).toBe(26);
    expect(HEART_REALM.relicName).toBe('Vigésima Sétima Nota');
  });
  it('a primeira etapa nunca é no Abismo e as oferendas usam itens reais', () => {
    for (const s of SECRETS) {
      expect(s.steps[0]!.kind).not.toBe('depth');
      for (const st of s.steps) if (st.kind === 'offer') expect(ITEMS[st.item!]).toBeTruthy();
      expect(ITEMS[s.reward.item]).toBeTruthy();
    }
  });
  it('o portal só abre com 8 segredos do círculo concluídos', () => {
    const set = new Set<string>(), has = (k: string) => set.has(k), none = () => false;
    const circle0 = SECRETS.filter((s) => s.circle === 0);
    for (const c of circle0.slice(0, REALM_NEED - 1)) c.steps.forEach((_, i) => set.add(stepKey(c, i)));
    expect(realmOpen(REALMS[0]!, has, none)).toBe(false);
    const c = circle0[REALM_NEED - 1]!; c.steps.forEach((_, i) => set.add(stepKey(c, i)));
    expect(chainDone(c, has)).toBe(true);
    expect(realmOpen(REALMS[0]!, has, none)).toBe(true);
  });
  it('etapas precisam ser feitas em ordem', () => {
    const c = SECRETS[0]!, set = new Set([stepKey(c, 1)]);
    expect(stepOf(c, (k) => set.has(k))).toBe(0);
  });
});
