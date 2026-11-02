// Liga a Defesa de Aurélia ao motor: portal em Potos, ondas, marcha dos inimigos, HUD e recompensas.
import type { Game, Enemy } from './engine';
import { ENEMIES, ITEMS } from './data';
import { TS } from './world';
import { bossHp } from './boss-tuning';
import { enterDepthState, leaveDepth } from './depthplay';
import type { Temple } from './depths';
import {
  GATE, HEART, LANES, PLAYER_START, RIFTS, SIEGE_CITY_MAX, SIEGE_INTERMISSION, SIEGE_PORTAL, SX, SY, SW, SH, CITY_WALL_Y,
  breachDamage, isBossWave, siegeWave, siegeWorld, waveGold, type SiegeSpawn,
} from './siege';
import type { DungeonFloor } from './dungeon';
import { T } from './world';

interface Marcher { lane: number; wp: number; stuck: number; lx: number; ly: number; boss: boolean; elite: boolean }
export interface SiegeRun {
  wave: number; city: number; phase: 'rest' | 'wave' | 'lost'; timer: number;
  queue: (SiegeSpawn & { boss?: boolean })[]; clock: number; marchers: Map<number, Marcher>;
  kills: number; goldEarned: number; flash: number; warn: number;
}

const BEST_KEY = 'siegebest:';
export function siegeBest(g: Game) { for (const k of g.discoveries) if (k.startsWith(BEST_KEY)) return Number(k.slice(BEST_KEY.length)) || 0; return 0; }
function recordBest(g: Game, n: number) { if (n <= siegeBest(g)) return; for (const k of [...g.discoveries]) if (k.startsWith(BEST_KEY)) g.discoveries.delete(k); g.discoveries.add(BEST_KEY + n); }

const px = (tx: number) => (tx + SX) * TS + 8, py = (ty: number) => (ty + SY) * TS + 8;
const SIEGE_TEMPLE: Temple = { id: 'siege_aurelia', biome: 'plains', name: 'Cidade de Aurélia', family: 'forest', hue: 40, stair: 'marble', tx: 0, ty: 0, level: 1, lore: 'Uma cidade além do portal, cercada por rifts.' };

function floorData(): DungeonFloor {
  return {
    floor: 1, theme: { name: 'Campos de Aurélia', floor: T.GRASS, wall: T.TREE, deco: T.ROCK, biome: 'plains', enemies: [], color: '#ffd060', lore: '' },
    world: siegeWorld(), w: SW, h: SH, ox: SX, oy: SY, rooms: [],
    start: { tx: PLAYER_START.tx + SX, ty: PLAYER_START.ty + SY - 1 }, stairs: { tx: GATE.tx + SX, ty: GATE.ty + SY },
    spawns: [], chests: [], boss: null, torches: [],
  };
}

export function enterSiege(g: Game) {
  g.dialog = null;
  enterDepthState(g, { kind: 'temple', profile: 'siege', floor: 1, temple: SIEGE_TEMPLE, data: floorData(), stair: 'marble' }, 1);
  g.siege = { wave: 0, city: SIEGE_CITY_MAX, phase: 'rest', timer: SIEGE_INTERMISSION, queue: [], clock: 0, marchers: new Map(), kills: 0, goldEarned: 0, flash: 0, warn: 0 };
  g.p.hp = g.maxHp(); g.p.mp = g.maxMp();
  g.biomeBanner = { name: 'Defesa de Aurélia', t: 4 };
  g.toast('Inimigos virão dos rifts ao sul. Não deixe que cheguem ao portão da cidade!', '#ffd060');
  g.toast(`A cada ${10} ondas surge um chefão. Recorde: onda ${siegeBest(g)}.`, '#bfefff');
  g.audio.sfx('level');
}

/** Chamado por leaveDepth antes de voltar à superfície. */
export function onSiegeLeave(g: Game) {
  const s = g.siege; if (!s) return;
  const cleared = s.phase === 'wave' || s.phase === 'lost' ? s.wave - 1 : s.wave;
  recordBest(g, Math.max(0, cleared));
  g.toast(`Defesa encerrada · ${Math.max(0, cleared)} ondas vencidas · ${s.kills} abates · +${s.goldEarned} ouro`, '#ffd060');
  g.siege = null;
}

function startWave(g: Game, s: SiegeRun) {
  s.wave++; s.phase = 'wave'; s.clock = 0; s.marchers.clear();
  const w = siegeWave(s.wave, g.p.level);
  s.queue = w.spawns.map((x) => ({ ...x }));
  if (w.boss) {
    s.queue.push({ kind: w.boss.kind, lane: w.boss.lane, level: w.spawns[0]?.level ?? 1, elite: false, delay: 3, boss: true });
    g.toast(`⚠ Onda ${s.wave}: ${w.boss.name} marcha contra a cidade!`, '#ff6060'); g.audio.sfx('boss'); g.shake = 6;
  } else g.toast(`Onda ${s.wave} · ${w.spawns.length} inimigos`, '#ffd060');
  s.queue.sort((a, b) => a.delay - b.delay);
}

function spawn(g: Game, s: SiegeRun, sp: SiegeRun['queue'][number]) {
  const [rx, ry] = RIFTS[sp.lane]!, x = px(rx) + (Math.random() - 0.5) * 10, y = py(ry);
  let e: Enemy;
  if (sp.boss) {
    const b = siegeWave(s.wave, g.p.level).boss!;
    e = g.makeEnemy(b.kind, x, y, 1);
    e.hp = e.maxhp = bossHp(b.hp); e.atk = b.atk; e.def = 3 + Math.floor(s.wave / 4); e.xp = b.xp; e.gold = b.gold; e.speed = 30; e.level = sp.level + 4;
    e.boss = { def: b, active: false, phase: 1, patT: 2, attackIndex: 0, charge: 0, cvx: 0, cvy: 0 };
  } else {
    e = g.makeEnemy(sp.kind, x, y, sp.level);
    if (sp.elite) { e.elite = true; e.hp = e.maxhp = Math.round(e.maxhp * 2.2); e.atk = Math.round(e.atk * 1.35); e.xp = Math.round(e.xp * 2.5); e.gold *= 2; }
  }
  e.respawn = -1;
  g.enemies.push(e);
  s.marchers.set(e.id, { lane: sp.lane, wp: 1, stuck: 0, lx: e.x, ly: e.y, boss: !!sp.boss, elite: sp.elite });
  g.burst(x, y - 6, sp.boss ? '#ff5040' : '#b070ff', sp.boss ? 30 : 8, 60);
}

export function siegeTick(g: Game, dt: number) {
  const s = g.siege; if (!s) return;
  s.flash = Math.max(0, s.flash - dt); s.warn = Math.max(0, s.warn - dt);
  if (s.phase === 'lost') { s.timer -= dt; if (s.timer <= 0) leaveDepth(g); return; }
  if (s.phase === 'rest') {
    s.timer -= dt;
    if (s.timer <= 0) startWave(g, s);
    return;
  }
  s.clock += dt;
  while (s.queue.length && s.queue[0]!.delay <= s.clock) spawn(g, s, s.queue.shift()!);
  for (const [id] of s.marchers) { const e = g.enemies.find((x) => x.id === id); if (!e || !e.alive) s.marchers.delete(id); }
  if (!s.queue.length && !s.marchers.size) {
    const gold = waveGold(s.wave); g.p.gold += gold; s.goldEarned += gold;
    g.toast(`Onda ${s.wave} vencida! +${gold} ouro`, '#a0ffa0');
    if (s.wave % 5 === 0 && g.addItem('hi_potion')) g.toast(`Recebeu: ${ITEMS['hi_potion'].name}`);
    recordBest(g, s.wave);
    g.enemies = g.enemies.filter((e) => e.alive);
    s.phase = 'rest'; s.timer = SIEGE_INTERMISSION;
    if (isBossWave(s.wave + 1)) g.toast('A próxima onda traz um chefão. Prepare-se!', '#ff9060');
    g.save();
  }
}

/**
 * Movimento de marcha: inimigos seguem a rota até o portão, mas ainda reagem ao herói
 * quando ele chega perto (o combate continua o mesmo). Retorna true quando já moveu o inimigo.
 */
export function siegeMarch(g: Game, e: Enemy, dt: number, d: number): boolean {
  const s = g.siege; if (!s) return false;
  const m = s.marchers.get(e.id); if (!m) return false;
  if (e.boss?.active) { e.hx = e.x; e.hy = e.y; return false; }
  const def = ENEMIES[e.kind];
  const aggro = e.boss ? 110 : def.ranged ? 115 : 95;
  if (d < aggro && g.p.dead <= 0) { e.hx = e.x; e.hy = e.y; return false; }
  const lane = LANES[m.lane]!;
  // Se foi empurrado para longe, retoma o ponto da rota mais adiante que estiver mais perto.
  while (m.wp < lane.length - 1) {
    const a = lane[m.wp]!, b = lane[m.wp + 1]!;
    if (Math.hypot(px(b[0]) - e.x, py(b[1]) - e.y) < Math.hypot(px(a[0]) - e.x, py(a[1]) - e.y)) m.wp++; else break;
  }
  const [wx, wy] = lane[m.wp]!, tx = px(wx), ty = py(wy), dx = tx - e.x, dy = ty - e.y, dist = Math.hypot(dx, dy);
  if (dist < 7) {
    if (m.wp >= lane.length - 1) { breach(g, s, e, m); return true; }
    m.wp++; return true;
  }
  const spd = (e.boss ? e.speed : def.speed) * (e.slow > 0 ? 0.4 : 1) * 0.6;
  g.moveBody(e, (dx / dist) * spd * dt, (dy / dist) * spd * dt);
  if (Math.abs(dx) > Math.abs(dy)) e.dir = dx < 0 ? 1 : 2;
  e.hx = e.x; e.hy = e.y;
  // Anti-trava: se não avança, desliza direto para o ponto da rota.
  if (Math.hypot(e.x - m.lx, e.y - m.ly) < 0.5) { m.stuck += dt; if (m.stuck > 1.5) { e.x += (dx / dist) * 6; e.y += (dy / dist) * 6; m.stuck = 0; } } else m.stuck = 0;
  m.lx = e.x; m.ly = e.y;
  return true;
}

function breach(g: Game, s: SiegeRun, e: Enemy, m: Marcher) {
  e.alive = false; e.respawn = -1; s.marchers.delete(e.id);
  if (e.boss) { g.activeBoss = null; g.audio.boss = false; for (const x of g.enemies) if (x.summoned) x.alive = false; }
  const dmg = breachDamage(m.elite, m.boss);
  s.city = Math.max(0, s.city - dmg); s.flash = 0.6; g.shake = Math.max(g.shake, m.boss ? 10 : 4);
  g.burst(e.x, e.y - 8, '#ff4040', 18, 90); g.audio.sfx('hurt');
  g.toast(m.boss ? `${e.boss?.def.name ?? 'O chefão'} invadiu a cidade! −${dmg}` : `Um inimigo passou pelo portão! Cidade −${dmg}`, '#ff7070');
  if (s.city <= 0) {
    s.phase = 'lost'; s.timer = 3.5; s.queue = [];
    for (const x of g.enemies) x.alive = false;
    g.toast(`Aurélia caiu na onda ${s.wave}…`, '#ff5050'); g.audio.sfx('die');
  }
}

/** Abates contam no placar da defesa. */
export function siegeOnKill(g: Game, e: Enemy) { const s = g.siege; if (s && s.marchers.has(e.id)) { s.kills++; s.marchers.delete(e.id); } }

const near = (g: Game, tx: number, ty: number, r: number) => Math.hypot(g.p.x - tx * TS - 8, g.p.y - ty * TS - 8) < r;

export function siegeSurfaceAction(g: Game, run: boolean): string {
  if (!near(g, SIEGE_PORTAL.tx, SIEGE_PORTAL.ty, 30)) return '';
  if (run) {
    const best = siegeBest(g);
    g.dialog = {
      npc: { id: 'siege_herald', name: 'Arauto de Aurélia', title: 'Voz do Portal', tx: SIEGE_PORTAL.tx, ty: SIEGE_PORTAL.ty, pal: { skin: '#e8c8a0', hair: '#f0d070', body: '#2a4a8a', legs: '#1a2a4a', accent: '#ffd060' }, lines: [] },
      text: `Do outro lado deste portal, a cidade de Aurélia está cercada por rifts. Mate os invasores antes que cheguem ao portão. A cada 10 ondas, um chefão. Seu recorde: onda ${best}.`,
      choices: [{ label: 'Atravessar o portal', act: () => enterSiege(g) }, { label: 'Agora não', act: () => { g.dialog = null; } }],
    };
    g.audio.sfx('ui');
  }
  return 'E · Portal de Aurélia · Defesa da Cidade';
}

export function siegeDepthAction(g: Game, run: boolean): string {
  const s = g.siege; if (!s) return '';
  if (!near(g, HEART.tx + SX, HEART.ty + SY, 30)) return '';
  if (run) {
    const choices = [] as { label: string; act: () => void }[];
    if (s.phase === 'rest') choices.push({ label: `Chamar a onda ${s.wave + 1} agora`, act: () => { g.dialog = null; s.timer = 0; } });
    choices.push({ label: 'Abandonar a defesa', act: () => { g.dialog = null; leaveDepth(g); } });
    choices.push({ label: 'Continuar lutando', act: () => { g.dialog = null; } });
    g.dialog = { npc: { id: 'siege_heart', name: 'Coração de Aurélia', title: `Vida ${s.city}/${SIEGE_CITY_MAX}`, tx: HEART.tx, ty: HEART.ty, pal: { skin: '#ffe0a0', hair: '#ffd060', body: '#ffb030', legs: '#a07020', accent: '#fff0b0' }, lines: [] }, text: `Onda ${s.wave} · ${s.kills} abates. O cristal pulsa enquanto a cidade resistir.`, choices };
    g.audio.sfx('ui');
  }
  return 'E · Coração de Aurélia';
}

// ---------- desenho ----------
export function drawSiegePortal(c: CanvasRenderingContext2D, wt: number) {
  const x = SIEGE_PORTAL.tx * TS + 8, y = (SIEGE_PORTAL.ty + 1) * TS;
  c.save();
  // Plataforma de pedra.
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(x, y - 1, 30, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8a8478'; c.beginPath(); c.ellipse(x, y - 3, 27, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#b0a898'; c.beginPath(); c.ellipse(x, y - 4, 23, 4.5, 0, 0, Math.PI * 2); c.fill();
  // Energia do portal.
  const cy = y - 26;
  const grd = c.createRadialGradient(x, cy, 2, x, cy, 20);
  grd.addColorStop(0, 'rgba(255,250,220,0.95)'); grd.addColorStop(0.4, 'rgba(255,190,70,0.8)'); grd.addColorStop(1, 'rgba(120,60,200,0.15)');
  c.fillStyle = grd; c.beginPath(); c.ellipse(x, cy, 13, 19, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(255,230,150,0.8)'; c.lineWidth = 1;
  for (let i = 0; i < 3; i++) { const a = wt * (1.6 + i * 0.7) + i * 2; c.beginPath(); c.ellipse(x, cy, 10 - i * 3, 16 - i * 4, 0, a, a + 3.6); c.stroke(); }
  // Arco de pedra com runas.
  c.lineWidth = 5; c.strokeStyle = '#5a5248'; c.beginPath(); c.ellipse(x, cy, 16, 22, 0, Math.PI * 0.92, Math.PI * 2.08); c.stroke();
  c.lineWidth = 3; c.strokeStyle = '#9a9080'; c.beginPath(); c.ellipse(x, cy, 16, 22, 0, Math.PI * 0.92, Math.PI * 2.08); c.stroke();
  for (let i = 0; i < 7; i++) { const a = Math.PI * (1 + i / 6), rx = x + Math.cos(a) * 16, ry = cy + Math.sin(a) * 22, on = (Math.floor(wt * 3) + i) % 7 < 3; c.fillStyle = on ? '#ffe070' : '#c09040'; c.fillRect(Math.round(rx) - 1, Math.round(ry) - 1, 2, 2); }
  // Pilares e estandartes dourados.
  for (const sx of [-19, 15]) { c.fillStyle = '#6a6256'; c.fillRect(x + sx, y - 30, 4, 27); c.fillStyle = '#a49a88'; c.fillRect(x + sx, y - 30, 2, 27); c.fillStyle = '#d0b060'; c.fillRect(x + sx - 1, y - 33, 6, 3); }
  for (const sx of [-24, 21]) { const wave = Math.sin(wt * 3 + sx) * 1.5; c.fillStyle = '#2a4a8a'; c.fillRect(x + sx, y - 28, 3, 12); c.fillStyle = '#ffd060'; c.fillRect(x + sx + wave * 0.3, y - 17, 3, 2); }
  // Faíscas subindo.
  for (let i = 0; i < 6; i++) { const t = (wt * 0.7 + i / 6) % 1, sx2 = x + Math.sin(i * 2.3 + wt) * 9; c.globalAlpha = 1 - t; c.fillStyle = i % 2 ? '#ffe9a0' : '#c9a0ff'; c.fillRect(Math.round(sx2), Math.round(cy + 14 - t * 40), 1, 1); }
  c.restore();
}

export function drawSiegeWorld(g: Game, c: CanvasRenderingContext2D, wt: number) {
  const s = g.siege; if (!s) return;
  // Rifts.
  for (const [i, [rx, ry]] of RIFTS.entries()) {
    const x = px(rx), y = py(ry), active = s.phase === 'wave' && s.queue.some((q) => q.lane === i);
    c.save(); c.globalAlpha = active ? 0.95 : 0.55;
    const r = 11 + Math.sin(wt * 4 + i) * 1.5;
    const gr = c.createRadialGradient(x, y, 1, x, y, r);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, '#c060ff'); gr.addColorStop(1, 'rgba(60,0,90,0)');
    c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#e0a0ff'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, r * 0.7, r * 0.4, 0, wt * 3, wt * 3 + 4); c.stroke();
    c.restore();
  }
  // Coração da cidade: cor muda com a vida.
  const hx = px(HEART.tx), hy = py(HEART.ty), ratio = s.city / SIEGE_CITY_MAX;
  const col = ratio > 0.6 ? '#ffd060' : ratio > 0.3 ? '#ff9040' : '#ff4040';
  c.save();
  c.fillStyle = '#5a5248'; c.fillRect(hx - 7, hy + 2, 14, 6);
  const bob = Math.sin(wt * 2) * 2;
  c.fillStyle = col; c.beginPath(); c.moveTo(hx, hy - 18 + bob); c.lineTo(hx + 6, hy - 6 + bob); c.lineTo(hx, hy + 2 + bob); c.lineTo(hx - 6, hy - 6 + bob); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(hx - 2, hy - 12 + bob, 2, 6);
  if (s.flash > 0) { c.globalAlpha = s.flash; c.fillStyle = '#ff2020'; c.beginPath(); c.arc(hx, hy - 8, 16, 0, Math.PI * 2); c.fill(); }
  c.restore();
  // Tochas do portão e linha de defesa.
  const gx = px(GATE.tx), gy = py(CITY_WALL_Y);
  for (const ox of [-28, 28]) { c.fillStyle = '#4a3a2a'; c.fillRect(gx + ox - 1, gy - 10, 2, 10); c.fillStyle = Math.sin(wt * 12 + ox) > 0 ? '#ffb040' : '#ffe080'; c.fillRect(gx + ox - 2, gy - 14, 4, 4); }
  c.fillStyle = `rgba(255,80,60,${0.25 + Math.sin(wt * 5) * 0.1})`; c.fillRect(gx - 24, gy + 10, 48, 2);
}

export function drawSiegeHud(g: Game, c: CanvasRenderingContext2D) {
  const s = g.siege; if (!s) return;
  const W = g.viewWidth, alive = s.marchers.size + s.queue.length;
  c.save(); c.font = "8px 'Press Start 2P', monospace"; c.textAlign = 'center';
  const line1 = `ONDA ${s.wave}${isBossWave(s.wave) && s.phase === 'wave' ? ' · CHEFÃO' : ''}`;
  const line2 = s.phase === 'rest' ? `Próxima onda em ${Math.ceil(s.timer)}s${isBossWave(s.wave + 1) ? ' · CHEFÃO!' : ''}` : s.phase === 'lost' ? 'A cidade caiu' : `Inimigos: ${alive}`;
  const bw = 150, x0 = W / 2 - bw / 2, y0 = 22;
  c.fillStyle = 'rgba(14,20,34,0.82)'; c.fillRect(x0, y0, bw, 34); c.strokeStyle = '#d0b060'; c.strokeRect(x0 + 0.5, y0 + 0.5, bw - 1, 33);
  c.fillStyle = '#ffd060'; c.fillText(line1, W / 2, y0 + 11);
  // Barra de vida da cidade.
  const ratio = s.city / SIEGE_CITY_MAX;
  c.fillStyle = '#301010'; c.fillRect(x0 + 8, y0 + 15, bw - 16, 6);
  c.fillStyle = s.flash > 0 ? '#ffffff' : ratio > 0.6 ? '#60d060' : ratio > 0.3 ? '#f0b040' : '#f04040'; c.fillRect(x0 + 8, y0 + 15, Math.round((bw - 16) * ratio), 6);
  c.font = "6px 'Press Start 2P', monospace"; c.fillStyle = '#f1e5c7'; c.fillText(line2, W / 2, y0 + 30);
  // Radar das rotas: mostra o quão perto cada inimigo está do portão.
  const rh = 90, rw = 26, rx = W - rw - 6, ry = 64;
  c.fillStyle = 'rgba(14,20,34,0.7)'; c.fillRect(rx, ry, rw, rh); c.strokeStyle = '#d0b06088'; c.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
  c.fillStyle = '#ff6040'; c.fillRect(rx + 2, ry + 2, rw - 4, 2);
  const top = py(CITY_WALL_Y), bottom = py(SH - 3), left = px(1), right = px(SW - 2);
  for (const [id, m] of s.marchers) {
    const e = g.enemies.find((x) => x.id === id); if (!e || !e.alive) continue;
    const fx = rx + 3 + ((e.x - left) / (right - left)) * (rw - 6), fy = ry + 4 + ((e.y - top) / (bottom - top)) * (rh - 8);
    c.fillStyle = m.boss ? '#ffd040' : m.elite ? '#ff9040' : '#ff4040'; const sz = m.boss ? 4 : 2; c.fillRect(Math.round(fx - sz / 2), Math.round(Math.max(ry + 3, Math.min(ry + rh - 4, fy)) - sz / 2), sz, sz);
  }
  const pfx = rx + 3 + ((g.p.x - left) / (right - left)) * (rw - 6), pfy = ry + 4 + ((g.p.y - top) / (bottom - top)) * (rh - 8);
  c.fillStyle = '#80e0ff'; c.fillRect(Math.round(pfx) - 1, Math.round(Math.max(ry + 3, Math.min(ry + rh - 4, pfy))) - 1, 3, 3);
  c.restore();
}
