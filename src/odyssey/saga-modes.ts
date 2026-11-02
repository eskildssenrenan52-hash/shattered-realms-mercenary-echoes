// Runtime dos modos especiais da Saga. O estado de combate é efêmero; a conclusão
// continua usando os mesmos IDs de chefe e descobertas que já vivem no save.
import type { Game } from './engine';
import type { DungeonFloor } from './dungeon';
import { bossHp } from './boss-tuning';
import { TS } from './world';
import { bossStats, sagaBossId, zoneLevel, type SagaRealm, type SagaZone } from './saga';

export interface SagaModeStatus {
  kind: 'survival' | 'timed';
  label: string;
  wave?: number;
  waves?: number;
  defeated?: number;
  goal?: number;
  remaining?: number;
}

interface ModeState {
  key: string;
  realm: SagaRealm;
  ri: number;
  zi: number;
  zone: SagaZone;
  data: DungeonFloor;
  wave: number;
  waves: number;
  defeated: number;
  goal: number;
  remaining: number;
}

const states = new WeakMap<Game, ModeState>();
const SURVIVAL_WAVES = 3;

function stateKey(r: SagaRealm, zi: number) { return `${r.id}:${zi}`; }
function active(g: Game) {
  const s = states.get(g);
  return s && g.depth?.temple?.id === `saga_${s.realm.id}_${s.zi}` ? s : null;
}

function waveRoom(s: ModeState) {
  return s.data.rooms.reduce((best, room) => room.w * room.h > best.w * best.h ? room : best, s.data.rooms[0]!);
}

function spawnWave(g: Game, s: ModeState) {
  const room = waveRoom(s);
  s.goal = 5 + s.wave * 3 + Math.floor(zoneLevel(s.realm, s.zi) / 8);
  s.defeated = 0;
  for (let i = 0; i < s.goal; i++) {
    const tx = room.x + 1 + ((i * 5 + s.wave * 3) % Math.max(1, room.w - 2));
    const ty = room.y + 1 + ((Math.floor(i / Math.max(1, room.w - 2)) * 3 + i) % Math.max(1, room.h - 2));
    const kind = s.zone.enemies[(i + s.wave) % s.zone.enemies.length]!;
    const enemy = g.makeEnemy(kind, tx * TS + 8, ty * TS + 8, zoneLevel(s.realm, s.zi) + s.wave + g.cycle * 20);
    if (i === s.goal - 1 && s.wave > 1) {
      enemy.elite = true;
      enemy.hp = enemy.maxhp = Math.round(enemy.maxhp * 2);
      enemy.atk = Math.round(enemy.atk * 1.2);
      enemy.xp = Math.round(enemy.xp * 2);
      enemy.gold *= 2;
    }
    g.enemies.push(enemy);
  }
  g.toast(`Onda ${s.wave}/${s.waves}: ${s.goal} inimigos avançam.`, s.zone.color);
  g.burst(g.p.x, g.p.y - 12, s.zone.color, 20, 70, 2, -25);
}

function spawnBoss(g: Game, s: ModeState) {
  const id = sagaBossId(s.realm, s.zi);
  if (g.bossesDone.has(id) || g.enemies.some((e) => e.boss?.def.id === id && e.alive)) return;
  const st = bossStats(s.realm, s.zi);
  const end = s.data.stairs;
  const def = {
    id,
    name: s.zone.boss.name,
    biome: s.zone.biome,
    tx: end.tx,
    ty: end.ty - 2,
    hp: st.hp,
    atk: st.atk,
    xp: st.xp,
    gold: st.gold,
    color: s.zone.boss.tint,
    minion: s.zone.enemies[0]!,
    reward: ['elixir', 'hi_potion', 'eco_shard'],
  };
  const boss = g.makeEnemy(s.zone.boss.kind, def.tx * TS + 8, def.ty * TS + 8, 1);
  boss.hp = boss.maxhp = bossHp(def.hp);
  boss.atk = def.atk;
  boss.def = 8 + Math.floor(st.level / 3);
  boss.xp = def.xp;
  boss.gold = def.gold;
  boss.speed = 32;
  boss.level = st.level;
  boss.boss = { def, active: false, phase: 1, patT: 2, attackIndex: 0, charge: 0, cvx: 0, cvy: 0 };
  g.enemies.push(boss);
  g.toast(`⚔ ${s.zone.boss.name} entra após as ondas.`, '#ff9080');
}

export function startSagaMode(g: Game, r: SagaRealm, ri: number, zi: number, zone: SagaZone, data: DungeonFloor) {
  states.delete(g);
  if (zone.mode !== 'survival' && zone.mode !== 'timed') return;
  const state: ModeState = {
    key: stateKey(r, zi), realm: r, ri, zi, zone, data,
    wave: 1, waves: SURVIVAL_WAVES, defeated: 0, goal: 0,
    remaining: Math.max(42, 94 - zi * 8 - Math.floor(r.level / 4)),
  };
  states.set(g, state);
  if (zone.mode === 'survival') {
    // O gerador entrega spawns comuns; para uma arena, começamos com ondas claras.
    g.enemies = g.enemies.filter((e) => !!e.boss);
    spawnWave(g, state);
  } else {
    g.toast(`Corrida contra o tempo: alcance e vença o desafio em ${Math.ceil(state.remaining)} s.`, '#ffe080');
  }
}

export function sagaModeOnKill(g: Game) {
  const s = active(g);
  if (!s || s.zone.mode !== 'survival') return;
  // Inimigos de onda não podem reaparecer quando o jogador se afasta da arena.
  for (const enemy of g.enemies) if (!enemy.alive && !enemy.boss) enemy.respawn = -1;
  s.defeated++;
  if (s.defeated < s.goal) return;
  if (s.wave < s.waves) {
    s.wave++;
    spawnWave(g, s);
    return;
  }
  spawnBoss(g, s);
}

export function sagaModeTick(g: Game, dt: number) {
  const s = active(g);
  if (!s || s.zone.mode !== 'timed') return;
  s.remaining = Math.max(0, s.remaining - dt);
  if (s.remaining > 0 || g.bossesDone.has(sagaBossId(s.realm, s.zi))) return;
  s.remaining = Math.max(42, 94 - s.zi * 8 - Math.floor(s.realm.level / 4));
  g.p.x = s.data.start.tx * TS + 8;
  g.p.y = (s.data.start.ty + 1) * TS + 8;
  g.p.hp = Math.max(1, Math.ceil(g.maxHp() * 0.6));
  g.enemies = g.enemies.filter((e) => !!e.boss);
  for (const enemy of g.enemies) if (enemy.boss) {
    enemy.alive = true;
    enemy.respawn = 0;
    enemy.hp = enemy.maxhp;
    enemy.x = enemy.hx;
    enemy.y = enemy.hy;
    enemy.boss.active = false;
    enemy.boss.phase = 1;
    enemy.boss.patT = 2;
    enemy.boss.attackIndex = 0;
    enemy.boss.charge = 0;
    enemy.boss.cvx = 0;
    enemy.boss.cvy = 0;
  }
  g.activeBoss = null;
  g.audio.boss = false;
  g.toast('O tempo se desfez. Você volta ao início da travessia.', '#ff8080');
  g.burst(g.p.x, g.p.y - 12, '#ff9080', 28, 80, 2, -30);
}

export function sagaModeStatus(g: Game): SagaModeStatus | null {
  const s = active(g);
  if (!s) return null;
  if (s.zone.mode === 'survival') return {
    kind: 'survival', label: 'Provação de Ondas', wave: s.wave, waves: s.waves,
    defeated: Math.min(s.defeated, s.goal), goal: s.goal,
  };
  return { kind: 'timed', label: 'Travessia Contra o Tempo', remaining: s.remaining };
}
