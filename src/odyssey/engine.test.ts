import { describe, it, expect, vi } from 'vitest';
import { Game } from './engine';
import { QUESTS, BOSSES } from './data';
import { actChainQuests, ALL_ECO_BOSSES } from './story';
import { FRONTIER_GATES, FRONTIER } from './frontier';
import { TS } from './world';
import { bossHp, bossMeleeDamage } from './boss-tuning';
import { depthAction, enterBiomeMine, enterCitadel, enterTutorialFloor, restartTutorialFloor, startTutorial, skipTutorial, surfaceEntrance, TUTORIAL_BOSS_ID, TUTORIAL_FLOORS } from './depthplay';
import { biomeMineBossId } from './biome-mines';
import { biomeMineEntrances } from './biome-mine-sites';
import { farlandsAction, MAIN_FARLANDS_GATE } from './farlands-play';
import { FARLANDS_PORTALS } from './farlands';
import { CITADEL_FINAL_BEAT_ID, CITADEL_FINAL_BOSS_ID, CITADEL_UNLOCK_BOSS_ID } from './demon-citadel';
import { startNemesisHunt } from './echoes-play';
import { nemesisBossId } from './nemesis';

// Canvas 2D falso: qualquer método é um no-op, gradientes aceitam addColorStop.
function fakeCtx(canvas: unknown) {
  const store: Record<string | symbol, unknown> = { canvas };
  const noop = () => undefined;
  return new Proxy(store, {
    get: (t, k) => (k in t ? t[k] : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop: noop }) : k === 'createImageData' ? (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }) : k === 'measureText' ? () => ({ width: 8 }) : k === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : noop),
    set: (t, k, v) => { t[k] = v; return true; },
  });
}
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) { return fakeCtx(this) as never; });
const make = (fresh = true) => { if (fresh) localStorage.clear(); const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270; const g = new Game(cv); g.started = true; return g; };

describe('Engine — campanha integrada', { timeout: 90000 }, () => {
  const g = make();
  it('mantém os moradores de Potos e oferece habitantes interativos no segundo continente', () => {
    const k = make();
    const originalNpcIds = ['elder', 'smith', 'alchemist', 'merchant', 'guard', 'ranger', 'nomad', 'hermit'];
    expect(k.localNpcs.map((npc) => npc.id)).toEqual(expect.arrayContaining(originalNpcIds));

    k.p.x = MAIN_FARLANDS_GATE.x * TS + 8; k.p.y = MAIN_FARLANDS_GATE.y * TS + 8;
    farlandsAction(k, true);
    expect(k.farlandsActive).toBe(true);
    expect(k.localNpcs).toHaveLength(8);
    expect(k.localNpcs.every((npc) => npc.id.startsWith('farlands_'))).toBe(true);
    k.save();
    const resumed = make(false);
    resumed.load();
    expect(resumed.farlandsActive).toBe(true);
    expect(resumed.localNpcs).toHaveLength(8);
    const npc = resumed.localNpcs[0]!;
    resumed.p.x = npc.tx * TS + 8; resumed.p.y = npc.ty * TS + 8;
    expect(resumed.nearNpc(26)?.id).toBe(npc.id);
    resumed.talk(npc);
    expect(resumed.dialog?.npc.id).toBe(npc.id);

    const portal = FARLANDS_PORTALS[0];
    resumed.p.x = portal.x * TS + 8; resumed.p.y = portal.y * TS + 8;
    farlandsAction(resumed, true);
    expect(resumed.farlandsActive).toBe(false);
    expect(resumed.localNpcs.map((resident) => resident.id)).toEqual(expect.arrayContaining(originalNpcIds));
  });
  it('não reaparece inimigos derrotados no tutorial após temporizador ou reinício do piso', () => {
    const k = make();
    startTutorial(k);
    const foe = k.enemies.find((enemy) => !enemy.boss)!;
    const spawnTx = Math.floor(foe.hx / TS), spawnTy = Math.floor(foe.hy / TS);
    const key = foe.tutorialSpawnKey!;
    foe.hx += TS * 4; foe.hy += TS * 2;
    k.killEnemy(foe);
    expect(foe.respawn).toBe(-1);
    expect(k.tutorialDefeated.has(key)).toBe(true);
    k.updateEnemies(120);
    expect(foe.alive).toBe(false);
    restartTutorialFloor(k);
    expect(k.enemies.some((enemy) => Math.floor(enemy.hx / TS) === spawnTx && Math.floor(enemy.hy / TS) === spawnTy)).toBe(false);
    const outdoor = make();
    const regular = outdoor.enemies[0]!;
    outdoor.killEnemy(regular);
    expect(regular.respawn).toBe(35);
  });
  it('abre as doze arenas do Caçador, aprende a arma do duelo e restaura progresso offline', () => {
    const k = make();
    k.questStatus['m6'] = 'done';
    for (let act = 2; act <= 5; act++) for (const id of actChainQuests(act)) k.questStatus[id] = 'done';
    expect(startNemesisHunt(k)).toBe(true);
    expect(k.depth?.profile).toBe('nemesis');
    expect(k.areaName).toContain('Caçada Nêmesis');
    const boss = k.enemies.find((enemy) => enemy.boss?.def.id === nemesisBossId(1))!;
    k.p.equip.weapon = 'wood_sword';
    k.p.x = boss.x - 20; k.p.y = boss.y;
    k.attack({ x: 1, y: 0 });
    expect(k.echoSystems.nemesis.styleHits.sword).toBe(1);
    k.p.equip.weapon = 'short_bow'; k.p.atkCd = 0;
    k.p.x = boss.x - 100; k.p.y = boss.y;
    k.attack({ x: 1, y: 0 });
    const arrow = k.projs[k.projs.length - 1]!;
    expect(arrow.weaponStyle).toBe("bow");
    k.damageEnemy(boss, 10, 0, 0, arrow.color, 1, arrow.weaponStyle);
    k.damageEnemy(boss, 10, 0, 0, arrow.color, 1, arrow.weaponStyle);
    expect(k.echoSystems.nemesis.styleHits.bow).toBe(2);
    boss.hp = 1;
    k.p.equip.weapon = 'short_bow';
    k.damageEnemy(boss, 99999, 0, 0, "#ffffff", 1, "bow");
    expect(k.echoSystems.nemesis.victories).toBe(1);
    expect(k.echoSystems.nemesis.adaptation).toBe('bow');
    expect(k.discoveries.has('nemesis:mark:1')).toBe(true);
    const saved = make(false);
    saved.load();
    expect(saved.echoSystems.nemesis.victories).toBe(1);
    expect(saved.echoSystems.nemesis.adaptation).toBe('bow');
    expect(saved.echoSystems.nemesis.active).toBe(false);
    k.p.x = k.depth!.data.start.tx * TS + 8;
    k.p.y = k.depth!.data.start.ty * TS + 8;
    expect(depthAction(k, true)).toContain('Recuar da Caçada');
    expect(k.depth).toBeNull();
    expect(startNemesisHunt(k)).toBe(true);
    const nextBoss = k.enemies.find((enemy) => enemy.boss?.def.id === nemesisBossId(2))!;
    expect(nextBoss.nemesisResistance).toBe("bow");
    nextBoss.hp = nextBoss.maxhp = 1_000_000;
    k.damageEnemy(nextBoss, 1_000_000, 0, 0, "#ffffff", 1, "bow");
    const resistedDamage = 1_000_000 - nextBoss.hp;
    nextBoss.hp = nextBoss.maxhp = 1_000_000;
    k.damageEnemy(nextBoss, 1_000_000, 0, 0, "#ffffff", 1, "sword");
    const normalDamage = 1_000_000 - nextBoss.hp;
    expect(resistedDamage).toBeLessThan(normalDamage);
  });
  it('entra na mina pela superfície, avança em sequência e conclui uma meta de andar por bioma', () => {
    const k = make(), site = biomeMineEntrances(k.overworld).find((entry) => entry.biome === 'plains')!;
    k.p.x = site.tx * TS + 8; k.p.y = site.ty * TS + 8;
    expect(surfaceEntrance(k, false)).toContain('Mina de');
    surfaceEntrance(k, true);
    expect(k.depth?.kind).toBe('biome-mine'); expect(k.depth?.floor).toBe(1);
    const quest = QUESTS.find((entry) => entry.id === 'deep_route_01_4')!;
    k.questStatus[quest.id] = 'active';
    for (let floor = 1; floor < 4; floor++) {
      const stairs = k.depth!.data.stairs;
      k.p.x = stairs.tx * TS + 8; k.p.y = stairs.ty * TS + 8;
      expect(depthAction(k, true)).toContain(`andar ${floor + 1}`);
      expect(k.depth?.floor).toBe(floor + 1);
    }
    expect(k.questReady(quest)).toBe(true);
  });
  it('cria o chefe no décimo andar e mantém a saída fechada até a vitória', () => {
    const k = make(); enterBiomeMine(k, 'plains', 10);
    const floor = k.depth!, bossId = biomeMineBossId('plains');
    expect(floor.data.boss?.id).toBe(bossId);
    const stairs = floor.data.stairs; k.p.x = stairs.tx * TS + 8; k.p.y = stairs.ty * TS + 8;
    expect(depthAction(k, false)).toBe('Saída selada pelo chefe');
    k.bossesDone.add(bossId);
    expect(depthAction(k, true)).toBe('E · Sair da mina após a vitória');
    expect(k.depth).toBeNull();
  });
  it('só libera os Vigias depois de salvar a Árvore (Ato I) e respeita requiresAll entre atos', () => {
    expect(g.availableQuest('vigia_sunflower')).toBeUndefined();
    g.questStatus['m6'] = 'done';
    expect(g.availableQuest('vigia_sunflower')?.id).toBe('sunflower_1');
    expect(g.availableQuest('vigia_moonwood')).toBeUndefined();
    for (const id of actChainQuests(2)) g.questStatus[id] = 'done';
    expect(g.availableQuest('vigia_moonwood')?.id).toBe('moonwood_1');
    expect(g.availableQuest('vigia_prism')).toBeUndefined();
  });
  it('história obrigatória: pular não fecha a cena antes da última fala', () => {
    g.fireBeats('new');
    g.advanceCutscene(true);
    expect(g.cutscene?.beat.id).toBe('prologue');
    expect(g.cutscene?.i).toBe(1);
  });
  it('cenas: enfileira, avança, não repete e sobrevive a save/load', () => {
    g.fireBeats('new');
    expect(g.cutscene?.beat.id).toBe('prologue');
    const n = g.cutscene!.beat.lines.length;
    for (let i = 0; i < n; i++) g.advanceCutscene();
    expect(g.cutscene).toBeNull();
    g.fireBeats('new');
    expect(g.cutscene).toBeNull();
    g.save();
    const h = make(false);
    h.load();
    expect(h.seenBeats.has('prologue')).toBe(true);
  });
  it('concluir a cadeia de um ato dispara a cena do ato uma única vez', () => {
    const k = make(); k.questStatus['m6'] = 'done';
    const chain = actChainQuests(2), last = QUESTS.find(q => q.id === chain[chain.length - 1])!;
    for (const id of chain.slice(0, -1)) k.questStatus[id] = 'done';
    k.questStatus[last.id] = 'active'; k.bossesDone.add(last.goal.kind === 'boss' ? last.goal.target : '');
    const npc = { id: last.giver, name: 'x', title: 'y', tx: 0, ty: 0, pal: { skin: '', hair: '', body: '', legs: '' }, lines: [] };
    k.completeQuest(last, npc);
    const ids = [k.cutscene?.beat.id, ...k.beatQueue.map(b => b.id)];
    expect(ids).toContain('act2_end');
    k.afterQuest(last);
    expect([k.cutscene?.beat.id, ...k.beatQueue.map(b => b.id)].filter(x => x === 'act2_end').length).toBe(1);
  });
  it('vencer um chefe de Eco entrega Fragmentos de Eco e dispara a cena do Eco', () => {
    const k = make(), boss = k.enemies.find(e => e.boss?.def.id === 'sunflower_boss')!;
    expect(boss).toBeDefined(); expect(boss.level).toBeGreaterThan(10);
    expect(boss.maxhp).toBe(bossHp(boss.boss!.def.hp));
    k.killEnemy(boss);
    expect(k.bossesDone.has('sunflower_boss')).toBe(true);
    expect(k.count('eco_shard')).toBeGreaterThanOrEqual(3);
    expect(k.cutscene?.beat.id).toBe('eco_sunflower');
  });
  it('chefes gêmeos despertam juntos e a vitória/progresso só acontece quando o último cai', () => {
    const k = make(), boss = k.enemies.find(e => e.boss?.def.id === 'sunflower_boss')!;
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0.01);
    k.activateBoss(boss);
    rng.mockRestore();
    const key = boss.boss?.twinKey;
    expect(key).toBe('twin:sunflower_boss');
    const twin = k.enemies.find(e => e !== boss && e.boss?.twinKey === key)!;
    expect(twin).toBeDefined(); expect(boss.boss?.active).toBe(true); expect(twin.boss?.active).toBe(true);
    expect(twin.maxhp).toBe(bossHp(twin.boss!.def.hp));
    expect(twin.boss?.arsenalKey).not.toBe(boss.boss?.arsenalKey);
    expect(JSON.parse(localStorage.getItem('golden-arrow-save')!).twinRolls.sunflower_boss).toBe(true);
    k.killEnemy(boss);
    expect(k.bossesDone.has('sunflower_boss')).toBe(false);
    expect(k.activeBoss).toBe(twin);
    k.killEnemy(twin);
    expect(k.bossesDone.has('sunflower_boss')).toBe(true);
    expect(k.activeBoss).toBeNull();
  });
  it('usa contato corpo a corpo ×3 e conduz o chefe por cinco fases sem alterar o HP-base', () => {
    const k = make(), boss = k.enemies.find(e => e.boss?.def.id === 'sunflower_boss')!;
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    k.activateBoss(boss); rng.mockRestore();
    const hurt = vi.spyOn(k, 'hurtPlayer');
    boss.cd = 0; boss.boss!.patT = 2;
    k.updateBoss(boss, 0, 10, 1, 0);
    expect(hurt.mock.calls[0]?.[0]).toBe(bossMeleeDamage(boss.atk));
    for (const [ratio, phase] of [[0.79, 2], [0.59, 3], [0.39, 4], [0.19, 5]] as const) {
      boss.hp = boss.maxhp * ratio;
      k.updateBoss(boss, 0, 100, 80, 0);
      expect(boss.boss!.phase).toBe(phase);
    }
    expect(boss.maxhp).toBe(bossHp(boss.boss!.def.hp));
    hurt.mockRestore();
  });
  it('escala uma única vez o guardião de masmorra e preserva recorde/checkpoint próprios', () => {
    const k = make(); k.bossesDone.add(CITADEL_UNLOCK_BOSS_ID); k.discoveries.add('citadel:bestFloor=10');
    enterCitadel(k, 10);
    const boss = k.enemies.find((e) => e.boss?.def.id === 'citadel_10');
    expect(k.depth?.profile).toBe('citadel'); expect(k.depth?.floor).toBe(10);
    expect(boss).toBeDefined(); expect(boss!.maxhp).toBe(bossHp(boss!.boss!.def.hp));
  });
  it('dispara a cutscene do trono ao derrotar Azrakel no andar 100', () => {
    const k = make(); k.bossesDone.add(CITADEL_UNLOCK_BOSS_ID); k.discoveries.add('citadel:bestFloor=99');
    enterCitadel(k, 100);
    const boss = k.enemies.find((e) => e.boss?.def.id === CITADEL_FINAL_BOSS_ID)!;
    expect(k.depth?.floor).toBe(100); expect(boss).toBeDefined();
    k.killEnemy(boss);
    expect(k.bossesDone.has(CITADEL_FINAL_BOSS_ID)).toBe(true);
    expect(k.cutscene?.beat.id).toBe(CITADEL_FINAL_BEAT_ID);
  });
  it('vence o Guardião no sexto piso, retorna ao mundo e abre o guia final com input pausado', () => {
    const k = make(); startTutorial(k);
    expect(k.depth?.kind).toBe('tutorial'); expect(k.tutorialPauseInput).toBe(true);
    enterTutorialFloor(k, TUTORIAL_FLOORS);
    const boss = k.enemies.find((e) => e.boss?.def.id === TUTORIAL_BOSS_ID)!;
    expect(k.depth?.floor).toBe(TUTORIAL_FLOORS); expect(boss).toBeDefined();
    k.killEnemy(boss);
    expect(k.depth).toBeNull(); expect(k.tutorialDone).toBe(true); expect(k.tutorialModalPending).toBe(true);
    expect(k.tutorialPauseInput).toBe(true); expect(k.p.points).toBeGreaterThanOrEqual(3);
  });
  it('pular o treino grava a dispensa e conserva os campos de tutorial no save', () => {
    const k = make(); startTutorial(k); skipTutorial(k);
    const saved = JSON.parse(localStorage.getItem('golden-arrow-save')!);
    expect(k.depth).toBeNull(); expect(k.tutorialPauseInput).toBe(true);
    expect(saved.tutorialDone).toBe(true); expect(saved.tutorialModalPending).toBe(true);
    const h = make(false); h.load();
    expect(h.tutorialDone).toBe(true); expect(h.tutorialModalPending).toBe(true);
    expect(h.tutorialPauseInput).toBe(false);
  });
  it('Ciclo do Eco: só após o epílogo, reinicia a campanha, reergue chefes mais fortes e persiste', () => {
    const k = make();
    expect(k.startCycle()).toBe(false);
    const before = k.enemies.find(e => e.boss?.def.id === 'obsidian_boss')!.maxhp;
    k.questStatus['f4'] = 'done'; k.questStatus['m6'] = 'done'; k.questStatus['sunflower_1'] = 'done';
    for (const id of ALL_ECO_BOSSES) k.bossesDone.add(id);
    expect(k.startCycle()).toBe(true);
    expect(k.cycle).toBe(1);
    expect(k.questStatus['f4']).toBeUndefined(); expect(k.questStatus['sunflower_1']).toBeUndefined(); expect(k.questStatus['m6']).toBe('done');
    const boss = k.enemies.find(e => e.boss?.def.id === 'obsidian_boss')!;
    expect(boss.alive).toBe(true); expect(boss.maxhp).toBeGreaterThan(before);
    expect(k.canStartCycle()).toBe(false);
    k.save(); const h = make(false); h.load(); expect(h.cycle).toBe(1);
    expect(h.enemies.find(e => e.boss?.def.id === 'obsidian_boss')!.maxhp).toBe(boss.maxhp);
  });
  it('inimigos de fronteira longe do centro ficam mais fortes que os das regiões iniciais', () => {
    const k = make(), near = FRONTIER_GATES[0];
    k.p.x = near.tx * TS; k.p.y = (near.ty + 2) * TS; k.populateFrontier();
    const nearMax = Math.max(...k.enemies.filter(e => !e.boss && e.hx > 320 * TS).map(e => e.level));
    k.frontierSector = ''; k.enemies = []; k.p.x = 2400 * TS; k.p.y = 2000 * TS; k.populateFrontier();
    const far = k.enemies.filter(e => !e.boss);
    expect(far.length).toBeGreaterThan(0);
    expect(Math.min(...far.map(e => e.level))).toBeGreaterThan(nearMax);
  });
  it('renderiza todos os biomas (grading, bloom, partículas, raios) sem erro', () => {
    const k = make();
    for (const b of ['plains', 'forest', 'cave', 'mountain', 'desert', 'volcanic', ...Object.keys(FRONTIER)] as const) {
      k.biome = b as never; k.time = 0.32; k.update(0.016); k.render(); k.time = 0.0; k.render();
    }
    k.biome = 'thunder' as never; k.flashT = 0; k.render(); expect(k.flash).toBeGreaterThan(0);
    k.interior = null; k.cutscene = { beat: { id: 't', trigger: 'new', title: 't', lines: ['a'] }, i: 0 }; k.update(0.016);
    expect(BOSSES.length).toBeGreaterThan(20);
  });
});
