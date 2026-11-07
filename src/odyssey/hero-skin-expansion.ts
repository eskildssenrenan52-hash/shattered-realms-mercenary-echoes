import type { HeroSkin } from "./hero-sprite";
import { AI_EXPANDED_HERO_SKIN_IDS } from "./hero-skin-art";

/** Total de skins expandidas com arte AI finalizada e folha Kaetram disponível. */
export const HERO_SKIN_EXPANSION_COUNT = AI_EXPANDED_HERO_SKIN_IDS.length;
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
  "Silhueta de viajante com traje pixel-art próprio, animado em todas as direções.",
  "Armadura de fronteira repintada em folha Kaetram completa.",
  "Traje ritual com identidade visual própria e animações preservadas.",
  "Equipamento artesanal criado para atravessar biomas e ruínas.",
  "Design de personagem em pixel art com folha de animação AI dedicada.",
] as const;

const finalized = new Set<string>(AI_EXPANDED_HERO_SKIN_IDS);

export const EXPANDED_HERO_SKINS: HeroSkin[] = Array.from({ length: 200 }, (_, index) => {
  const family = FAMILIES[index % FAMILIES.length]!;
  const material = MATERIALS[Math.floor(index / FAMILIES.length)]!;
  const name = `${family} ${material}`;
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const id = `design-fronteira-${String(index + 1).padStart(3, "0")}-${slug}`;

  return {
    id,
    name,
    desc: `${DESCRIPTIONS[index % DESCRIPTIONS.length]!} Design ${String(index + 1).padStart(3, "0")}.`,
    sheet: `hero/${id}`,
    minLevel: 1 + ((index * 37 + 5) % 80),
  };
}).filter((skin) => finalized.has(skin.id));
