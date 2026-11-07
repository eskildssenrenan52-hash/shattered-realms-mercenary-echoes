import {
  ROOM,
  buildingsInBounds,
  doorOf,
  interiorPlanOf,
  buildingFloors,
  type Building,
} from "./exploration";
import { TS, T, tileAt, hash, type World } from "./world";
type Ctx = CanvasRenderingContext2D;
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), w, h);
};
export function drawBuildings(c: Ctx, time: number, x0 = 0, y0 = 0, x1 = Infinity, y1 = Infinity) {
  for (const b of buildingsInBounds(x0, y0, x1, y1)) {
    const x = b.x * TS,
      y = b.y * TS,
      w = b.w * TS,
      h = b.h * TS;
    const p = b.palette;
    const roof = p?.roof ?? b.accent ?? (b.secret ? "#677e87" : "#943e48");
    const wall = p?.wall ?? "#e2d7b4",
      trim = p?.trim ?? "#e5a380",
      shadow = p?.shadow ?? "#23392b",
      door = p?.door ?? "#76523b",
      window = p?.window ?? "#7db9ba",
      detail = p?.detail ?? "#397a4b";
    const facade = b.facade ?? 0;
    box(c, x + 4, y + h - 4, w, 8, shadow + "60");
    box(c, x - 3, y - 2, w + 6, h - 25, roof);
    for (let row = 0; row < h - 26; row += 5) {
      box(c, x - 3, y + row, w + 6, 1, facade % 2 ? "#ffffff55" : trim);
      for (let col = 0; col < w; col += 9)
        box(c, x + col + (row % 2) * 4, y + row, 1, 5, facade % 3 === 0 ? "#435e6a" : shadow);
    }
    box(c, x - 4, y + h - 28, w + 8, 3, shadow);
    box(c, x - 4, y - 4, w + 8, 3, trim);
    box(c, x, y + h - 25, w, 25, wall);
    box(c, x, y + h - 25, 3, 25, shadow);
    box(c, x + w - 3, y + h - 25, 3, 25, shadow);
    box(c, x, y + h - 4, w, 4, trim);
    const d = doorOf(b);
    box(c, d.tx * TS - 2, d.ty * TS - 7, 20, 23, door);
    box(c, d.tx * TS + 1, d.ty * TS - 5, 14, 21, "#263637");
    box(c, d.tx * TS + 2, d.ty * TS - 4, 2, 18, trim);
    const windowXs = facade % 3 === 1 ? [x + 8, x + w - 20, x + w / 2 - 6] : [x + 8, x + w - 20];
    for (const wx of windowXs) {
      box(c, wx, y + h - 21, 12, 12, shadow);
      box(c, wx + 2, y + h - 19, 8, 8, window);
      box(c, wx + 3, y + h - 18, 3, 3, "#d7efe0");
      box(c, wx + 6, y + h - 19, 1, 8, shadow);
      box(c, wx - 1, y + h - 8, 14, 2, trim);
      box(c, wx, y + h - 6, 12, 3, detail);
      for (let i = 0; i < 3; i++)
        box(c, wx + i * 4 + 1, y + h - 8, 2, 2, facade % 2 ? "#f0c77d" : "#ecadbc");
    }
    // Chaminé, fumaça, lanterna e uma placa são todos primitivos determinísticos.
    if (facade % 4 !== 2) {
      box(c, x + w - 18, y - 9, 8, 15, shadow);
      box(c, x + w - 19, y - 10, 10, 3, trim);
      for (let i = 0; i < 3; i++) {
        const phase = (time * 7 + i * 7) % 23;
        c.globalAlpha = (1 - phase / 23) * 0.45;
        box(c, x + w - 14 + Math.sin(time + i) * 3, y - 11 - phase, 4 + i * 2, 3 + i, "#e1e4d3");
      }
      c.globalAlpha = 1;
    }
    box(c, d.tx * TS - 10, d.ty * TS - 4, 4, 6, shadow);
    box(c, d.tx * TS - 9, d.ty * TS - 3, 2, 3, Math.sin(time * 6) > 0.1 ? "#ffe3a0" : "#e9b36c");
    box(c, x + w + 2, y + h - 19, 2, 18, shadow);
    box(c, x + w - 2, y + h - 23, 12, 8, trim);
    box(c, x + w + 1, y + h - 21, 6, 1, detail);
  }
}
export function drawTreasure(c: Ctx, x: number, y: number, open: boolean, time: number) {
  box(c, x - 7, y - 4, 15, 5, "#263b3650");
  box(c, x - 7, y - 12, 14, 11, "#6c4738");
  box(c, x - 6, y - 11, 12, 9, "#b47f42");
  box(c, x - 7, y - 12, 14, open ? 3 : 5, open ? "#513c38" : "#d9a559");
  box(c, x - 7, y - 8, 14, 2, "#523e36");
  box(c, x - 5, y - 12, 2, 11, "#ead28b");
  box(c, x + 3, y - 12, 2, 11, "#ead28b");
  box(c, x - 1, y - 8, 3, 3, "#fff0ad");
  if (!open) {
    const p = Math.sin(time * 3 + x);
    box(c, x + 9, y - 16 + p * 2, 1, 4, "#fff1ae");
    box(c, x + 8, y - 15 + p * 2, 3, 1, "#fff1ae");
  }
}
export function drawGroundDetails(
  c: Ctx,
  world: World,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  time: number,
) {
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) {
      const t = tileAt(world, tx, ty),
        x = tx * TS,
        y = ty * TS;
      if (t === T.WATER) {
        for (const [dx, dy, w, h] of [
          [0, -1, 16, 2],
          [0, 1, 16, 2],
          [-1, 0, 2, 16],
          [1, 0, 2, 16],
        ]) {
          const n = tileAt(world, tx + dx, ty + dy);
          if (n !== T.WATER && n !== T.BRIDGE)
            box(c, x + (dx === 1 ? 14 : 0), y + (dy === 1 ? 14 : 0), w, h, "#9dc8ad");
        }
        if (hash(tx, ty, 9) > 0.93) {
          box(c, x + 4, y + 5, 6, 3, "#427f58");
          box(c, x + 5, y + 3, 3, 2, "#dfaac6");
        }
      }
      if (t === T.GRASS || t === T.FLOWER) {
        const r = hash(tx, ty, 45);
        if (r > 0.96) {
          const sway = Math.round(Math.sin(time * 2 + tx));
          for (let i = 0; i < 3; i++) {
            box(c, x + 3 + i * 4 + sway, y + 8 - i, 1, 5, "#32774d");
            box(c, x + 2 + i * 4 + sway, y + 6 - i, 3, 2, ["#e1cadd", "#efcf82", "#a7d8d2"][i]);
          }
        }
        if (r < 0.012) {
          const bx = x + 8 + Math.sin(time * 1.3 + ty) * 5,
            by = y + 5 + Math.cos(time + tx) * 4;
          box(c, bx, by, 1, 2, "#4a4a48");
          box(c, bx - 2, by + (Math.floor(time * 9) % 2), 2, 2, "#f6ddae");
          box(c, bx + 1, by, 2, 2, "#e7abbd");
        }
      }
    }
}
function shelf(c: Ctx, x: number, y: number) {
  box(c, x, y, 64, 28, "#694b3d");
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 12; i++)
      box(
        c,
        x + 3 + i * 5,
        y + 2 + row * 13,
        3,
        10,
        ["#647f88", "#b05c57", "#d1b06e", "#859269"][i % 4],
      );
    box(c, x, y + 12 + row * 13, 64, 2, "#c29a65");
  }
}
export function drawInterior(c: Ctx, b: Building, time: number, floor = 1) {
  const x = ROOM.left * TS,
    y = ROOM.top * TS,
    plan = interiorPlanOf(b, floor),
    total = buildingFloors(b),
    palette = b.palette;
  const floorCol = palette?.wall ?? (b.kind === "ruin" ? "#557b78" : "#975460"),
    trim = palette?.trim ?? "#d6b583",
    dark = palette?.shadow ?? "#554a42";
  box(c, x + 16, y + 32, 400, 2, `${dark}60`);
  // A planta base permanece reconhecível, mas cada assinatura escolhe um tapete e uma cor de sala.
  box(c, x + 145, y + 122, 122, 84, floorCol);
  box(c, x + 149, y + 126, 114, 76, trim);
  box(c, x + 152, y + 129, 108, 70, b.kind === "ruin" ? "#3b6265" : "#6f465c");
  for (let i = 0; i < 9; i++) {
    box(c, x + 155 + i * 12, y + 132, 5, 3, trim);
    box(c, x + 155 + i * 12, y + 192, 5, 3, trim);
  }
  shelf(c, 108 * TS, 96 * TS);
  shelf(c, 126 * TS, 96 * TS);
  // Table, notes, candle.
  box(c, 114 * TS, 101 * TS + 4, 64, 28, "#513f34");
  box(c, 114 * TS, 101 * TS, 64, 25, "#bb9060");
  box(c, 114 * TS + 4, 101 * TS + 3, 56, 1, trim);
  box(c, 114 * TS + 16, 101 * TS + 6, 16, 12, "#eee0bb");
  box(c, 114 * TS + 18, 101 * TS + 8, 10, 1, "#7d8178");
  box(c, 114 * TS + 44, 101 * TS + 3, 3, 10, "#f3d4a0");
  box(c, 114 * TS + 44, 101 * TS + Math.sin(time * 10), 2, 4, "#ffcf75");
  // Bed, workbench or altar: the same primitives receive a deterministic purpose tint.
  box(c, 126 * TS, 103 * TS, 48, 50, "#614b3e");
  box(
    c,
    126 * TS + 3,
    103 * TS + 3,
    42,
    43,
    b.kind === "alchemy" ? "#547e78" : b.purpose === "dungeon" ? "#594b72" : "#5a7b8b",
  );
  box(c, 126 * TS + 5, 103 * TS + 5, 38, 10, "#e7dcbd");
  box(c, 126 * TS + 5, 103 * TS + 17, 38, 2, "#a6bcc0");
  box(c, 126 * TS + 5, 103 * TS + 38, 38, 3, "#a6bcc0");
  // Fireplace and animated flames.
  box(c, x + 188, y + 5, 48, 26, "#66757a");
  box(c, x + 194, y + 9, 36, 22, "#2e363c");
  for (let i = 0; i < 9; i++) {
    const h = 4 + Math.round((Math.sin(time * 9 + i * 3 + plan.variant) + 1) * 5);
    box(c, x + 195 + i * 4, y + 31 - h, 3, h, i % 2 ? "#f3c272" : "#d97856");
  }
  box(c, x + 183, y + 28, 58, 4, "#9a9b89");
  for (const wx of [x + 100, x + 290]) {
    box(c, wx, y + 8, 28, 22, "#856b53");
    box(c, wx + 2, y + 9, 24, 18, "#96c5bf");
    box(c, wx + 13, y + 9, 2, 18, "#e5d5ad");
    box(c, wx + 2, y + 17, 24, 2, "#e5d5ad");
  }
  for (const [px, py] of [
    [x + 24, y + 205],
    [x + 375, y + 205],
  ]) {
    box(c, px, py, 12, 12, "#b7835c");
    box(c, px - 3, py - 11, 18, 15, "#507d5a");
    box(c, px + 2, py - 15, 8, 10, "#78a56d");
  }
  const stairs = [plan.stairUp, plan.stairDown];
  for (const stair of stairs)
    if (stair) {
      const sx = stair.tx * TS,
        sy = stair.ty * TS;
      box(c, sx - 5, sy - 5, 26, 22, "#283c46");
      for (let i = 0; i < 4; i++) box(c, sx - 2 + i * 5, sy + 9 - i * 4, 18 - i * 4, 2, "#c6a36d");
    }
  if (plan.objective) {
    const ox = plan.objective.tx * TS + 8,
      oy = plan.objective.ty * TS + 8,
      pulse = Math.sin(time * 4 + plan.variant) * 2;
    box(c, ox - 5, oy - 5 - pulse, 10, 10, palette?.detail ?? "#ffe0a0");
    box(c, ox - 2, oy - 2 - pulse, 4, 4, "#fff6c2");
  }
  c.save();
  c.font = "6px monospace";
  c.textAlign = "center";
  c.fillStyle = palette?.trim ?? "#e7d5a0";
  c.fillText(`andar ${floor}/${total}`, x + 216, y + 14);
  c.restore();
}
