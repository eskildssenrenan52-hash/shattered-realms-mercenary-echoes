import type { HeroSkin } from "./hero-sprite";

/** Variações cromáticas: uma folha real + filtro CSS, sem URLs de arte inventadas. */
export const HERO_SKIN_EXPANSION_COUNT = 200;
const FAMILIES = [
  "Sentinela",
  "Andarilha",
  "Arcanista",
  "Navegante",
  "Guardião",
  "Tecelã",
  "Batedor",
  "Oráculo",
  "Forjador",
  "Mensageira",
  "Vigília",
  "Caminhante",
  "Cantor",
  "Cartógrafa",
  "Curador",
  "Lâmina",
  "Astral",
  "Rastreador",
  "Cronista",
  "Alquimista",
] as const;
const MATERIALS = [
  "de Âmbar",
  "de Azurita",
  "de Basalto",
  "de Celestita",
  "de Quartzo",
  "de Granada",
  "de Jade",
  "de Lazulita",
  "de Malaquita",
  "de Ônix",
] as const;
const DESCRIPTIONS = [
  "Tonalidade encontrada nos caminhos depois da tempestade.",
  "Pigmento guardado por artesãos de uma cidade sem muralhas.",
  "Cores que lembram uma promessa feita ao primeiro amanhecer.",
  "Uma paleta discreta para atravessar fronteiras sem chamar o medo.",
  "Brilho de relíquia, aplicado à silhueta clássica do aventureiro.",
] as const;

export const EXPANDED_HERO_SKINS: HeroSkin[] = Array.from(
  { length: HERO_SKIN_EXPANSION_COUNT },
  (_, index) => {
    const family = FAMILIES[index % FAMILIES.length]!;
    const material = MATERIALS[Math.floor(index / FAMILIES.length)]!;
    const name = `${family} ${material}`;
    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const hue = (index * 47 + 19) % 360;
    const saturation = (1.04 + (index % 13) * 0.035).toFixed(2);
    const brightness = (0.88 + (index % 17) * 0.018).toFixed(2);
    const contrast = (0.94 + (index % 11) * 0.015).toFixed(2);

    return {
      id: `palette-fronteira-${String(index + 1).padStart(3, "0")}-${slug}`,
      name,
      desc: `${DESCRIPTIONS[index % DESCRIPTIONS.length]!} Variação cromática ${String(index + 1).padStart(3, "0")}.`,
      sheet: "player/base",
      minLevel: 1 + ((index * 37 + 5) % 80),
      paletteFilter: `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness}) contrast(${contrast})`,
    };
  },
);
