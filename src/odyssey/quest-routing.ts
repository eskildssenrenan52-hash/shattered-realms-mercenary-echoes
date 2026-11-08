import { bodyBlockedAt, H, TS, W, type World } from "./world";

export interface RouteTile {
  tx: number;
  ty: number;
}

interface OpenNode {
  id: number;
  cost: number;
  estimate: number;
}

function comesBefore(a: OpenNode, b: OpenNode) {
  return a.estimate < b.estimate || (a.estimate === b.estimate && a.cost > b.cost);
}

function heapPush(heap: OpenNode[], value: OpenNode) {
  let index = heap.length;
  heap.push(value);
  while (index > 0) {
    const parent = (index - 1) >> 1;
    if (comesBefore(heap[parent]!, value)) break;
    heap[index] = heap[parent]!;
    index = parent;
  }
  heap[index] = value;
}

function heapPop(heap: OpenNode[]): OpenNode | undefined {
  const first = heap[0];
  const last = heap.pop();
  if (!first || !last || heap.length === 0) return first;
  let index = 0;
  while (true) {
    const left = index * 2 + 1;
    if (left >= heap.length) break;
    const right = left + 1;
    const child = right < heap.length && comesBefore(heap[right]!, heap[left]!) ? right : left;
    if (comesBefore(last, heap[child]!)) break;
    heap[index] = heap[child]!;
    index = child;
  }
  heap[index] = last;
  return first;
}

const tileId = (tx: number, ty: number) => ty * W + tx;
const tileFromId = (id: number): RouteTile => ({ tx: id % W, ty: Math.floor(id / W) });
const inside = (tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < W && ty < H;
const walkable = (world: World, tx: number, ty: number) =>
  inside(tx, ty) && !bodyBlockedAt(world, tx * TS + TS / 2, ty * TS + TS / 2);

function nearestWalkable(world: World, point: RouteTile, maxRadius = 4): RouteTile | null {
  if (walkable(world, point.tx, point.ty)) return point;
  for (let radius = 1; radius <= maxRadius; radius++) {
    const candidates: RouteTile[] = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const candidate = { tx: point.tx + dx, ty: point.ty + dy };
        if (walkable(world, candidate.tx, candidate.ty)) candidates.push(candidate);
      }
    }
    candidates.sort((a, b) =>
      Math.hypot(a.tx - point.tx, a.ty - point.ty) - Math.hypot(b.tx - point.tx, b.ty - point.ty),
    );
    if (candidates.length) return candidates[0]!;
  }
  return null;
}

/** Encontra um trajeto ortogonal caminhável para desenhar; não move nem altera o jogador. */
export function findWalkableRoute(
  world: World,
  from: RouteTile,
  to: RouteTile,
  maxVisited = 26_000,
): RouteTile[] {
  const start = nearestWalkable(world, from);
  const goal = nearestWalkable(world, to);
  if (!start || !goal) return [];
  const startId = tileId(start.tx, start.ty);
  const goalId = tileId(goal.tx, goal.ty);
  if (startId === goalId) return [];

  const open: OpenNode[] = [];
  const parent = new Map<number, number>();
  const costs = new Map<number, number>([[startId, 0]]);
  const closed = new Set<number>();
  const heuristic = (tx: number, ty: number) => Math.abs(tx - goal.tx) + Math.abs(ty - goal.ty);
  heapPush(open, { id: startId, cost: 0, estimate: heuristic(start.tx, start.ty) });
  let found = false;
  let visited = 0;

  while (open.length && visited < maxVisited) {
    const current = heapPop(open)!;
    if (closed.has(current.id) || current.cost !== costs.get(current.id)) continue;
    if (current.id === goalId) {
      found = true;
      break;
    }
    closed.add(current.id);
    visited++;
    const { tx, ty } = tileFromId(current.id);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = tx + dx;
      const ny = ty + dy;
      if (!walkable(world, nx, ny)) continue;
      const nextId = tileId(nx, ny);
      if (closed.has(nextId)) continue;
      const nextCost = current.cost + 1;
      if (nextCost >= (costs.get(nextId) ?? Infinity)) continue;
      costs.set(nextId, nextCost);
      parent.set(nextId, current.id);
      heapPush(open, { id: nextId, cost: nextCost, estimate: nextCost + heuristic(nx, ny) });
    }
  }
  if (!found) return [];

  const reversed: RouteTile[] = [];
  for (let id = goalId; id !== startId;) {
    reversed.push(tileFromId(id));
    const previous = parent.get(id);
    if (previous === undefined) return [];
    id = previous;
  }
  return reversed.reverse();
}
