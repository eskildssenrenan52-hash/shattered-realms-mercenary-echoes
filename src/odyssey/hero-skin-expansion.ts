import type { HeroSkin } from "./hero-sprite";
import { uniqueDesign } from "./unique-character";

/** Designs procedurais: cada skin muda silhueta, rosto, cabelo, roupa, acessório e arma. */
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
  "Silhueta de viajante com cabelo, roupa e acessório desenhados para esta identidade.",
  "Armadura de fronteira com rosto e equipamento próprios, sem compartilhar o corpo-base.",
  "Traje ritual com uma construção visual diferente em cada detalhe.",
  "Equipamento artesanal criado para atravessar biomas e ruínas.",
  "Design de personagem completo, com animação pixel-art e arma exclusiva.",
] as const;
const WEAPONS = ["sword", "staff", "bow", "axe", "spear", "orb"] as const;

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
    const design = uniqueDesign(10_000 + index, WEAPONS[index % WEAPONS.length]);

    return {
      id: `design-fronteira-${String(index + 1).padStart(3, "0")}-${slug}`,
      name,
      desc: `${DESCRIPTIONS[index % DESCRIPTIONS.length]!} Design ${String(index + 1).padStart(3, "0")}.`,
      sheet: "player/base",
      minLevel: 1 + ((index * 37 + 5) % 80),
      design,
    };
  },
);
