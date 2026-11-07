// Protagonista com os sprites do primeiro jogo: corpo base, skins prontas e arma equipada em camadas.
// Acessórios pintados por IA (look-gear.ts) são desenhados em camadas sobre a skin.
import type { ItemDef, WeaponKind } from "./data";
import { drawK, kImage, K_DIR } from "./kaetram";
import { drawGearBack, drawGearFront, type GearPick } from "./look-gear";
import type { FxName } from "./vfx";
import { EXPANDED_HERO_SKINS } from "./hero-skin-expansion";

export type ComboFx = [FxName, FxName, FxName, FxName, FxName];
export interface HeroSkin {
  id: string;
  name: string;
  desc: string;
  sheet: string;
  minLevel: number;
  ai?: boolean;
  fx?: ComboFx;
  paletteFilter?: string;
}
const CLASSIC_FX: ComboFx = ["slash", "impact", "slash", "shock", "explosion"];
/** Índice salvo em Look.kskin: só skins no estilo Kaetram (ordem antiga preservada para saves). */
export const HERO_SKINS: HeroSkin[] = [
  {
    id: "base",
    name: "Aventureiro",
    desc: "O herói clássico do primeiro jogo.",
    sheet: "player/base",
    minLevel: 1,
  },
  {
    id: "danbo",
    name: "Danbo",
    desc: "Robô de papelão, firme e leal.",
    sheet: "player/skin/danbo",
    minLevel: 1,
  },
  {
    id: "danboblue",
    name: "Danbo Azul",
    desc: "Pintado com tinta do mar.",
    sheet: "player/skin/danboblue",
    minLevel: 2,
  },
  {
    id: "danbogreen",
    name: "Danbo Verde",
    desc: "Camuflado para a mata.",
    sheet: "player/skin/danbogreen",
    minLevel: 3,
  },
  {
    id: "danbored",
    name: "Danbo Rubro",
    desc: "Pronto para a forja.",
    sheet: "player/skin/danbored",
    minLevel: 4,
  },
  {
    id: "taekwondo",
    name: "Mestre Taekwondo",
    desc: "Faixa preta e dobok branco.",
    sheet: "player/skin/taekwondo",
    minLevel: 5,
  },
  {
    id: "oldman",
    name: "Velho Sábio",
    desc: "Barba longa, passos lentos, olhar atento.",
    sheet: "player/skin/oldmanskin",
    minLevel: 7,
  },
  {
    id: "skeleton",
    name: "Esqueleto",
    desc: "Voltou do Abismo e esqueceu de morrer.",
    sheet: "player/skin/skeletonskin",
    minLevel: 10,
  },
  {
    id: "darkskeleton",
    name: "Esqueleto Sombrio",
    desc: "Ossos tingidos pela Noite.",
    sheet: "player/skin/darkskeletonskin",
    minLevel: 15,
  },
  // Novas skins pintadas por IA (adicionadas ao fim para preservar índices salvos).
  {
    id: "knight",
    name: "Cavaleiro de Prata",
    desc: "Armadura polida e tabardo azul.",
    sheet: "hero/knight",
    minLevel: 1,
    ai: true,
  },
  {
    id: "ninja",
    name: "Ninja",
    desc: "Sombra veloz de lenço rubro.",
    sheet: "hero/ninja",
    minLevel: 2,
    ai: true,
  },
  {
    id: "wizard",
    name: "Mago Estelar",
    desc: "Barba branca e manto de estrelas.",
    sheet: "hero/wizard",
    minLevel: 3,
    ai: true,
  },
  {
    id: "orc",
    name: "Orc Guerreiro",
    desc: "Pele verde, couro e presas.",
    sheet: "hero/orc",
    minLevel: 4,
    ai: true,
  },
  {
    id: "pirate",
    name: "Pirata",
    desc: "Bandana vermelha e colete de couro.",
    sheet: "hero/pirate",
    minLevel: 5,
    ai: true,
  },
  {
    id: "astronaut",
    name: "Astronauta",
    desc: "Caiu das estrelas em Kaetran.",
    sheet: "hero/astronaut",
    minLevel: 6,
    ai: true,
  },
  // Variações de paleta sobre player/base: não criam URLs ou folhas novas e preservam os índices acima.
  {
    id: "palette-ember",
    name: "Brasa",
    desc: "Uma paleta quente, marcada pela Fratura.",
    sheet: "hero/palette/ember",
    minLevel: 16,
    ai: true,
    paletteFilter: "hue-rotate(330deg) saturate(1.35) contrast(1.05)",
  },
  {
    id: "palette-tide",
    name: "Maré Profunda",
    desc: "Azuis frios para quem viaja entre ilhas.",
    sheet: "hero/palette/tide",
    minLevel: 17,
    ai: true,
    paletteFilter: "hue-rotate(165deg) saturate(1.2)",
  },
  {
    id: "palette-moss",
    name: "Musgo Antigo",
    desc: "Verdes de uma floresta que se lembra de tudo.",
    sheet: "hero/palette/moss",
    minLevel: 18,
    ai: true,
    paletteFilter: "hue-rotate(72deg) saturate(1.25) brightness(0.95)",
  },
  {
    id: "palette-lilac",
    name: "Lilás do Eco",
    desc: "A cor suave das cavernas que respondem.",
    sheet: "hero/palette/lilac",
    minLevel: 19,
    ai: true,
    paletteFilter: "hue-rotate(255deg) saturate(1.18)",
  },
  {
    id: "palette-gold",
    name: "Ouro Solar",
    desc: "Luz de meio-dia guardada na armadura.",
    sheet: "hero/palette/gold",
    minLevel: 20,
    ai: true,
    paletteFilter: "hue-rotate(28deg) saturate(1.42) brightness(1.08)",
  },
  {
    id: "palette-ice",
    name: "Geada",
    desc: "Um brilho pálido para atravessar o norte.",
    sheet: "hero/palette/ice",
    minLevel: 21,
    ai: true,
    paletteFilter: "hue-rotate(190deg) saturate(0.9) brightness(1.12)",
  },
  {
    id: "palette-rose",
    name: "Rosa de Coral",
    desc: "A paleta dos recifes e das promessas.",
    sheet: "hero/palette/rose",
    minLevel: 22,
    ai: true,
    paletteFilter: "hue-rotate(300deg) saturate(1.3)",
  },
  {
    id: "palette-forest",
    name: "Bosque",
    desc: "Folhas profundas e terra molhada.",
    sheet: "hero/palette/forest",
    minLevel: 23,
    ai: true,
    paletteFilter: "hue-rotate(95deg) saturate(1.28) brightness(0.94)",
  },
  {
    id: "palette-cinder",
    name: "Cinza Viva",
    desc: "Cinzas que ainda guardam uma centelha.",
    sheet: "hero/palette/cinder",
    minLevel: 24,
    ai: true,
    paletteFilter: "grayscale(0.55) sepia(0.45) hue-rotate(350deg) saturate(1.2)",
  },
  {
    id: "palette-amethyst",
    name: "Ametista",
    desc: "Violeta cristalino para noites sem lua.",
    sheet: "hero/palette/amethyst",
    minLevel: 25,
    ai: true,
    paletteFilter: "hue-rotate(235deg) saturate(1.4)",
  },
  {
    id: "palette-sand",
    name: "Areia Dourada",
    desc: "Tons secos de uma rota que muda toda noite.",
    sheet: "hero/palette/sand",
    minLevel: 26,
    ai: true,
    paletteFilter: "sepia(0.42) hue-rotate(8deg) saturate(1.22) brightness(1.04)",
  },
  {
    id: "palette-storm",
    name: "Tempestade",
    desc: "Relâmpagos azulados presos no tecido.",
    sheet: "hero/palette/storm",
    minLevel: 27,
    ai: true,
    paletteFilter: "hue-rotate(205deg) saturate(1.5) contrast(1.12)",
  },
  {
    id: "palette-void",
    name: "Vazio",
    desc: "Um tom escuro que não apaga a silhueta.",
    sheet: "hero/palette/void",
    minLevel: 28,
    ai: true,
    paletteFilter: "brightness(0.72) saturate(1.35) hue-rotate(250deg)",
  },
  {
    id: "palette-pearl",
    name: "Pérola",
    desc: "Clareza suave para um novo começo.",
    sheet: "hero/palette/pearl",
    minLevel: 29,
    ai: true,
    paletteFilter: "brightness(1.2) saturate(0.72) contrast(0.96)",
  },
  {
    id: "palette-copper",
    name: "Cobre",
    desc: "Metal quente de uma oficina viajante.",
    sheet: "hero/palette/copper",
    minLevel: 30,
    ai: true,
    paletteFilter: "sepia(0.35) hue-rotate(345deg) saturate(1.45)",
  },
  {
    id: "palette-lotus",
    name: "Lótus",
    desc: "Rosa claro para quem cura sem alarde.",
    sheet: "hero/palette/lotus",
    minLevel: 31,
    ai: true,
    paletteFilter: "hue-rotate(285deg) saturate(1.18) brightness(1.06)",
  },
  {
    id: "palette-bamboo",
    name: "Bambu",
    desc: "Verde claro, leve como um golpe de vento.",
    sheet: "hero/palette/bamboo",
    minLevel: 32,
    ai: true,
    paletteFilter: "hue-rotate(110deg) saturate(1.12) brightness(1.06)",
  },
  {
    id: "palette-obsidian",
    name: "Obsidiana",
    desc: "Preto vulcânico com reflexos violetas.",
    sheet: "hero/palette/obsidian",
    minLevel: 33,
    ai: true,
    paletteFilter: "brightness(0.62) contrast(1.24) hue-rotate(265deg) saturate(1.25)",
  },
  {
    id: "palette-moon",
    name: "Lua",
    desc: "Prata fria para trilhas noturnas.",
    sheet: "hero/palette/moon",
    minLevel: 34,
    ai: true,
    paletteFilter: "grayscale(0.38) brightness(1.16) hue-rotate(190deg)",
  },
  {
    id: "palette-saffron",
    name: "Açafrão",
    desc: "Amarelo vivo de uma feira de Potos.",
    sheet: "hero/palette/saffron",
    minLevel: 35,
    ai: true,
    paletteFilter: "sepia(0.5) hue-rotate(12deg) saturate(1.55)",
  },
  {
    id: "palette-celadon",
    name: "Celadon",
    desc: "Verde-água de cerâmica antiga.",
    sheet: "hero/palette/celadon",
    minLevel: 36,
    ai: true,
    paletteFilter: "hue-rotate(145deg) saturate(0.95) brightness(1.08)",
  },
  {
    id: "palette-crimson",
    name: "Carmesim",
    desc: "Vermelho de uma lâmina que já voltou.",
    sheet: "hero/palette/crimson",
    minLevel: 37,
    ai: true,
    paletteFilter: "hue-rotate(315deg) saturate(1.48) contrast(1.08)",
  },
  {
    id: "palette-aurora",
    name: "Aurora",
    desc: "Todas as cores de um céu reaberto.",
    sheet: "hero/palette/aurora",
    minLevel: 38,
    ai: true,
    paletteFilter: "hue-rotate(135deg) saturate(1.4) brightness(1.12)",
  },
  {
    id: "palette-constellation",
    name: "Constelação",
    desc: "O mapa final, desenhado em luz.",
    sheet: "hero/palette/constellation",
    minLevel: 39,
    ai: true,
    paletteFilter: "hue-rotate(220deg) saturate(1.6) brightness(1.1) contrast(1.1)",
  },
];
// Append-only: Look.kskin is an index persisted in browser saves.
HERO_SKINS.push(...EXPANDED_HERO_SKINS);
export const skinUnlocked = (i: number, level: number) => level >= (HERO_SKINS[i]?.minLevel ?? 1);
/** Efeito especial do golpe `step` (0–4) do combo para a skin. */
export const skinFx = (i: number, step: number): FxName =>
  (HERO_SKINS[i]?.fx ?? CLASSIC_FX)[((step % 5) + 5) % 5] ?? "slash";

/** Folha de arma para cada tipo quando o item não tiver uma própria. */
const KIND_SPRITE: Record<WeaponKind, string> = {
  sword: "tinsword",
  spear: "bronzespear",
  bow: "woodenbow",
  staff: "naturestaff",
};
export function weaponSheet(item: Pick<ItemDef, "sprite" | "weapon"> | undefined): string {
  const s = item?.sprite ?? KIND_SPRITE[item?.weapon ?? "sword"];
  return `player/weapon/${s}`;
}

/**
 * Desenha o herói com sprites Kaetram. Retorna false quando a skin é a clássica
 * ou as imagens ainda não carregaram (o jogo então usa drawChar).
 */
export function drawHero(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  o: {
    skin: number;
    dir: number;
    moving: boolean;
    frameT: number;
    attack: number;
    combo?: number;
    weapon?: Pick<ItemDef, "sprite" | "weapon"> | null;
    time: number;
    alpha?: number;
    scale?: number;
    gear?: GearPick;
  },
): boolean {
  const skin = HERO_SKINS[o.skin] ?? HERO_SKINS[0];
  const renderSheet = skin.paletteFilter ? "player/base" : skin.sheet;
  if (!renderSheet || !kImage(renderSheet)) return false;
  const d = K_DIR[o.dir] ?? "down",
    flip = o.dir === 1;
  const attacking = o.attack > 0;
  const bow = o.weapon?.weapon === "bow";
  const anim = attacking ? `${bow ? "bow_" : ""}atk_${d}` : o.moving ? `walk_${d}` : `idle_${d}`;
  const frame = attacking
    ? Math.min(3, Math.floor((1 - o.attack) * 4))
    : o.moving
      ? o.frameT
      : o.time * 2.2;
  const wsheet = o.weapon ? weaponSheet(o.weapon) : null;
  const sc = o.scale ?? 1,
    a = o.alpha ?? 1;
  drawGearBack(c, o.gear, x, y, d, flip, o.time, sc, a);
  if (wsheet && d === "up") drawK(c, wsheet, anim, frame, x, y, flip, a, sc);
  c.save();
  if (skin.paletteFilter) c.filter = skin.paletteFilter;
  drawK(c, renderSheet, anim, frame, x, y, flip, a, sc);
  c.restore();
  if (wsheet && d !== "up") drawK(c, wsheet, anim, frame, x, y, flip, a, sc);
  drawGearFront(c, o.gear, x, y, d, flip, o.time, sc, a);
  return true;
}
