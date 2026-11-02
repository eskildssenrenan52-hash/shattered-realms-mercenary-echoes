import { describe, expect, it } from 'vitest';
import { SAGA_REALMS, actRealmUnlocked, realmUnlocked, sagaBossId } from './saga';
import { ECHOES_BEYOND_CHRONICLES, ECHOES_BEYOND_REALMS } from './echoes-beyond';
import { Game } from './engine';
import { enterSagaZone, sagaModeTick, sagaPlaza, sagaSurfaceAction, sagaVictoryLines, travelToActMap } from './saga-play';
import { TS } from './world';

function gameForPath() {
  const canvas = document.createElement('canvas');
  canvas.width = 480; canvas.height = 270;
  const store: Record<string | symbol, unknown> = { canvas }, noop = () => undefined;
  const context = new Proxy(store, {
    get: (target, key) => key in target ? target[key] : key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({ addColorStop: noop }) : key === 'createImageData' ? (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(TS * TS * 4) }) : key === 'measureText' ? () => ({ width: 8 }) : noop,
    set: (target, key, value) => { target[key] = value; return true; },
  });
  const old = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = (() => context) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  try { const g = new Game(canvas); g.started = true; return g; } finally { HTMLCanvasElement.prototype.getContext = old; }
}

describe('expansão Echoes Beyond', () => {
  it('mantém os lacres dos atos ligados a progresso real de quests', () => {
    expect(actRealmUnlocked(1, {})).toBe(false);
    expect(actRealmUnlocked(1, { m6: 'done' })).toBe(true);
    expect(actRealmUnlocked(2, {})).toBe(false);
  });

  it('abre a Fenda Costurada ao terminar o Ato I (m6) e oferece o Relicário', () => {
    const g = gameForPath(), rift = sagaPlaza(g.overworld).rift;
    g.p.x = rift.tx * TS + 8; g.p.y = rift.ty * TS + 8;
    expect(sagaSurfaceAction(g, false)).toContain('selada');
    g.questStatus['m6'] = 'done';
    expect(sagaSurfaceAction(g, true)).toContain('Travessias da Manopla');
    expect(g.dialog?.choices.some((choice) => choice.label.includes('Relicário das Horas Paradas'))).toBe(true);
    const acts = sagaPlaza(g.overworld).acts;
    g.p.vx = 9; g.p.vy = -7; g.moveTarget = { x: 1, y: 1 };
    expect(travelToActMap(g)).toBe(true);
    expect([g.p.x, g.p.y, g.p.vx, g.p.vy, g.moveTarget]).toEqual([acts.tx * TS + 8, acts.ty * TS + 8, 0, 0, null]);
  });

  it('registra os cinco reinos pós-Ato V como Saga jogável', () => {
    expect(ECHOES_BEYOND_REALMS).toHaveLength(5);
    for (const realm of ECHOES_BEYOND_REALMS) {
      expect(SAGA_REALMS).toContainEqual(realm);
      expect(realm.gate).toBe('ecos');
      expect(realm.act).toBeUndefined();
      expect(realm.zones).toHaveLength(3);
      expect(realm.zones[0]?.mode).toBe('town');
      expect(realm.zones.some((zone) => zone.mode === 'survival')).toBe(true);
      expect(realm.zones.some((zone) => zone.mode === 'timed')).toBe(true);
      expect(sagaBossId(realm, realm.zones.length - 1)).toBe(`saga_${realm.id}_2`);
    }
    const first = SAGA_REALMS.findIndex((realm) => realm.id === ECHOES_BEYOND_REALMS[0]!.id);
    expect(realmUnlocked(first, () => false, () => false, () => false)).toBe(false);
    expect(realmUnlocked(first, () => false, () => false, () => true)).toBe(true);
  });

  it('mantém as 120 crônicas como dados determinísticos e identificáveis', () => {
    expect(ECHOES_BEYOND_CHRONICLES).toHaveLength(120);
    expect(new Set(ECHOES_BEYOND_CHRONICLES.map((chapter) => chapter.id)).size).toBe(120);
    expect(ECHOES_BEYOND_CHRONICLES.every((chapter) => ECHOES_BEYOND_REALMS.some((realm) => realm.id === chapter.realm))).toBe(true);
  });

  it('nunca enfileira uma vitória vazia ao liberar uma cidade', () => {
    const towns = SAGA_REALMS.flatMap((realm) => realm.zones.filter((zone) => zone.mode === 'town'));
    expect(towns.length).toBeGreaterThan(0);
    expect(towns.every((zone) => sagaVictoryLines(zone).length > 0)).toBe(true);
  });

  it('restaura todos os membros de um encontro, inclusive gêmeo, quando a corrida expira', () => {
    const g = gameForPath();
    const ri = SAGA_REALMS.findIndex((realm) => realm.zones.some((zone) => zone.mode === 'timed'));
    const zi = SAGA_REALMS[ri]!.zones.findIndex((zone) => zone.mode === 'timed');
    enterSagaZone(g, ri, zi);
    const boss = g.enemies.find((enemy) => enemy.boss)!;
    const twin = { ...boss, boss: { ...boss.boss!, twinKey: 'test-twin' }, alive: false };
    boss.boss!.twinKey = 'test-twin'; boss.alive = false; g.enemies.push(twin);
    sagaModeTick(g, 999);
    expect(g.enemies.filter((enemy) => enemy.boss?.twinKey === 'test-twin').every((enemy) => enemy.alive && enemy.respawn === 0)).toBe(true);
  });
});
