import type { Game } from "./engine";
import { ITEMS } from "./data";
import { carveEntrances } from "./depthplay";
import {
  FARLANDS_PORTALS,
  FARLANDS_SITES,
  farlandsInteractionId,
  generateFarlandsWorld,
  resolveFarlandsSites,
  type ResolvedFarlandsSite,
} from "./farlands";
import { BIOME_LIST, H, TS, T, W, type World } from "./world";
import { carveBiomeMineEntrances } from "./biome-mine-sites";

/** Portal físico perto da saída sul de Potos; coordenadas antigas não são movidas. */
export const MAIN_FARLANDS_GATE = { x: 127, y: 139 } as const;
const resolvedByWorld = new WeakMap<World, ResolvedFarlandsSite[]>();

function carveGate(world: World, x: number, y: number) {
  for (let ty = y - 2; ty <= y + 3; ty++) for (let tx = x - 2; tx <= x + 2; tx++) {
    if (tx <= 1 || ty <= 1 || tx >= W - 1 || ty >= H - 1) continue;
    world.tiles[ty * W + tx] = T.PATH;
  }
  for (let dy = -2; dy <= 0; dy++) for (const dx of [-2, 2]) world.tiles[(y + dy) * W + x + dx] = T.PILLAR;
  world.tiles[(y - 1) * W + x] = T.CRYSTAL;
}

export function carveMainFarlandsGate(world: World) {
  carveGate(world, MAIN_FARLANDS_GATE.x, MAIN_FARLANDS_GATE.y);
}

export function ensureFarlandsWorld(g: Game): World {
  if (!g.farlandsWorld) {
    const world = generateFarlandsWorld();
    carveEntrances(world);
    carveBiomeMineEntrances(world);
    for (const portal of FARLANDS_PORTALS) carveGate(world, portal.x, portal.y);
    g.farlandsWorld = world;
    resolvedByWorld.set(world, resolveFarlandsSites(world));
  }
  return g.farlandsWorld;
}

export function farlandsSites(world: World): readonly ResolvedFarlandsSite[] {
  let sites = resolvedByWorld.get(world);
  if (!sites) { sites = resolveFarlandsSites(world); resolvedByWorld.set(world, sites); }
  return sites;
}

function near(g: Game, x: number, y: number, radius = 30) {
  return Math.hypot(g.p.x - x * TS - 8, g.p.y - y * TS - 8) < radius;
}

function enterFarlands(g: Game) {
  if (g.depth || g.interior || g.sea || g.island) { g.toast("Volte à superfície antes de cruzar o portal.", "#ffd080"); return; }
  const world = ensureFarlandsWorld(g);
  g.farlandsReturnPos = { x: g.p.x, y: g.p.y + 18 };
  g.surfaceEnemies = g.enemies;
  g.enemies = [];
  g.farlandsActive = true;
  g.world = world;
  const gate = FARLANDS_PORTALS[0];
  g.p.x = gate.x * TS + 8; g.p.y = (gate.y + 2) * TS + 8;
  g.p.vx = g.p.vy = 0; g.clearTransition();
  const tileX = Math.floor(g.p.x / TS), tileY = Math.floor(g.p.y / TS);
  g.biome = BIOME_LIST[world.biomes[tileY * W + tileX] ?? 0] ?? "plains";
  g.audio.biome = g.biome;
  g.discoveries.add("farlands:accessed");
  g.buildMinimap(); g.spawnEnemies(); g.onWorldChanged?.();
  g.biomeBanner = { name: "Terras Distantes · novo continente", t: 6 };
  g.toast("Um segundo continente se estende além do portal. 24 lugares aguardam exploração.", "#b7edff");
  g.save();
}

function leaveFarlands(g: Game) {
  if (!g.farlandsActive) return;
  g.farlandsActive = false;
  g.world = g.overworld;
  g.enemies = g.surfaceEnemies; g.surfaceEnemies = [];
  g.retireDefeatedBosses();
  g.p.x = g.farlandsReturnPos.x; g.p.y = g.farlandsReturnPos.y;
  g.p.vx = g.p.vy = 0; g.clearTransition();
  const tx = Math.max(0, Math.min(W - 1, Math.floor(g.p.x / TS)));
  const ty = Math.max(0, Math.min(H - 1, Math.floor(g.p.y / TS)));
  g.biome = BIOME_LIST[g.overworld.biomes[ty * W + tx] ?? 0] ?? "plains";
  g.audio.biome = g.biome;
  g.buildMinimap(); g.onWorldChanged?.();
  g.biomeBanner = { name: "Vila de Potos · de volta ao lar", t: 4 };
  g.toast("O portal o devolveu à margem de Potos.", "#b7edff");
  g.save();
}

/** Ação física para abrir o continente, retornar e registrar seus marcos. */
export function farlandsAction(g: Game, run: boolean): string {
  if (g.depth || g.sea || g.island || g.interior) return "";
  if (!g.farlandsActive && near(g, MAIN_FARLANDS_GATE.x, MAIN_FARLANDS_GATE.y, 34)) {
    if (run) enterFarlands(g);
    return "E · Cruzar para as Terras Distantes";
  }
  if (g.farlandsActive) {
    for (const portal of FARLANDS_PORTALS) if (near(g, portal.x, portal.y, 34)) {
      if (run) leaveFarlands(g);
      return "E · Retornar a Potos";
    }
    const site = farlandsSites(g.world).find((candidate) => near(g, candidate.x, candidate.y, 28));
    if (site) {
      const id = farlandsInteractionId(site.id), found = g.discoveries.has(id);
      if (run && !found) {
        g.discoveries.add(id);
        g.p.gold += 120 + site.target.x % 90;
        g.gainXp(160 + site.target.y % 180);
        const item = ITEMS[site.reward];
        if (!g.addItem(site.reward)) g.p.gold += item?.price ?? 1;
        g.toast(`${site.name}: +ouro · XP · ${item?.name ?? site.reward}`, item?.color ?? "#bfefff");
        g.audio.sfx("pickup"); g.save();
      }
      return found ? `E · ${site.name} · já registrado` : `E · Explorar ${site.name}`;
    }
  }
  return "";
}

function drawGate(c: CanvasRenderingContext2D, tx: number, ty: number, label: string, wt: number, active: boolean) {
  const x = tx * TS, y = ty * TS, pulse = 0.5 + Math.sin(wt * 2.4) * 0.18;
  c.save(); c.globalCompositeOperation = "lighter";
  c.globalAlpha = 0.24 + pulse * 0.2; c.fillStyle = active ? "#80e8ff" : "#d0a0ff";
  c.beginPath(); c.ellipse(x + 8, y + 4, 16 + pulse * 4, 7 + pulse * 2, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  c.save(); c.strokeStyle = active ? "#a0f0ff" : "#c78bff"; c.lineWidth = 2; c.globalAlpha = 0.72 + pulse * 0.25;
  c.beginPath(); c.moveTo(x + 2, y + 12); c.lineTo(x + 2, y - 12); c.quadraticCurveTo(x + 8, y - 21, x + 14, y - 12); c.lineTo(x + 14, y + 12); c.stroke();
  c.fillStyle = "#e8faff"; c.fillRect(x + 7, y - 4, 2, 6);
  c.restore();
  if (label) { c.save(); c.font = "6px monospace"; c.textAlign = "center"; c.fillStyle = "#fff1c0"; c.shadowColor = "#13243d"; c.shadowBlur = 3; c.fillText(label, x + 8, y - 24); c.restore(); }
}

function drawSite(c: CanvasRenderingContext2D, site: ResolvedFarlandsSite, wt: number, visited: boolean) {
  const x = site.x * TS, y = site.y * TS, pulse = 0.58 + Math.sin(wt * 2.5 + site.target.x) * 0.18;
  const hues: Record<ResolvedFarlandsSite["kind"], string> = { shrine: "#c4a0ff", ruin: "#f0c878", grove: "#80e8a0", cavern: "#86c8ff", harbor: "#72e8ef", spring: "#b0f0df" };
  const col = hues[site.kind];
  c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = visited ? 0.18 : pulse * 0.38; c.fillStyle = col;
  c.beginPath(); c.ellipse(x + 8, y + 10, 12 + pulse * 3, 5 + pulse, 0, 0, Math.PI * 2); c.fill(); c.restore();
  c.save(); c.fillStyle = visited ? "#68636d" : col;
  if (site.kind === "grove") { c.fillRect(x + 3, y + 5, 10, 7); c.fillRect(x + 6, y + 1, 4, 10); }
  else if (site.kind === "harbor") { c.fillRect(x + 1, y + 10, 14, 3); c.fillRect(x + 4, y + 5, 2, 7); c.fillRect(x + 10, y + 5, 2, 7); }
  else if (site.kind === "spring") { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.ellipse(x + 8, y + 10, 7, 4, 0, 0, Math.PI * 2); c.stroke(); c.fillRect(x + 7, y + 3, 2, 3); }
  else { c.fillRect(x + 2, y + 4, 12, 9); c.fillRect(x + 4, y + 1, 8, 3); c.fillStyle = "#1b2133"; c.fillRect(x + 6, y + 7, 4, 6); }
  c.fillStyle = visited ? "#b8b0a0" : "#fff1a0"; c.fillRect(x + 7, y + 2, 2, 2); c.restore();
}

/** Insere marcadores por camada no mesmo pipeline de profundidade dos prédios. */
export function drawFarlands(g: Game, c: CanvasRenderingContext2D, draws: { y: number; f: () => void }[], x0: number, y0: number, x1: number, y1: number, wt: number) {
  if (g.depth || g.sea || g.island || g.interior) return;
  if (!g.farlandsActive) {
    const p = MAIN_FARLANDS_GATE;
    if (p.x >= x0 - 4 && p.x <= x1 + 4 && p.y >= y0 - 4 && p.y <= y1 + 4) draws.push({ y: (p.y + 1) * TS, f: () => drawGate(c, p.x, p.y, "TERRAS DISTANTES", wt, false) });
    return;
  }
  for (const portal of FARLANDS_PORTALS) if (portal.x >= x0 - 4 && portal.x <= x1 + 4 && portal.y >= y0 - 4 && portal.y <= y1 + 4)
    draws.push({ y: (portal.y + 1) * TS, f: () => drawGate(c, portal.x, portal.y, "RETORNO A POTOS", wt, true) });
  for (const site of farlandsSites(g.world)) if (site.x >= x0 - 4 && site.x <= x1 + 4 && site.y >= y0 - 4 && site.y <= y1 + 4) {
    const visited = g.discoveries.has(farlandsInteractionId(site.id));
    draws.push({ y: (site.y + 1) * TS, f: () => drawSite(c, site, wt, visited) });
  }
}
