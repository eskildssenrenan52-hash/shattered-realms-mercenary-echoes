// Liga a Saga dos Oito Céus ao motor: Oráculo e portais em Potos, zonas dos reinos,
// chefes de zona, capítulos de história, histórias paralelas, luzes e desenho.
import type { Game } from './engine';
import { ITEMS, type NpcDef, type BossDef, type EnemyKind } from './data';
import { generateFloor, type DungeonFloor } from './dungeon';
import { drawStairs, type Temple } from './depths';
import { drawChar } from './gfx';
import { TS, W, H, solidAt, type World } from './world';
import { enterDepthState } from './depthplay';
import { softGlow } from './perf';
import {
  SAGA_REALMS, ORACLE_REALMS, SIDE_STORIES, sagaBossId, zoneLevel, bossStats, realmUnlocked, zoneUnlocked, realmDone,
  sideKey, sideChoiceKey, sideStepOf, sideDone, sidesOf, actRealmUnlocked, type SagaRealm, type SagaZone, type SideStory,
} from './saga';
import type { Beat } from './story';
import './saga-extra';
import { drawSagaScenery, drawSagaWeather, sagaSceneLights } from './saga-fx';
import { bossHp } from './boss-tuning';
import { beyondBossModifiers } from './echoes-balance';
import { MANOPLA_ITEM, MANOPLA_QUEST } from './manopla';
import { sagaModeOnKill, sagaModeStatus, sagaModeTick as tickSagaMode, startSagaMode } from './saga-modes';

/* ───────────── Itens lendários de cada reino ───────────── */
for (const [i, r] of SAGA_REALMS.entries()) {
  const k = r.gate ? Math.max(1, Math.round(r.level / 9)) : i + 1, rw = r.reward;
  ITEMS[rw.item] ??= rw.slot === 'weapon'
    ? { id: rw.item, name: rw.name, type: 'weapon', weapon: 'spear', atk: 160, bonus: { str: 40, int: 40, dex: 30, vit: 30, hp: 900, mp: 400 }, desc: rw.desc, color: r.color, price: 99999 }
    : { id: rw.item, name: rw.name, type: rw.slot, ...(rw.slot === 'armor' ? { def: 20 + k * 9 } : {}), bonus: { str: 5 + k * 4, int: 5 + k * 4, vit: 4 + k * 3, dex: 3 + k * 3, hp: 120 + k * 90, mp: 60 + k * 40 }, desc: rw.desc, color: r.color, price: 5000 * k };
}

ITEMS[MANOPLA_ITEM] ??= { id: MANOPLA_ITEM, name: 'Manopla de Vésper', type: 'ring', bonus: { str: 4, int: 4, dex: 3, vit: 3, hp: 60, mp: 30 }, desc: 'A mão da Primeira Cartógrafa. Abre a Fenda Costurada, a oeste do Oráculo em Potos.', color: '#e8c070', price: 0 };

/** Aparência dos chefes de saga (lida pelo motor ao desenhar chefes). */
export const SAGA_BOSS_LOOK: Record<string, { kind: EnemyKind; tint: string; scale: number }> = Object.fromEntries(
  SAGA_REALMS.flatMap((r) => r.zones.map((zn, i) => [sagaBossId(r, i), { kind: zn.boss.kind, tint: zn.boss.tint, scale: zn.boss.scale }])),
);

const done = (g: Game) => (id: string) => g.bossesDone.has(id);
const has = (g: Game) => (k: string) => g.discoveries.has(k);

/* ───────────── Oráculo e Círculo dos Oito Portais ───────────── */
export const ORACLE: NpcDef = { id: 'saga_oracle', name: 'Oráculo Seraphine', title: 'Voz dos Oito Céus', tx: 0, ty: 0, pal: { skin: '#f0d8c8', hair: '#e0e0ff', body: '#6040a0', legs: '#302050', accent: '#c0a0ff' }, lines: [] };
let plaza: { oracle: { tx: number; ty: number }; portals: { tx: number; ty: number }[]; rift: { tx: number; ty: number }; acts: { tx: number; ty: number } } | null = null;
function walk(world: World, x: number, y: number) { return x > 3 && y > 3 && x < W - 4 && y < H - 4 && !solidAt(world, x * TS + 8, y * TS + 8); }
function nearestFree(world: World, bx: number, by: number) {
  for (let r = 0; r < 14; r++) for (let k = -r; k <= r; k++) for (const [x, y] of [[bx + k, by - r], [bx + k, by + r], [bx - r, by + k], [bx + r, by + k]] as const) if (walk(world, x, y)) return { tx: x, ty: y };
  return { tx: bx, ty: by };
}
export function sagaPlaza(world: World) {
  if (plaza) return plaza;
  const o = nearestFree(world, 104, 140);
  const portals = ORACLE_REALMS.map((_, i) => { const a = (i / ORACLE_REALMS.length) * Math.PI * 2 - Math.PI / 2; return nearestFree(world, Math.round(o.tx + Math.cos(a) * 7), Math.round(o.ty + Math.sin(a) * 5)); });
  plaza = { oracle: o, portals, rift: nearestFree(world, o.tx - 13, o.ty + 3), acts: nearestFree(world, o.tx + 13, o.ty + 3) }; return plaza;
}
/** Viagem segura ao marco do Atlas: mantém o jogador em Potos e cancela movimento pendente. */
export function travelToActMap(g: Game) {
  if (g.depth || g.island || g.sea) return false;
  const p = sagaPlaza(g.overworld).acts;
  g.p.x = p.tx * TS + 8; g.p.y = p.ty * TS + 8; g.p.vx = 0; g.p.vy = 0;
  g.moveTarget = null; g.targetEnemy = null;
  g.toast('Você chega ao Mapa dos Atos, ao lado do Oráculo.', '#c8dcff');
  return true;
}

/* ───────────── Estado da zona atual ───────────── */
interface SagaPos { realm: SagaRealm; ri: number; zi: number; zone: SagaZone }
const zoneTemples = new Map<string, Temple>();
function zoneTemple(r: SagaRealm, i: number): Temple {
  const id = `saga_${r.id}_${i}`; let t = zoneTemples.get(id);
  if (!t) { const zn = r.zones[i]!; t = { id, biome: zn.biome, name: zn.name, family: 'marble', hue: 0, stair: 'spiral', tx: 0, ty: 0, level: zoneLevel(r, i), lore: zn.lore }; zoneTemples.set(id, t); }
  return t;
}
export function sagaPosOf(g: Game): SagaPos | null {
  const id = g.depth?.temple?.id; if (!id || !id.startsWith('saga_')) return null;
  const parts = id.split('_'), ri = SAGA_REALMS.findIndex((r) => r.id === parts[1]), zi = Number(parts[2]);
  const realm = SAGA_REALMS[ri]; if (!realm) return null;
  return { realm, ri, zi, zone: realm.zones[zi]! };
}
export const isSaga = (t?: Temple) => !!t && t.id.startsWith('saga_');
const floorCache = new Map<string, DungeonFloor>();
function zoneFloor(r: SagaRealm, ri: number, i: number): DungeonFloor {
  const key = `${r.id}_${i}`; const hit = floorCache.get(key); if (hit) return hit;
  const zn = r.zones[i]!, last = i === r.zones.length - 1, lvl = zoneLevel(r, i);
  const f = generateFloor(Math.min(99, 10 + ri * 11 + i * 2), {
    theme: { name: zn.name, floor: zn.floor, wall: zn.wall, deco: zn.deco, biome: zn.biome, enemies: [...zn.enemies], color: zn.color, lore: zn.lore },
    seed: 910_001 + ri * 104_729 + i * 7_919, size: { w: (last ? 104 : 88) + (i % 3) * 8, h: (last ? 78 : 64) + (i % 2) * 6 }, level: lvl, idPrefix: `saga_${r.id}_${i}`, eliteBonus: 0.06 + ri * 0.015,
  });
  if (zn.mode === 'town') {
    const wanted = Math.max(2, zn.secrets ?? 2);
    for (let k = f.chests.length; k < wanted; k++) {
      const room = f.rooms[f.rooms.length - 1 - (k % Math.min(6, f.rooms.length))]!;
      f.chests.push({ id: `saga_${r.id}_${i}-secret-${k}`, tx: room.x + room.w - 2, ty: room.y + room.h - 2, gold: 180 + lvl * 45, item: ['mana_shard', 'hi_potion', 'ether'][k % 3]!, qty: 1 + (k % 2) });
    }
  }
  // Mais luz nas zonas abertas: tochas extras nas salas.
  for (const room of f.rooms) if (room.w > 8) f.torches.push({ tx: room.x + Math.floor(room.w / 2), ty: room.y - 1 });
  floorCache.set(key, f); return f;
}

/* ───────────── Cenas ───────────── */
function play(g: Game, beat: Beat) {
  if (g.seenBeats.has(beat.id) || g.beatQueue.some((b) => b.id === beat.id)) return;
  g.beatQueue.push(beat); if (!g.cutscene) g.nextBeat();
}
export const sagaBeats = (): Beat[] => SAGA_REALMS.flatMap((r) => [
  { id: `saga_pro_${r.id}`, trigger: 'saga', title: `${r.subtitle}`, lines: r.prologue },
  ...r.zones.map((zn, i) => ({ id: `saga_win_${r.id}_${i}`, trigger: 'saga', title: `${r.name} · ${zn.name}`, lines: zn.boss.victory })),
  { id: `saga_epi_${r.id}`, trigger: 'saga', title: `${r.name} · Epílogo`, lines: r.epilogue },
]);

/* ───────────── Entrar nas zonas ───────────── */
export function enterSagaZone(g: Game, ri: number, zi: number) {
  const r = SAGA_REALMS[ri]!, zn = r.zones[zi]!, data = zoneFloor(r, ri, zi);
  const echoCycle = r.gate === 'ecos' ? beyondBossModifiers(g.echoSystems, r.id) : { hp: 1, atk: 1, reward: 1 };
  const cycleStrength = r.gate === 'ecos' ? Math.min(0.6, g.echoSystems.beyond.cycle * 0.06) : 0;
  enterDepthState(g, { kind: 'temple', floor: zi + 1, temple: zoneTemple(r, zi), data, stair: 'spiral' }, 1.15 + ri * 0.04 + cycleStrength);
  const id = sagaBossId(r, zi);
  if (!g.bossesDone.has(id) && zn.mode !== 'town' && zn.mode !== 'survival') {
    const st = bossStats(r, zi), end = data.stairs;
    const def: BossDef = { id, name: zn.boss.name, biome: zn.biome, tx: end.tx, ty: end.ty - 2, hp: Math.round(st.hp * echoCycle.hp), atk: Math.round(st.atk * echoCycle.atk), xp: Math.round(st.xp * echoCycle.reward), gold: Math.round(st.gold * echoCycle.reward), color: zn.boss.tint, minion: zn.enemies[0]!, reward: ['elixir', 'hi_potion', 'eco_shard'] };
    const e = g.makeEnemy(zn.boss.kind, def.tx * TS + 8, def.ty * TS + 8, 1);
    e.hp = e.maxhp = bossHp(def.hp); e.atk = def.atk; e.def = 8 + Math.floor(st.level / 3); e.xp = def.xp; e.gold = def.gold; e.speed = 32; e.level = st.level;
    e.boss = { def, active: false, phase: 1, patT: 2, attackIndex: 0, charge: 0, cvx: 0, cvy: 0 };
    g.enemies.push(e);
  }
  startSagaMode(g, r, ri, zi, zn, data);
  g.discoveries.add(`saga:${r.id}:${zi}`);
  if (g.echoSystems.caravans.active?.realm === r.id) g.echoSystems.caravans.active.arrivalVerified = true;
  g.biomeBanner = { name: `✦ ${r.name} · ${zn.name} · Nv ${zoneLevel(r, zi)}+`, t: 5 };
  g.toast(zn.lore, zn.color);
  if (zi === 0) play(g, { id: `saga_pro_${r.id}`, trigger: 'saga', title: r.subtitle, lines: r.prologue });
  if (zn.mode === 'town') g.toast(`Cidade viva: converse com ${zn.npcs?.[0]?.name ?? 'os moradores'} e procure ${Math.max(2, zn.secrets ?? 2)} segredos.`, zn.color);
  else if (!g.bossesDone.has(id) && zn.mode !== 'survival') g.toast(`⚔ ${zn.boss.name}: ${zn.boss.intro}`, '#ff9080');
  g.save();
}

/** Chamado pelo motor quando um chefe cai. */
export function sagaVictoryLines(zn: SagaZone) {
  const victory = zn.boss.victory.filter(Boolean);
  return victory.length ? victory : [`${zn.name} recupera seu ritmo. A cidade abre o caminho sem exigir que ninguém se perca.`];
}
export function sagaOnBoss(g: Game, id: string) {
  let echoStateChanged = false;
  for (const [ri, r] of SAGA_REALMS.entries()) for (const [i, zn] of r.zones.entries()) {
    if (sagaBossId(r, i) !== id) continue;
    if (r.gate === 'ecos') {
      const memoryKey = `dream:memory:${id}`;
      if (!g.discoveries.has(memoryKey)) {
        g.discoveries.add(memoryKey);
        g.echoSystems.dreams.memories = Math.min(9, g.echoSystems.dreams.memories + 1);
        echoStateChanged = true;
        g.toast('Memória de Eco coletada. Use-a numa Expedição Onírica em Ecos Além.', '#bfefff');
      }
    }
    play(g, { id: `saga_win_${r.id}_${i}`, trigger: 'saga', title: `${r.name} · ${zn.name}`, lines: sagaVictoryLines(zn) });
    if (i === r.zones.length - 1) {
      play(g, { id: `saga_epi_${r.id}`, trigger: 'saga', title: `${r.name} · Epílogo`, lines: r.epilogue });
      if (g.addItem(r.reward.item)) g.toast(`✦ Relíquia da Saga: ${r.reward.name}`, r.color);
      if (r.gate === 'manopla') {
        const chain = SAGA_REALMS.filter((x) => x.gate === r.gate), nx = chain[chain.indexOf(r) + 1];
        g.toast(nx ? `🧤 A Manopla costura uma nova Fenda: ${nx.name}.` : '✦ As Travessias da Manopla estão completas. Vésper descansa.', '#ffd27a');
      } else if (r.gate === 'atos') {
        g.toast('✦ O Mapa dos Atos registra esta história. Outros reinos se abrirão quando a campanha principal avançar.', '#c8dcff');
      } else if (r.gate === 'ecos') {
        if (!g.echoSystems.restoration.freedRealms.includes(r.id)) {
          g.echoSystems.restoration.freedRealms.push(r.id);
          g.echoSystems.restoration.level = Math.min(3, g.echoSystems.restoration.freedRealms.length);
          if (!g.echoSystems.cartography.routes.includes(r.id)) g.echoSystems.cartography.routes.push(r.id);
          g.discoveries.add(`potos:restored:${r.id}`);
          echoStateChanged = true;
          g.toast(`Potos muda: moradores de ${r.name} retornam, uma loja abre e uma rota é traçada no Atlas.`, '#a0ffa0');
        }
        g.toast('✦ Ecos Além guarda esta cidade. O próximo horizonte já pode ser escolhido no Mapa dos Atos.', '#e4b8ff');
      } else {
        const next = ORACLE_REALMS[ri + 1];
        g.toast(next ? `🌀 Um novo portal desperta em Potos: ${next.name}.` : '✦ A Saga dos Oito Céus está completa!', '#ffd040');
      }
    } else g.toast(`O caminho para ${r.zones[i + 1]!.name} está aberto.`, '#a0ffa0');
  }
  if (echoStateChanged) g.save();
}

/* ───────────── Contagem de abates por reino ───────────── */
const killKeyPrefix = (realm: string) => `sagakills:${realm}=`;
export function realmKills(g: Game, realm: string) {
  const p = killKeyPrefix(realm); for (const k of g.discoveries) if (k.startsWith(p)) return Number(k.slice(p.length)) || 0; return 0;
}
function setRealmKills(g: Game, realm: string, n: number) {
  const p = killKeyPrefix(realm); for (const k of [...g.discoveries]) if (k.startsWith(p)) g.discoveries.delete(k); g.discoveries.add(p + n);
}
export function sagaOnKill(g: Game) { const pos = sagaPosOf(g); if (pos) { sagaModeOnKill(g); setRealmKills(g, pos.realm.id, realmKills(g, pos.realm.id) + 1); } }
const baseKey = (s: SideStory, i: number) => `side:${s.id}:base${i}=`;
function stepBase(g: Game, s: SideStory, i: number) {
  const p = baseKey(s, i); for (const k of g.discoveries) if (k.startsWith(p)) return Number(k.slice(p.length)) || 0;
  const n = realmKills(g, s.realm); g.discoveries.add(p + n); return n;
}

/* ───────────── Histórias paralelas ───────────── */
export function sideProgress(g: Game, s: SideStory) {
  const i = sideStepOf(s, has(g)), st = s.steps[i];
  if (!st) return { i, text: 'Concluída', ready: false };
  const r = SAGA_REALMS.find((x) => x.id === s.realm)!;
  if (st.kind === 'kill') { const n = Math.max(0, realmKills(g, s.realm) - stepBase(g, s, i)); return { i, text: `${st.hint} (${Math.min(n, st.n!)}/${st.n})`, ready: n >= st.n! }; }
  if (st.kind === 'boss') return { i, text: st.hint, ready: g.bossesDone.has(sagaBossId(r, st.zone)) };
  if (st.kind === 'bring') return { i, text: `${st.hint} (${Math.min(g.count(st.item!), st.n!)}/${st.n})`, ready: g.count(st.item!) >= st.n! };
  return { i, text: st.hint, ready: true };
}
function npcOf(s: SideStory): NpcDef { return { id: `side_${s.id}`, name: s.npc.name, title: s.npc.title, tx: 0, ty: 0, pal: s.npc.pal, lines: [] }; }
function finishStep(g: Game, s: SideStory, i: number, opt = 0) {
  g.discoveries.add(sideKey(s, i)); g.audio.sfx('level'); g.burst(g.p.x, g.p.y - 12, '#ffe0a0', 24, 60, 2, -30);
  if (sideDone(s, has(g))) {
    const rw = s.reward; g.p.gold += rw.gold; g.gainXp(rw.xp); g.addItem(rw.item, rw.qty);
    const end = s.ending[opt] || s.ending[0];
    g.dialog = { npc: npcOf(s), text: `✦ História concluída: ${s.name}\n\n${end}\n\n+${rw.gold} ouro · +${rw.xp} XP · ${rw.qty}× ${ITEMS[rw.item]?.name ?? rw.item}`, choices: [{ label: 'Fechar', act: () => { g.dialog = null; } }] };
    g.toast(`✦ ${s.name}`, '#ffd040');
  } else {
    const nx = s.steps[i + 1]!; if (nx.kind === 'kill') stepBase(g, s, i + 1);
    const r = SAGA_REALMS.find((x) => x.id === s.realm)!;
    g.dialog = { npc: npcOf(s), text: `${nx.text}\n\n→ ${nx.hint}${nx.zone !== s.steps[i]!.zone ? `\n(Local: ${r.zones[nx.zone]!.name})` : ''}`, choices: [{ label: 'Pode deixar', act: () => { g.dialog = null; } }] };
  }
  g.save();
}
function talkSide(g: Game, s: SideStory) {
  const pr = sideProgress(g, s), st = s.steps[pr.i]!, npc = npcOf(s), close = () => { g.dialog = null; };
  if (st.kind === 'choice') {
    g.dialog = { npc, text: st.text, choices: [
      { label: st.options![0], act: () => { g.discoveries.add(sideChoiceKey(s, 0)); finishStep(g, s, pr.i, 0); } },
      { label: st.options![1], act: () => { g.discoveries.add(sideChoiceKey(s, 1)); finishStep(g, s, pr.i, 1); } },
      { label: 'Pensar mais um pouco', act: close },
    ] };
    return;
  }
  if (st.kind === 'talk') { if (pr.i === 0) g.dialog = { npc, text: st.text, choices: [{ label: 'Eu ajudo', act: () => finishStep(g, s, pr.i) }, { label: 'Agora não', act: close }] }; else finishStep(g, s, pr.i); return; }
  if (!pr.ready) { g.dialog = { npc, text: `${st.text}\n\n→ ${pr.text}`, choices: [{ label: 'Já volto', act: close }] }; return; }
  if (st.kind === 'bring') g.removeItem(st.item!, st.n!);
  finishStep(g, s, pr.i);
}
/** NPCs de histórias paralelas presentes nesta zona, com a posição na sala. */
function sideNpcsHere(g: Game, pos: SagaPos) {
  const data = g.depth!.data, out: { s: SideStory; tx: number; ty: number }[] = [];
  for (const [k, s] of sidesOf(pos.realm.id).entries()) {
    const i = sideStepOf(s, has(g)), st = s.steps[i]; if (!st || st.zone !== pos.zi) continue;
    const room = data.rooms[(1 + k * 2) % data.rooms.length]!;
    out.push({ s, tx: room.x + Math.floor(room.w / 2) + 1, ty: room.y + Math.floor(room.h / 2) });
  }
  return out;
}

/** Moradores de cidades da expansão: o primeiro abre a zona e os demais contam segredos. */
function townNpcsHere(g: Game, pos: SagaPos) {
  if (pos.zone.mode !== 'town') return [] as { n: NonNullable<SagaZone['npcs']>[number]; k: number; tx: number; ty: number }[];
  const data = g.depth!.data;
  return (pos.zone.npcs ?? []).map((n, k) => {
    const room = data.rooms[(k * 2 + 1) % data.rooms.length]!;
    return { n, k, tx: room.x + Math.floor(room.w / 2), ty: room.y + Math.floor(room.h / 2) };
  });
}
function completeTown(g: Game, pos: SagaPos) {
  const id = sagaBossId(pos.realm, pos.zi);
  if (g.bossesDone.has(id)) return;
  g.bossesDone.add(id);
  g.discoveries.add(`saga:town:${pos.realm.id}:${pos.zi}`);
  g.toast(`${pos.zone.name} confia em você. O caminho está aberto.`, '#a0ffa0');
  sagaOnBoss(g, id);
  g.save();
}
function talkTown(g: Game, pos: SagaPos, hit: ReturnType<typeof townNpcsHere>[number]) {
  const id = sagaBossId(pos.realm, pos.zi), key = hit.k === 0 && !g.bossesDone.has(id);
  const text = `${hit.n.lines.join('\n\n')}${key ? '\n\nA cidade entrega sua confiança: o próximo caminho será aberto.' : ''}`;
  g.dialog = { npc: { id: `town_${pos.realm.id}_${pos.zi}_${hit.k}`, name: hit.n.name, title: hit.n.title, tx: hit.tx, ty: hit.ty, pal: hit.n.pal, lines: [] }, text, choices: [
    ...(key ? [{ label: 'Aceitar a confiança da cidade', act: () => { g.dialog = null; completeTown(g, pos); } }] : []),
    { label: key ? 'Ainda não' : 'Agradecer', act: () => { g.dialog = null; } },
  ] };
}

/* ───────────── Interação ───────────── */
const near = (g: Game, tx: number, ty: number, r = 22) => Math.hypot(g.p.x - tx * TS - 8, g.p.y - ty * TS - 8) < r;
function chooseZone(g: Game, ri: number) {
  const r = SAGA_REALMS[ri]!, d = done(g);
  const open = r.zones.map((_, i) => i).filter((i) => zoneUnlocked(r, i, d));
  const choices = open.slice(-5).map((i) => ({ label: `${g.bossesDone.has(sagaBossId(r, i)) ? '✓' : '⚔'} ${r.zones[i]!.name} (Nv ${zoneLevel(r, i)})`, act: () => { g.dialog = null; enterSagaZone(g, ri, i); } }));
  choices.push({ label: 'Agora não', act: () => { g.dialog = null; } });
  g.dialog = { npc: { ...ORACLE, name: r.name, title: r.subtitle }, text: `${r.prologue[1] ?? r.prologue[0]}\n\nZonas abertas: ${open.length}/${r.zones.length} · Nível recomendado ${r.level}+`, choices };
}
function oracleTalk(g: Game) {
  const d = done(g), cur = ORACLE_REALMS.findIndex((r) => !realmDone(r, d));
  const total = ORACLE_REALMS.reduce((n, r) => n + r.zones.filter((_, i) => d(sagaBossId(r, i))).length, 0), all = ORACLE_REALMS.reduce((n, r) => n + r.zones.length, 0);
  const sides = SIDE_STORIES.filter((s) => sideDone(s, has(g))).length;
  const text = cur < 0
    ? `Você completou a Saga dos Oito Céus. Os portais continuam abertos para quem quiser revisitar os reinos.\n\nZonas: ${total}/${all} · Histórias: ${sides}/${SIDE_STORIES.length}`
    : `${cur === 0 ? 'Eu esperava você, viajante. A Deusa Lyria foi acorrentada numa ilha que não existe nos mapas, e o Rei Demônio Azrakel quer a voz dela para abrir o Inferno.' : `O próximo céu chama: ${SAGA_REALMS[cur]!.name}.`}\n\nEntre no portal que brilha ao meu redor.\n\nZonas vencidas: ${total}/${all} · Histórias paralelas: ${sides}/${SIDE_STORIES.length}`;
  g.dialog = { npc: ORACLE, text, choices: [
    ...(cur >= 0 ? [{ label: `Ir para ${SAGA_REALMS[cur]!.name}`, act: () => chooseZone(g, cur) }] : []),
    { label: 'Fechar', act: () => { g.dialog = null; } },
  ] };
}
function actMapTalk(g: Game) {
  const list = SAGA_REALMS.map((r, i) => ({ r, i })).filter(({ r }) => r.gate === 'atos');
  const complete = list.filter(({ r }) => realmDone(r, done(g))).length;
  const ecosOpen = actRealmUnlocked(5, g.questStatus);
  g.dialog = { npc: { ...ORACLE, name: 'Mapa dos Atos', title: 'Rotas da Canção' }, text: `${list.length} caminhos, um para cada Ato, existem quando uma parte da Canção foi concluída.\n\nReinos explorados: ${complete}/${list.length}\n\nOs lacres respondem à campanha principal — não à ordem dos portais.`, choices: [
    ...list.map(({ r, i }) => {
      const open = actRealmUnlocked(r.act ?? 1, g.questStatus);
      return { label: open ? `${realmDone(r, done(g)) ? '✓' : '✦'} Ato ${r.act}: ${r.name}` : `🔒 Ato ${r.act}: ${r.name}`, act: () => {
        if (open) chooseZone(g, i);
        else g.toast(`O Mapa aguarda o final do Ato ${r.act}.`, '#a0a0c0');
      } };
    }),
    { label: ecosOpen ? '✦ Ecos Além — cidades pós-Ato V' : '🔒 Ecos Além — conclua o Ato V', act: () => { if (ecosOpen) ecosMapTalk(g); else g.toast('A Canção ainda não chegou ao seu último Ato.', '#a0a0c0'); } },
    { label: 'Fechar o mapa', act: () => { g.dialog = null; } },
  ] };
}
function ecosMapTalk(g: Game) {
  const list = SAGA_REALMS.map((r, i) => ({ r, i })).filter(({ r }) => r.gate === 'ecos');
  const complete = list.filter(({ r }) => realmDone(r, done(g))).length;
  g.dialog = { npc: { ...ORACLE, name: 'Ecos Além', title: 'Cidades depois da Canção' }, text: `A Coroa está quieta, mas o mundo não acabou. Cinco cidades-reinos pedem ajuda para aprender a viver depois do último Eco.\n\nCidades restauradas: ${complete}/${list.length}`, choices: [
    ...list.map(({ r, i }) => ({ label: `${realmDone(r, done(g)) ? '✓' : '✦'} ${r.name} (Nv ${r.level}+)`, act: () => chooseZone(g, i) })),
    { label: 'Voltar ao Mapa dos Atos', act: () => actMapTalk(g) },
  ] };
}
/* ───────────── A Fenda Costurada (Travessias da Manopla) ───────────── */
export const hasManopla = (g: Game) => g.questStatus[MANOPLA_QUEST] === 'done';
const VESPER: NpcDef = { ...ORACLE, id: 'manopla_vesper', name: 'Vésper (na Manopla)', title: 'A Primeira Cartógrafa', pal: { skin: '#f0d8b0', hair: '#f0e8d0', body: '#a07030', legs: '#503820', accent: '#ffd27a' } };
function riftTalk(g: Game) {
  const d = done(g), list = SAGA_REALMS.map((r, i) => ({ r, i })).filter((x) => x.r.gate === 'manopla');
  const cur = list.find((x) => !realmDone(x.r, d));
  const text = cur
    ? `A Manopla vibra perto da costura. Vésper sussurra:\n\n— ${cur.r.prologue[2] ?? cur.r.prologue[0]}\n\nTravessias concluídas: ${list.filter((x) => realmDone(x.r, d)).length}/${list.length}`
    : 'Vésper: — Todas as Fendas estão costuradas de volta ao mundo. Mas a porta continua aberta, se quiser rever os lugares que salvamos.';
  g.dialog = { npc: VESPER, text, choices: [
    ...list.filter((x) => realmUnlocked(x.i, d)).map((x) => ({ label: `${realmDone(x.r, d) ? '✓' : '🧤'} ${x.r.name} (Nv ${x.r.level}+)`, act: () => chooseZone(g, x.i) })),
    { label: 'Fechar', act: () => { g.dialog = null; } },
  ] };
}
export function sagaSurfaceAction(g: Game, run: boolean): string {
  const pz = sagaPlaza(g.overworld), d = done(g);
  if (near(g, pz.acts.tx, pz.acts.ty, 24)) { if (run) actMapTalk(g); return 'E · Mapa dos Atos — Reinos da Canção'; }
  if (near(g, pz.rift.tx, pz.rift.ty, 22)) {
    const ok = hasManopla(g);
    if (run) { if (ok) riftTalk(g); else g.toast('Uma cicatriz costurada no chão. Algo do outro lado bate, como um coração. Falta uma chave... ou uma mão.', '#d0b080'); }
    return ok ? 'E · Fenda Costurada — Travessias da Manopla' : 'Fenda Costurada (selada)';
  }
  if (near(g, pz.oracle.tx, pz.oracle.ty, 24)) { if (run) oracleTalk(g); return 'E · Oráculo Seraphine — A Saga dos Oito Céus'; }
  for (const [i, p] of pz.portals.entries()) {
    if (!near(g, p.tx, p.ty, 20)) continue;
    const r = ORACLE_REALMS[i]!, open = realmUnlocked(i, d);
    if (run) { if (open) chooseZone(g, i); else g.toast(`O portal de ${r.name} está selado. Complete ${ORACLE_REALMS[i - 1]!.name} primeiro.`, '#ff9a80'); }
    return open ? `E · Portal: ${r.name} (Nv ${r.level}+)` : `Portal selado: ${r.name}`;
  }
  return '';
}
export function sagaDepthAction(g: Game, run: boolean): string {
  const pos = sagaPosOf(g); if (!pos) return '';
  const data = g.depth!.data, { realm: r, ri, zi } = pos;
  for (const n of townNpcsHere(g, pos)) if (near(g, n.tx, n.ty, 24)) { if (run) talkTown(g, pos, n); return `E · ${n.n.name} — ${n.n.title}`; }
  for (const n of sideNpcsHere(g, pos)) if (near(g, n.tx, n.ty, 24)) { if (run) talkSide(g, n.s); return `E · ${n.s.npc.name} — ${n.s.name}`; }
  if (near(g, data.start.tx, data.start.ty, 20)) {
    if (run) { if (zi > 0) enterSagaZone(g, ri, zi - 1); else { g.depth = g.depth; leaveToSurface(g); } }
    return zi > 0 ? `E · Voltar para ${r.zones[zi - 1]!.name}` : 'E · Voltar a Potos';
  }
  if (near(g, data.stairs.tx, data.stairs.ty, 22)) {
    const locked = !g.bossesDone.has(sagaBossId(r, zi)), last = zi === r.zones.length - 1;
    if (run) {
      if (locked) g.toast(`${pos.zone.boss.name} bloqueia o caminho.`, '#ff8080');
      else if (last) { const id = `saga_${r.id}-altar`; if (!g.openedChests.has(id)) g.claimChest(id, 2000 + r.level * 120, 'elixir', 3, `Altar de ${r.name}`); leaveToSurface(g); }
      else enterSagaZone(g, ri, zi + 1);
    }
    return locked ? `Selado por ${pos.zone.boss.name}` : last ? 'E · Voltar a Potos em glória' : `E · Seguir para ${r.zones[zi + 1]!.name}`;
  }
  return '';
}
// eslint-disable-next-line no-var
var leaveImpl: ((g: Game) => void) | null | undefined;
export function setSagaLeave(f: (g: Game) => void) { leaveImpl = f; }
function leaveToSurface(g: Game) { leaveImpl?.(g); }

/* ───────────── Desenho ───────────── */
/** A Fenda Costurada: uma cicatriz no chão, presa por pontos de latão; com a Manopla, ela se abre em luz. */
function drawRift(c: CanvasRenderingContext2D, x: number, y: number, open: boolean, wt: number) {
  c.save();
  c.globalAlpha = 0.55; c.fillStyle = '#120a06'; c.beginPath(); c.ellipse(x, y, 18, 6, 0, 0, Math.PI * 2); c.fill();
  const pts = [-16, -11, -6, -1, 4, 9, 14], amp = open ? 3 + Math.sin(wt * 2) * 1.2 : 1;
  c.globalAlpha = 1; c.lineWidth = 2; c.strokeStyle = open ? '#ffd27a' : '#3a2a20';
  c.beginPath(); pts.forEach((dx, k) => { const yy = y + Math.sin(k * 1.7) * 2; if (k === 0) c.moveTo(x + dx, yy); else c.lineTo(x + dx, yy); }); c.stroke();
  if (open) {
    c.globalCompositeOperation = 'lighter';
    softGlow(c, x, y - 2, 28, 'rgba(255,200,110,0.45)');
    for (let k = 0; k < 6; k++) { const t = (wt * 0.5 + k / 6) % 1; c.globalAlpha = 1 - t; c.fillStyle = k % 2 ? '#ffe6b0' : '#9ef6ff'; c.fillRect(x - 12 + k * 5, y - 4 - t * 26, 2, 2); }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  }
  // pontos de costura em latão
  for (const [k, dx] of pts.entries()) { const yy = y + Math.sin(k * 1.7) * 2; c.fillStyle = '#c89a50'; c.fillRect(x + dx - 1, yy - amp - 1, 2, 2); c.fillRect(x + dx - 1, yy + amp - 1, 2, 2); c.fillStyle = '#8a6a30'; c.fillRect(x + dx, yy - amp, 1, amp * 2); }
  c.restore();
}
function drawPortal(c: CanvasRenderingContext2D, x: number, y: number, col: string, open: boolean, wt: number, i: number) {
  c.save();
  c.globalAlpha = 0.5; c.fillStyle = '#1a1028'; c.beginPath(); c.ellipse(x, y + 2, 15, 5, 0, 0, Math.PI * 2); c.fill();
  // arco de pedra
  c.globalAlpha = 1; c.fillStyle = '#5a5470'; c.fillRect(x - 13, y - 30, 4, 32); c.fillRect(x + 9, y - 30, 4, 32);
  c.fillStyle = '#8a84a0'; c.fillRect(x - 13, y - 30, 4, 2); c.fillRect(x + 9, y - 30, 4, 2);
  c.fillStyle = '#6a6488'; c.beginPath(); c.arc(x, y - 30, 13, Math.PI, 0); c.lineTo(x + 9, y - 30); c.arc(x, y - 30, 9, 0, Math.PI, true); c.closePath(); c.fill();
  c.fillStyle = col; c.fillRect(x - 2, y - 45, 4, 4);
  if (open) {
    c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) {
      const a = wt * (1.4 + k * 0.3) + k * 1.6 + i;
      c.globalAlpha = 0.25 + 0.12 * Math.sin(wt * 3 + k); c.strokeStyle = col; c.lineWidth = 2;
      c.beginPath(); c.ellipse(x, y - 15, 8 - k * 1.5, 14 - k * 2.5, Math.sin(a) * 0.2, a, a + Math.PI * 1.4); c.stroke();
    }
    c.globalAlpha = 0.35 + 0.15 * Math.sin(wt * 4 + i); c.fillStyle = col; c.beginPath(); c.ellipse(x, y - 15, 8, 14, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 6; k++) { const t = (wt * 0.7 + k / 6 + i * 0.13) % 1; c.globalAlpha = 1 - t; c.fillRect(x + Math.sin(k * 2.1 + wt) * 9, y - 4 - t * 34, 2, 2); }
  } else { c.globalAlpha = 0.5; c.fillStyle = '#20182c'; c.beginPath(); c.ellipse(x, y - 15, 8, 14, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function drawActMap(c: CanvasRenderingContext2D, x: number, y: number, wt: number) {
  c.save();
  c.globalAlpha = 0.35; c.fillStyle = '#0c1020'; c.beginPath(); c.ellipse(x, y + 2, 20, 6, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1; c.fillStyle = '#d8c28e'; c.fillRect(x - 15, y - 20, 30, 22); c.fillStyle = '#8a6840'; c.fillRect(x - 15, y - 20, 30, 2); c.fillRect(x - 15, y, 30, 2);
  c.fillStyle = '#6c4c38'; c.fillRect(x - 1, y - 18, 2, 19); c.fillStyle = '#c09058';
  for (let k = 0; k < 5; k++) { const a = wt * 0.6 + k * 1.26; c.fillRect(x + Math.cos(a) * 10 - 1, y - 9 + Math.sin(a) * 6 - 1, 3, 3); }
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.35 + Math.sin(wt * 3) * 0.12; softGlow(c, x, y - 9, 28, 'rgba(180,210,255,0.5)'); c.restore();
}
export function drawSaga(g: Game, c: CanvasRenderingContext2D, draws: { y: number; f: () => void }[], x0: number, y0: number, x1: number, y1: number, wt: number) {
  const vis = (tx: number, ty: number) => tx >= x0 - 3 && tx <= x1 + 3 && ty >= y0 - 3 && ty <= y1 + 4;
  if (!g.depth) {
    if (g.interior) return;
    const pz = sagaPlaza(g.overworld), d = done(g);
    if (vis(pz.oracle.tx, pz.oracle.ty)) {
      const x = pz.oracle.tx * TS + 8, y = pz.oracle.ty * TS + 14;
      draws.push({ y, f: () => {
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 + Math.sin(wt * 2) * 0.15; softGlow(c, x, y - 10, 26, 'rgba(190,150,255,0.5)'); c.restore();
        drawChar(c, x, y - Math.sin(wt * 2) * 1.5, ORACLE.pal, 0, Math.floor(wt * 2) % 2);
        c.fillStyle = '#ffd040'; c.fillRect(x - 1, y - 30 - Math.sin(wt * 4) * 2, 3, 6); c.fillRect(x - 1, y - 22 - Math.sin(wt * 4) * 2, 3, 2);
      } });
    }
    for (const [i, p] of pz.portals.entries()) if (vis(p.tx, p.ty)) {
      const r = ORACLE_REALMS[i]!, open = realmUnlocked(i, d);
      draws.push({ y: p.ty * TS + 14, f: () => drawPortal(c, p.tx * TS + 8, p.ty * TS + 14, r.portal, open, wt, i) });
    }
    if (vis(pz.acts.tx, pz.acts.ty)) draws.push({ y: pz.acts.ty * TS + 14, f: () => drawActMap(c, pz.acts.tx * TS + 8, pz.acts.ty * TS + 14, wt) });
    if (vis(pz.rift.tx, pz.rift.ty)) { const open = hasManopla(g); draws.push({ y: pz.rift.ty * TS + 10, f: () => drawRift(c, pz.rift.tx * TS + 8, pz.rift.ty * TS + 12, open, wt) }); }
    return;
  }
  const pos = sagaPosOf(g); if (!pos) return;
  drawSagaScenery(g, c, draws, pos.realm, pos.ri, pos.zi, pos.zone, x0, y0, x1, y1, wt);
  for (const n of sideNpcsHere(g, pos)) if (vis(n.tx, n.ty)) {
    const x = n.tx * TS + 8, y = n.ty * TS + 14, pr = sideProgress(g, n.s);
    draws.push({ y, f: () => {
      drawChar(c, x, y, n.s.npc.pal, 0, Math.floor(wt * 1.5) % 2);
      const bob = Math.sin(wt * 4) * 2; c.fillStyle = pr.ready ? '#ffd040' : '#c0c0c0'; c.font = "8px 'Press Start 2P', monospace"; c.textAlign = 'center'; c.fillText(pr.ready ? '!' : '…', x, y - 26 + bob);
    } });
  }
  for (const n of townNpcsHere(g, pos)) if (vis(n.tx, n.ty)) {
    const x = n.tx * TS + 8, y = n.ty * TS + 14, key = n.k === 0 && !g.bossesDone.has(sagaBossId(pos.realm, pos.zi));
    draws.push({ y, f: () => {
      drawChar(c, x, y, n.n.pal, 0, Math.floor(wt * 1.5 + n.k) % 2);
      c.fillStyle = key ? '#ffd040' : '#d8e8ff'; c.font = "8px 'Press Start 2P', monospace"; c.textAlign = 'center'; c.fillText(key ? '!' : '…', x, y - 26 + Math.sin(wt * 4 + n.k) * 2);
    } });
  }
}
/** Escadas próprias da saga (em vez do altar dos templos). */
export function drawSagaStairs(g: Game, c: CanvasRenderingContext2D, wt: number): boolean {
  const pos = sagaPosOf(g); if (!pos) return false;
  const data = g.depth!.data;
  drawStairs(c, 'spiral', data.start.tx, data.start.ty, false, wt);
  drawStairs(c, 'spiral', data.stairs.tx, data.stairs.ty, true, wt, !g.bossesDone.has(sagaBossId(pos.realm, pos.zi)));
  return true;
}
export function sagaLights(g: Game, hole: (x: number, y: number, r: number, a?: number) => void) {
  if (!g.depth) { const pz = sagaPlaza(g.overworld); hole(pz.oracle.tx * TS + 8, pz.oracle.ty * TS, 50, 0.9); hole(pz.acts.tx * TS + 8, pz.acts.ty * TS, 44, 0.75); for (const p of pz.portals) hole(p.tx * TS + 8, p.ty * TS, 40, 0.8); return; }
  const pos = sagaPosOf(g); if (!pos) return;
  for (const n of sideNpcsHere(g, pos)) hole(n.tx * TS + 8, n.ty * TS + 6, 46, 0.9);
  for (const n of townNpcsHere(g, pos)) hole(n.tx * TS + 8, n.ty * TS + 6, 46, 0.9);
  sagaSceneLights(g, hole, pos.ri, pos.zi);
  const d = g.depth.data; hole(d.stairs.tx * TS + 8, d.stairs.ty * TS + 8, 50, 0.8);
}
export const sagaDarkness = (g: Game) => sagaPosOf(g)?.zone.light ?? null;
export const sagaZoneOf = (g: Game) => sagaPosOf(g)?.zone ?? null;
export const sagaModeTick = tickSagaMode;
export { sagaModeStatus };

/* ───────────── Painel ───────────── */
export function sagaSummary(g: Game) {
  const d = done(g);
  return SAGA_REALMS.map((r, ri) => ({
    realm: r, open: realmUnlocked(ri, d, (act) => actRealmUnlocked(act, g.questStatus), () => actRealmUnlocked(5, g.questStatus)), complete: realmDone(r, d),
    zones: r.zones.map((zn, i) => ({ zone: zn, done: d(sagaBossId(r, i)), open: zoneUnlocked(r, i, d), level: zoneLevel(r, i) })),
    sides: sidesOf(r.id).map((s) => ({ story: s, done: sideDone(s, has(g)), started: g.discoveries.has(sideKey(s, 0)), progress: sideProgress(g, s), zone: r.zones[s.steps[Math.min(sideStepOf(s, has(g)), s.steps.length - 1)]!.zone]!.name })),
  }));
}

/** Clima da zona da saga (tela cheia). */
export function sagaWeather(g: Game, c: CanvasRenderingContext2D) { const z = sagaPosOf(g)?.zone; if (z) drawSagaWeather(g, c, z); }
