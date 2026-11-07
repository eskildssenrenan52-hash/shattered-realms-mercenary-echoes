import type { MercenaryDef, MercRarity, MercRole } from "./mercenaries";
import { uniqueDesign } from "./unique-character";

/**
 * Catálogo paramétrico da segunda leva de contratos.
 *
 * As entradas mantêm a folha como fallback de compatibilidade, mas cada uma
 * recebe um design procedural completo: silhueta, rosto, cabelo, roupa,
 * acessórios, metal e arma são desenhados individualmente.
 * O índice é a parte estável do ID e do progressKey; não o altere depois de publicado.
 */
export const MERCENARY_EXPANSION_COUNT = 200;

const FIRST_NAMES = [
  "Amaro",
  "Anira",
  "Aruã",
  "Avelã",
  "Bia",
  "Ciro",
  "Dália",
  "Dimas",
  "Ema",
  "Fábio",
  "Gael",
  "Iara",
  "Ivo",
  "Jaci",
  "Juno",
  "Lara",
  "Lino",
  "Maíra",
  "Miro",
  "Nara",
  "Nilo",
  "Olívia",
  "Otto",
  "Paz",
  "Ravi",
  "Rosa",
  "Sami",
  "Sílvia",
  "Téo",
  "Ubir",
  "Vera",
  "Wes",
  "Xênia",
  "Yuri",
  "Zélia",
  "Cora",
  "Dora",
  "Elói",
  "Fátima",
  "Noemi",
] as const;
const CALLSIGNS = ["da Névoa", "do Farol", "da Maré", "do Cedro", "da Aurora"] as const;
const TITLE_ADJECTIVES = [
  "A Guarda",
  "O Sussurro",
  "A Centelha",
  "O Vigia",
  "A Flecha",
  "O Coração",
  "A Chave",
  "O Martelo",
  "A Ponte",
  "O Pulso",
  "A Bússola",
  "O Escudo",
  "A Faísca",
  "O Rumor",
  "A Semente",
  "O Sino",
  "A Máscara",
  "O Fio",
  "A Marca",
  "O Horizonte",
] as const;
const TITLE_NOUNS = [
  "das Campanhas",
  "do Limiar",
  "das Sete Rotas",
  "do Sal",
  "da Fronteira",
  "do Crepúsculo",
  "da Travessia",
  "dos Ecos",
  "da Vigília",
  "do Recomeço",
] as const;
const ELEMENT_ROOTS = [
  "água",
  "brasa",
  "vento",
  "pedra",
  "luz",
  "sombra",
  "raiz",
  "metal",
  "vidro",
  "sal",
  "névoa",
  "areia",
  "trovão",
  "musgo",
  "cinza",
  "marfim",
  "coral",
  "âmbar",
  "lua",
  "estrela",
] as const;
const ELEMENT_MODIFIERS = [
  "serena",
  "errante",
  "antiga",
  "viva",
  "oculta",
  "fria",
  "solar",
  "profunda",
  "cintilante",
  "tenaz",
] as const;
const LORE_OPENERS = [
  "Aprendeu a sobreviver",
  "Guarda um mapa",
  "Carrega uma promessa",
  "Escuta os sinais",
  "Protege uma ponte",
  "Recolhe histórias",
  "Conhece o caminho",
  "Segue uma estrela",
  "Cozinha para a tropa",
  "Conserta bússolas",
  "Planta sementes",
  "Conta marés",
  "Lê cicatrizes",
  "Coleciona sinos",
  "Mede tempestades",
  "Cuida de um jardim",
  "Desenha fronteiras",
  "Toca um alaúde",
  "Procura abrigo",
  "Ensina crianças",
] as const;
const LORE_ENDINGS = [
  "onde a Fratura deixou o chão sem nome",
  "na estrada entre dois reinos",
  "sob a última torre do vale",
  "nas docas que resistiram à ressaca",
  "entre ruínas que ainda guardam calor",
  "ao lado de uma fogueira azul",
  "pelos túneis da mina esquecida",
  "no alto de um campanário quebrado",
  "na floresta que muda de trilha",
  "diante de um portão adormecido",
] as const;
const CONTRACT_OPENERS = [
  "Aceita o contrato se houver",
  "Pede apenas",
  "Troca sua lâmina por",
  "Assina em silêncio por",
  "Exige que a companhia respeite",
  "Prefere receber",
  "Chega trazendo",
  "Só parte depois de ouvir",
  "Oferece seu talento em troca de",
  "Marca o pergaminho com",
] as const;
const CONTRACT_ENDINGS = [
  "um caminho seguro",
  "um lugar à mesa",
  "uma noite sem alarmes",
  "um mapa honesto",
  "tempo para respirar",
  "uma dívida encerrada",
  "uma canção nova",
  "uma fogueira acesa",
  "um aliado fiel",
  "a chance de voltar",
] as const;
const WEAPONS = [
  "ironsword",
  "nightsword",
  "bronzesword",
  "coppersword",
  "royalrapier",
  "scimitar",
  "sentinelsword",
  "brutishblade",
  "firestaff",
  "naturestaff",
  "lightningstaff",
  "ancientstaff",
  "aquastaff",
  "cursestaff",
  "sunshinestaff",
  "bluemoonstaff",
  "bowmoon",
  "bowsky",
  "ironaxe",
  "golemsmace",
] as const;
const ROLES: readonly MercRole[] = ["guardiao", "duelista", "mago", "curandeira", "lenda"];
const RARITIES: readonly MercRarity[] = ["comum", "incomum", "raro", "epico", "lendario"];
const ROLE_SKILLS: Record<MercRole, string> = {
  guardiao: "Interposição: reduz o dano que chega ao herói quando está perto",
  duelista: "Passo preciso: a cada terceiro golpe aplica lentidão breve",
  mago: "Rajada arcana: também atinge inimigos próximos",
  curandeira: "Pulso restaurador: cura o herói periodicamente",
  lenda: "Estandarte: aumenta o dano da companhia enquanto está saudável",
};
const designWeapon = (weapon: string) =>
  weapon.includes("staff") ? "staff" : weapon.includes("bow") ? "bow" : weapon.includes("axe") ? "axe" : weapon.includes("spear") ? "spear" : weapon.includes("mace") ? "orb" : "sword";

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

export const EXPANDED_MERCENARIES: MercenaryDef[] = Array.from(
  { length: MERCENARY_EXPANSION_COUNT },
  (_, index) => {
    const role = ROLES[index % ROLES.length]!;
    const roleIndex = ROLES.indexOf(role);
    const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${CALLSIGNS[Math.floor(index / FIRST_NAMES.length)]!}`;
    const title = `${TITLE_ADJECTIVES[index % TITLE_ADJECTIVES.length]} ${TITLE_NOUNS[Math.floor(index / TITLE_ADJECTIVES.length)]!}`;
    const element = `${ELEMENT_ROOTS[index % ELEMENT_ROOTS.length]} ${ELEMENT_MODIFIERS[Math.floor(index / ELEMENT_ROOTS.length)]!}`;
    const id = `fronteira-${String(index + 1).padStart(3, "0")}-${slug(name)}`;
    const minLevel = 1 + ((index * 79 + 13) % 80);
    const weapon = WEAPONS[index % WEAPONS.length]!;

    return {
      id,
      name,
      title,
      rarity: RARITIES[index % RARITIES.length]!,
      role,
      element,
      portrait: "/kaetram/img/sprites/player/base.png",
      sheet: "/kaetram/img/sprites/player/base.png",
      weapon,
      maxHp: 80 + index,
      atk: 9 + ((index * 7 + roleIndex) % 40),
      def: 3 + ((index * 11 + roleIndex * 2) % 28),
      speed: 28 + ((index * 13 + roleIndex) % 64),
      attackRange:
        role === "mago"
          ? 76 + (index % 30)
          : role === "curandeira"
            ? 58 + (index % 24)
            : 24 + (index % 48),
      attackCooldown: Number((0.85 + ((index * 7) % 29) / 20).toFixed(2)),
      recoverySeconds: 34 + (index % 67),
      lore: `${LORE_OPENERS[index % LORE_OPENERS.length]!} ${LORE_ENDINGS[Math.floor(index / LORE_OPENERS.length)]!}; seu diário registra a rota ${String(index + 1).padStart(3, "0")}.`,
      contract: `${CONTRACT_OPENERS[index % CONTRACT_OPENERS.length]!} ${CONTRACT_ENDINGS[Math.floor(index / CONTRACT_OPENERS.length)]!}; o selo ${String(index + 1).padStart(3, "0")} ainda brilha.`,
      skill: `${ROLE_SKILLS[role]}; protocolo de companhia ${String(index + 1).padStart(3, "0")}.`,
      color: `hsl(${(index * 47 + 19) % 360} 72% 62%)`,
      minLevel,
      progressKey: `catalog:fronteira:${String(index + 1).padStart(3, "0")}`,
      design: uniqueDesign(20_000 + index, designWeapon(weapon)),
    };
  },
);
