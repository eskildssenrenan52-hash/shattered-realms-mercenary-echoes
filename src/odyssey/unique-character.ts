export interface UniqueCharacterDesign {
  seed: number;
  skin: string;
  hair: string;
  cloth: string;
  accent: string;
  metal: string;
  silhouette: number;
  head: number;
  hairStyle: number;
  accessory: number;
  weapon: "sword" | "staff" | "bow" | "axe" | "spear" | "orb";
}

interface DrawOptions {
  x: number;
  y: number;
  dir: number;
  frame: number;
  moving?: boolean;
  attacking?: boolean;
  time?: number;
  scale?: number;
  alpha?: number;
  label?: boolean;
}

const px = (c: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) => {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
};

function polygon(c: CanvasRenderingContext2D, color: string, points: number[][]) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(points[0]![0]!, points[0]![1]!);
  for (const point of points.slice(1)) c.lineTo(point[0]!, point[1]!);
  c.closePath();
  c.fill();
}

/**
 * Pixel-art character renderer for generated skins and mercenaries.
 * The seed changes geometry, not only hue: body silhouette, headgear, hair,
 * accessories and weapon are all independently selected.
 */
export function drawUniqueCharacter(
  c: CanvasRenderingContext2D,
  design: UniqueCharacterDesign,
  options: DrawOptions,
) {
  const scale = options.scale ?? 1;
  const alpha = options.alpha ?? 1;
  const t = options.time ?? 0;
  const step = options.moving ? options.frame % 2 : 0;
  const bob = options.moving ? (step ? -0.7 : 0) : Math.sin(t * 2.2 + design.seed) * 0.35;
  const left = options.dir === 1;
  const facingUp = options.dir === 3;
  const facingSide = options.dir === 1 || options.dir === 2;
  const flip = left ? -1 : 1;
  const ox = options.x;
  const oy = options.y + bob;
  const s = scale;

  c.save();
  c.globalAlpha *= alpha;
  c.translate(ox, oy);
  c.scale(flip * s, s);

  const dark = "#171827";
  const shadow = "#2a2030";
  const skinShadow = "#9b654f";
  const clothShadow = "#3f315c";
  const accentShadow = "#6c354c";

  // Back accessories establish a different silhouette before the body is drawn.
  if (design.accessory % 7 === 0) {
    px(c, design.accent, -13, -20, 4, 12);
    px(c, design.accent, 9, -20, 4, 12);
  } else if (design.accessory % 7 === 1) {
    polygon(c, design.accent, [[-12, -7], [-19, -2], [-13, 2], [-7, -5]]);
  } else if (design.accessory % 7 === 2) {
    px(c, design.metal, -12, -18, 3, 14);
    px(c, design.metal, 9, -18, 3, 14);
    px(c, design.accent, -14, -19, 2, 4);
  }

  // Legs vary in width and footwear so the lower silhouette is not shared.
  if (design.silhouette % 4 === 0) {
    px(c, dark, -6, -5, 4, 7);
    px(c, dark, 2, -5, 4, 7);
    px(c, design.metal, -7, 1, 5, 2);
    px(c, design.metal, 2, 1, 6, 2);
  } else if (design.silhouette % 4 === 1) {
    polygon(c, design.cloth, [[-7, -7], [0, -7], [-1, 1], [-7, 1]]);
    polygon(c, clothShadow, [[0, -7], [7, -7], [8, 1], [1, 1]]);
    px(c, design.metal, -8, 0, 7, 3);
    px(c, design.metal, 1, 0, 8, 3);
  } else if (design.silhouette % 4 === 2) {
    polygon(c, design.cloth, [[-8, -7], [8, -7], [5, 2], [-5, 2]]);
    px(c, design.accent, -8, 0, 16, 3);
  } else {
    px(c, design.metal, -7, -6, 5, 8);
    px(c, design.metal, 2, -6, 5, 8);
    px(c, accentShadow, -8, 1, 7, 2);
    px(c, accentShadow, 1, 1, 7, 2);
  }

  // Torso: tunic, cape, broad armor, robe, coat, or insectoid shell.
  switch (design.silhouette % 8) {
    case 0:
      px(c, clothShadow, -8, -16, 16, 12);
      px(c, design.cloth, -7, -17, 14, 10);
      px(c, design.accent, -2, -17, 4, 10);
      break;
    case 1:
      polygon(c, design.cloth, [[-7, -17], [7, -17], [12, -3], [-12, -3]]);
      px(c, design.accent, -2, -15, 4, 11);
      px(c, design.metal, -11, -9, 3, 5);
      px(c, design.metal, 8, -9, 3, 5);
      break;
    case 2:
      px(c, design.metal, -10, -16, 20, 12);
      px(c, design.cloth, -6, -14, 12, 9);
      px(c, design.accent, -3, -16, 6, 3);
      px(c, design.metal, -12, -14, 3, 7);
      px(c, design.metal, 9, -14, 3, 7);
      break;
    case 3:
      polygon(c, design.cloth, [[-6, -17], [6, -17], [12, 1], [-12, 1]]);
      px(c, design.accent, -8, -6, 16, 3);
      px(c, design.metal, -2, -13, 4, 11);
      break;
    case 4:
      polygon(c, design.cloth, [[-8, -17], [5, -17], [10, -5], [5, 1], [-10, 1]]);
      px(c, design.accent, -8, -10, 5, 3);
      px(c, design.accent, 4, -8, 5, 3);
      break;
    case 5:
      px(c, design.cloth, -8, -17, 16, 14);
      px(c, design.metal, -11, -12, 4, 10);
      px(c, design.metal, 7, -12, 4, 10);
      px(c, design.accent, -3, -18, 6, 14);
      break;
    case 6:
      polygon(c, design.cloth, [[-7, -18], [7, -18], [9, -4], [3, 1], [-9, -4]]);
      px(c, design.metal, -5, -15, 10, 3);
      px(c, design.accent, -2, -11, 4, 9);
      break;
    default:
      px(c, design.metal, -8, -17, 16, 14);
      px(c, design.cloth, -5, -14, 10, 10);
      px(c, design.accent, -8, -4, 16, 3);
      px(c, design.metal, -11, -12, 3, 8);
      px(c, design.metal, 8, -12, 3, 8);
  }

  // Head and face. Up-facing characters keep the hood/helmet readable.
  if (design.head % 5 === 0) {
    px(c, skinShadow, -6, -25, 12, 9);
    px(c, design.skin, -5, -26, 10, 8);
  } else if (design.head % 5 === 1) {
    c.fillStyle = design.skin;
    c.beginPath(); c.arc(0, -21, 6, 0, Math.PI * 2); c.fill();
    px(c, skinShadow, -6, -21, 2, 5);
  } else if (design.head % 5 === 2) {
    px(c, design.metal, -7, -27, 14, 10);
    px(c, design.skin, -4, -22, 8, 4);
    px(c, design.accent, -8, -25, 3, 4);
    px(c, design.accent, 5, -25, 3, 4);
  } else if (design.head % 5 === 3) {
    polygon(c, design.cloth, [[-7, -24], [0, -29], [7, -24], [5, -15], [-5, -15]]);
    px(c, design.skin, -4, -21, 8, 5);
  } else {
    px(c, design.metal, -7, -26, 14, 10);
    px(c, design.accent, -6, -22, 12, 3);
    px(c, design.skin, -2, -19, 4, 2);
  }

  // Hair/crest is a separate geometry layer, not a palette change.
  switch (design.hairStyle % 7) {
    case 0: px(c, design.hair, -6, -28, 12, 3); px(c, design.hair, -8, -25, 3, 6); break;
    case 1: polygon(c, design.hair, [[-7, -25], [-3, -30], [2, -29], [8, -25], [5, -22], [-6, -22]]); break;
    case 2: px(c, design.hair, -8, -27, 16, 3); px(c, design.hair, -5, -30, 3, 4); px(c, design.hair, 2, -30, 3, 4); break;
    case 3: px(c, design.hair, -8, -27, 4, 9); px(c, design.hair, 4, -27, 4, 9); px(c, design.accent, -3, -30, 6, 3); break;
    case 4: polygon(c, design.hair, [[-9, -26], [-4, -31], [4, -31], [9, -26], [5, -24], [-5, -24]]); break;
    case 5: px(c, design.hair, -6, -30, 12, 3); px(c, design.hair, -3, -33, 3, 4); px(c, design.hair, 2, -33, 3, 4); break;
    default: px(c, design.hair, -8, -26, 16, 4); px(c, design.metal, -2, -31, 4, 5);
  }

  if (!facingUp) {
    px(c, design.accent, facingSide ? 3 : -3, -22, 2, 2);
    if (design.head % 3 === 0) px(c, design.accent, facingSide ? 6 : -8, -22, 2, 2);
  }

  // Front accessory and weapon create a readable class silhouette.
  if (design.accessory % 7 === 3) {
    px(c, design.metal, -2, -16, 4, 4);
    px(c, design.accent, -4, -14, 8, 2);
  } else if (design.accessory % 7 === 4) {
    px(c, design.accent, 6, -20, 3, 10);
    px(c, design.accent, 8, -21, 3, 2);
  } else if (design.accessory % 7 === 5) {
    c.strokeStyle = design.metal; c.lineWidth = 1.5;
    c.beginPath(); c.arc(0, -20, 10, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  } else if (design.accessory % 7 === 6) {
    px(c, design.accent, -11, -12, 4, 3);
    px(c, design.accent, 7, -12, 4, 3);
  }

  const weaponX = facingSide ? 9 : 7;
  if (options.attacking) {
    c.strokeStyle = design.metal; c.lineWidth = 2;
    c.beginPath(); c.moveTo(weaponX, -13); c.lineTo(weaponX + 13, -25); c.stroke();
  } else if (design.weapon === "staff" || design.weapon === "orb") {
    px(c, design.metal, weaponX, -22, 2, 22);
    c.fillStyle = design.accent; c.beginPath(); c.arc(weaponX + 1, -24, design.weapon === "orb" ? 4 : 3, 0, Math.PI * 2); c.fill();
  } else if (design.weapon === "bow") {
    c.strokeStyle = design.metal; c.lineWidth = 1.5;
    c.beginPath(); c.arc(weaponX, -14, 8, -Math.PI / 2, Math.PI / 2); c.stroke();
  } else if (design.weapon === "axe") {
    px(c, design.metal, weaponX, -21, 2, 18);
    px(c, design.accent, weaponX + 1, -22, 6, 5);
  } else if (design.weapon === "spear") {
    px(c, design.metal, weaponX + 1, -27, 2, 25);
    polygon(c, design.accent, [[weaponX, -28], [weaponX + 4, -28], [weaponX + 2, -34]]);
  } else {
    px(c, design.metal, weaponX, -23, 2, 20);
    px(c, design.accent, weaponX - 1, -25, 4, 3);
  }

  c.restore();
}

export function uniqueDesign(seed: number, weapon: UniqueCharacterDesign["weapon"] = "sword"): UniqueCharacterDesign {
  const hue = (seed * 47 + 23) % 360;
  const accentHue = (hue + 82 + (seed % 5) * 21) % 360;
  const metalHue = (hue + 180 + (seed % 7) * 13) % 360;
  return {
    seed,
    skin: `hsl(${(hue + 28) % 360} 54% ${58 + (seed % 5) * 4}%)`,
    hair: `hsl(${(hue + 300) % 360} 42% ${18 + (seed % 6) * 5}%)`,
    cloth: `hsl(${hue} 58% ${32 + (seed % 7) * 4}%)`,
    accent: `hsl(${accentHue} 78% ${48 + (seed % 5) * 5}%)`,
    metal: `hsl(${metalHue} 30% ${48 + (seed % 6) * 5}%)`,
    silhouette: seed % 8,
    head: (seed * 3) % 5,
    hairStyle: (seed * 5 + 1) % 7,
    accessory: (seed * 7 + 2) % 7,
    weapon,
  };
}
