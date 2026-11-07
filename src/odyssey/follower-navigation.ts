import type { Game } from "./engine";
import { H, TS, W, bodyBlockedAt, findClearBodyPosition } from "./world";

type Point = { x: number; y: number };
type Body = Point;
interface Navigator {
  goal: number;
  path: Point[];
  index: number;
  retryIn: number;
}

const navigators = new WeakMap<Game, Map<string, Navigator>>();
const MAX_VISITED = 6000;
const PATH_MARGIN = 12;

function navigator(g: Game, id: string): Navigator {
  let group = navigators.get(g);
  if (!group) {
    group = new Map();
    navigators.set(g, group);
  }
  let value = group.get(id);
  if (!value) {
    value = { goal: -1, path: [], index: 0, retryIn: 0 };
    group.set(id, value);
  }
  return value;
}

export function resetFollowerNavigation(g: Game, id?: string) {
  if (id) {
    navigators.get(g)?.delete(id);
    return;
  }
  navigators.delete(g);
}

function cellId(tx: number, ty: number) {
  return ty * W + tx;
}
function cellPoint(id: number): Point {
  const tx = id % W;
  const ty = Math.floor(id / W);
  return { x: tx * TS + TS / 2, y: ty * TS + TS / 2 };
}
function inBounds(tx: number, ty: number) {
  return tx >= 0 && ty >= 0 && tx < W && ty < H;
}

function findRoute(
  g: Game,
  from: Point,
  to: Point,
  hw: number,
  hh: number,
): Point[] {
  const world = g.world;
  const sx = Math.floor(from.x / TS);
  const sy = Math.floor(from.y / TS);
  const tx = Math.floor(to.x / TS);
  const ty = Math.floor(to.y / TS);
  if (!inBounds(sx, sy) || !inBounds(tx, ty) || (sx === tx && sy === ty)) return [];
  if (bodyBlockedAt(world, from.x, from.y, hw, hh)) return [];

  let goals: number[] = [];
  for (let radius = 0; radius <= 3 && !goals.length; radius++) {
    const candidates: { id: number; distance: number }[] = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const gx = tx + dx;
        const gy = ty + dy;
        if (!inBounds(gx, gy)) continue;
        const point = cellPoint(cellId(gx, gy));
        if (!bodyBlockedAt(world, point.x, point.y, hw, hh)) {
          candidates.push({
            id: cellId(gx, gy),
            distance: Math.hypot(point.x - to.x, point.y - to.y),
          });
        }
      }
    }
    goals = candidates.sort((a, b) => a.distance - b.distance).map((candidate) => candidate.id);
  }
  if (!goals.length) return [];

  const goalSet = new Set(goals);
  const minX = Math.max(0, Math.min(sx, ...goals.map((id) => id % W)) - PATH_MARGIN);
  const maxX = Math.min(W - 1, Math.max(sx, ...goals.map((id) => id % W)) + PATH_MARGIN);
  const minY = Math.max(0, Math.min(sy, ...goals.map((id) => Math.floor(id / W))) - PATH_MARGIN);
  const maxY = Math.min(H - 1, Math.max(sy, ...goals.map((id) => Math.floor(id / W))) + PATH_MARGIN);
  if ((maxX - minX + 1) * (maxY - minY + 1) > MAX_VISITED * 4) return [];

  const start = cellId(sx, sy);
  const queue = [start];
  const parent = new Map<number, number>([[start, start]]);
  let found = -1;
  for (let head = 0; head < queue.length && head < MAX_VISITED; head++) {
    const current = queue[head]!;
    if (goalSet.has(current)) {
      found = current;
      break;
    }
    const cx = current % W;
    const cy = Math.floor(current / W);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
      const next = cellId(nx, ny);
      if (parent.has(next)) continue;
      const point = cellPoint(next);
      if (bodyBlockedAt(world, point.x, point.y, hw, hh)) continue;
      parent.set(next, current);
      queue.push(next);
    }
  }
  if (found < 0) return [];

  const route: Point[] = [];
  for (let current = found; current !== start; current = parent.get(current) ?? start)
    route.push(cellPoint(current));
  route.reverse();
  return route;
}

/** Walks in short collision-tested steps; replans only when an obstacle blocks direct pursuit. */
export function walkFollowerToward(
  g: Game,
  id: string,
  body: Body,
  target: Point,
  speed: number,
  dt: number,
  hw = 4,
  hh = 3,
): boolean {
  const safeDt = Math.max(0, Math.min(0.25, dt));
  const nav = navigator(g, id);
  nav.retryIn = Math.max(0, nav.retryIn - safeDt);
  const goal = cellId(Math.floor(target.x / TS), Math.floor(target.y / TS));
  const activePath = nav.index < nav.path.length;

  if (activePath && nav.goal !== goal && nav.retryIn <= 0) {
    nav.path = findRoute(g, body, target, hw, hh);
    nav.index = 0;
    nav.goal = goal;
    nav.retryIn = 0.35;
  }

  let destination = target;
  const hasRoute = nav.index < nav.path.length;
  if (hasRoute) {
    while (
      nav.index < nav.path.length &&
      Math.hypot(body.x - nav.path[nav.index]!.x, body.y - nav.path[nav.index]!.y) < 5
    )
      nav.index++;
    if (nav.index < nav.path.length) destination = nav.path[nav.index]!;
    else {
      nav.path = [];
      nav.index = 0;
    }
  }

  const dx = destination.x - body.x;
  const dy = destination.y - body.y;
  const distance = Math.hypot(dx, dy);
  if (!Number.isFinite(distance) || distance < 0.5 || safeDt === 0) return false;
  const step = Math.min(distance, Math.max(0, speed) * safeDt);
  const ux = dx / distance;
  const uy = dy / distance;
  const oldX = body.x;
  const oldY = body.y;
  g.moveBody(body, ux * step, uy * step, hw, hh);
  const movedX = body.x - oldX;
  const movedY = body.y - oldY;
  const moved = Math.hypot(movedX, movedY) > 0.05;
  const progress = movedX * ux + movedY * uy;

  if (hasRoute) {
    if (progress < Math.max(0.1, step * 0.5)) {
      nav.path = [];
      nav.index = 0;
      nav.retryIn = 0;
    }
  } else if (
    distance > step + 5 &&
    progress < Math.max(0.1, step * 0.72) &&
    nav.retryIn <= 0
  ) {
    nav.path = findRoute(g, body, target, hw, hh);
    nav.index = 0;
    nav.goal = goal;
    nav.retryIn = 0.35;
  }
  return moved;
}

export function safeFollowerPosition(
  g: Game,
  point: Point,
  hw = 4,
  hh = 3,
): Point {
  return findClearBodyPosition(g.world, point.x, point.y, hw, hh);
}
