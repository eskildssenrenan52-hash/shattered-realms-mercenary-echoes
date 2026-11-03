import { BIOME_NAMES, type Biome } from "./data";
import { FRONTIER } from "./frontier";
import { TEMPLES, templeDoor } from "./depths";
import { biomeMineBestFloor } from "./biome-mines";
import { BIOME_LIST, SOLID, T, TS, W, H, type World } from "./world";
import type { Game } from "./engine";

export interface BiomeMineEntrance {
  biome: Biome;
  tx: number;
  ty: number;
}
const cache = new WeakMap<World, BiomeMineEntrance[]>();
const colors: Partial<Record<Biome, string>> = {
  plains: "#c5db78",
  forest: "#71aa62",
  desert: "#e8b65e",
  cave: "#b292dc",
  mountain: "#a7d6f5",
  autumn: "#e59a4b",
  swamp: "#6ab69a",
  coast: "#66c7d0",
  jungle: "#50b982",
  volcanic: "#f0714e",
  mushroom: "#d686dc",
  meadow: "#e7d36a",
  ruins: "#b9aa91",
};

function reservedTiles(): Set<number> {
  const reserved = new Set<number>();
  for (const temple of TEMPLES) {
    const door = templeDoor(temple);
    for (let y = door.ty - 11; y <= door.ty + 11; y++)
      for (let x = door.tx - 11; x <= door.tx + 11; x++) {
        if (x >= 0 && y >= 0 && x < W && y < H) reserved.add(y * W + x);
      }
  }
  return reserved;
}

/** Acha um ponto caminhável por bioma em uma única varredura do mapa e cacheia por World. */
export function biomeMineEntrances(world: World): BiomeMineEntrance[] {
  const found = cache.get(world);
  if (found) return found;
  const reserved = reservedTiles();
  const candidates: { score: number; index: number }[][] = BIOME_LIST.map(() => []);
  const targets = BIOME_LIST.map((_, i) => ({
    x: 170 + (i % 6) * 560,
    y: 120 + Math.floor(i / 6) * 480,
  }));
  const keep = 8;
  for (let index = 0; index < world.tiles.length; index++) {
    const biomeIndex = world.biomes[index] ?? 0;
    const list = candidates[biomeIndex];
    if (!list || SOLID.has(world.tiles[index]!) || reserved.has(index)) continue;
    const x = index % W,
      y = Math.floor(index / W),
      target = targets[biomeIndex]!;
    const dx = x - target.x,
      dy = y - target.y;
    const score = dx * dx + dy * dy;
    if (list.length < keep || score < list[list.length - 1]!.score) {
      let at = list.length;
      if (at === keep) at--;
      while (at > 0 && list[at - 1]!.score > score) at--;
      list.splice(at, 0, { score, index });
      if (list.length > keep) list.pop();
    }
  }
  const chosen: BiomeMineEntrance[] = [];
  const occupied: { x: number; y: number }[] = [];
  BIOME_LIST.forEach((biome, biomeIndex) => {
    const options = candidates[biomeIndex] ?? [];
    const pick =
      options.find(({ index }) => {
        const x = index % W,
          y = Math.floor(index / W);
        return occupied.every((p) => Math.hypot(p.x - x, p.y - y) >= 12);
      }) ?? options[0];
    if (!pick) return;
    const tx = pick.index % W,
      ty = Math.floor(pick.index / W);
    occupied.push({ x: tx, y: ty });
    chosen.push({ biome, tx, ty });
  });
  cache.set(world, chosen);
  return chosen;
}

/** Esculpe uma pequena clareira para cada entrada; a alteração é determinística e não afeta saves legados. */
export function carveBiomeMineEntrances(world: World): BiomeMineEntrance[] {
  const entrances = biomeMineEntrances(world);
  for (const entrance of entrances) {
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const x = entrance.tx + dx,
          y = entrance.ty + dy;
        if (x >= 1 && y >= 1 && x < W - 1 && y < H - 1) world.tiles[y * W + x] = T.PATH;
      }
    world.nodes = world.nodes.filter(
      (node) => Math.abs(node.tx - entrance.tx) > 2 || Math.abs(node.ty - entrance.ty) > 2,
    );
  }
  return entrances;
}

export function biomeMineEntranceNear(g: Game, radius = 28): BiomeMineEntrance | undefined {
  if (g.depth || g.interior || g.island || g.sea) return undefined;
  return biomeMineEntrances(g.world).find(
    (entrance) => Math.hypot(g.p.x - entrance.tx * TS - 8, g.p.y - entrance.ty * TS - 8) < radius,
  );
}

export function drawBiomeMineEntrances(
  g: Game,
  c: CanvasRenderingContext2D,
  draws: { y: number; f: () => void }[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  wt: number,
) {
  for (const entrance of biomeMineEntrances(g.world)) {
    if (
      entrance.tx < x0 - 3 ||
      entrance.tx > x1 + 3 ||
      entrance.ty < y0 - 3 ||
      entrance.ty > y1 + 3
    )
      continue;
    const best = biomeMineBestFloor(g.discoveries, entrance.biome);
    const color =
      FRONTIER[entrance.biome as keyof typeof FRONTIER]?.base ??
      colors[entrance.biome] ??
      "#c8a0ff";
    draws.push({
      y: (entrance.ty + 1) * TS,
      f: () => {
        const x = entrance.tx * TS + 8,
          y = entrance.ty * TS + 8;
        c.save();
        c.globalAlpha = 0.55 + Math.sin(wt * 3.2 + entrance.tx) * 0.12;
        c.fillStyle = `${color}66`;
        c.fillRect(x - 7, y - 7, 14, 14);
        c.globalAlpha = 1;
        c.strokeStyle = color;
        c.lineWidth = 1;
        c.strokeRect(x - 7, y - 7, 14, 14);
        c.fillStyle = "#241d2c";
        c.fillRect(x - 4, y - 5, 8, 10);
        c.fillStyle = "#e6d3a3";
        c.fillRect(x - 3, y - 4, 1, 8);
        c.fillRect(x + 2, y - 4, 1, 8);
        c.fillStyle = "#dfbb67";
        for (let rung = -3; rung <= 3; rung += 3) c.fillRect(x - 3, y + rung, 6, 1);
        c.font = "5px monospace";
        c.textAlign = "center";
        c.textBaseline = "top";
        c.fillStyle = "#16121c";
        c.fillRect(x - 26, y + 8, 52, 8);
        c.fillStyle = color;
        c.fillText(
          `${BIOME_NAMES[entrance.biome].slice(0, 10).toUpperCase()} ${best}/10`,
          x,
          y + 9,
        );
        c.restore();
      },
    });
  }
}
