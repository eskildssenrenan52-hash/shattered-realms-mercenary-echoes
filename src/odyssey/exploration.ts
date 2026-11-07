import type { Biome } from "./data";
import { BOSSES, NPCS, STATUES } from "./data";
import { TEMPLES, templeDoor } from "./depths";
import { ABYSS_DOOR, ABYSS_ENTRY } from "./dungeon";
import { CITADEL_DOOR, CITADEL_ENTRY } from "./demon-citadel";
import { SIEGE_PORTAL } from "./siege";
import { FRONTIER, FRONTIER_GATES, LEGACY_W, LEGACY_H, frontierBiomeAt } from "./frontier";
import type { World } from "./world";
import { W, H, TS, T, SOLID, hash } from "./world";

export type BuildingPurpose =
  | "house"
  | "ruin"
  | "laboratory"
  | "observatory"
  | "forge"
  | "archive"
  | "inn"
  | "mine"
  | "dungeon";
export type BuildingKind =
  | "home"
  | "inn"
  | "smith"
  | "alchemy"
  | "library"
  | "ruin"
  | "laboratory"
  | "observatory"
  | "mine"
  | "dungeon";

export interface BuildingPalette {
  roof: string;
  wall: string;
  trim: string;
  shadow: string;
  door: string;
  window: string;
  detail: string;
}

export interface BuildingObjective {
  id: string;
  name: string;
  description: string;
  floor: number;
  reward: { gold: number; xp: number; item: string; qty: number };
}

export interface InteriorPlan {
  variant: number;
  objective: { tx: number; ty: number } | null;
  stairUp: { tx: number; ty: number } | null;
  stairDown: { tx: number; ty: number } | null;
}

export interface Building {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BuildingKind;
  resident?: string;
  secret?: boolean;
  accent?: string;
  note: string;
  /** Dados aditivos dos prédios procedurais; os 52 prédios antigos mantêm os campos originais. */
  purpose?: BuildingPurpose;
  description?: string;
  biome?: Biome;
  region?: string;
  floors?: number;
  signature?: string;
  designSignature?: string;
  palette?: BuildingPalette;
  facade?: number;
  objective?: BuildingObjective;
  interiorPlan?: InteriorPlan;
}

const POTOS_BUILDINGS: Building[] = [
  {
    id: "forge",
    name: "Forja de Brunhild",
    x: 109,
    y: 119,
    w: 5,
    h: 4,
    kind: "smith",
    resident: "smith",
    note: "O calor da forja nunca se apaga. Há um compartimento atrás das caixas.",
  },
  {
    id: "lira",
    name: "Ateliê de Lira",
    x: 130,
    y: 119,
    w: 5,
    h: 4,
    kind: "alchemy",
    resident: "alchemist",
    note: "As flores azuis crescem perto de lugares onde a mana ainda é pura.",
  },
  {
    id: "archive",
    name: "Arquivo de Potos",
    x: 116,
    y: 112,
    w: 7,
    h: 5,
    kind: "library",
    resident: "elder",
    note: "“Sob a biblioteca, as raízes guardam o primeiro segredo. Examine a estante do fundo.”",
  },
  {
    id: "inn",
    name: "Pousada do Vagalume",
    x: 109,
    y: 130,
    w: 5,
    h: 4,
    kind: "inn",
    resident: "merchant",
    note: "Uma cama macia e uma refeição quente. Os viajantes contam sobre portais esquecidos.",
  },
  {
    id: "pip",
    name: "Empório do Pip",
    x: 131,
    y: 130,
    w: 5,
    h: 4,
    kind: "home",
    resident: "merchant",
    note: "Pip esconde suas economias entre os vasos. Não conte a ninguém.",
  },
  {
    id: "ranger",
    name: "Cabana das Folhas",
    x: 51,
    y: 108,
    w: 5,
    h: 4,
    kind: "home",
    resident: "ranger",
    note: "Siga os cogumelos luminosos para encontrar o Jardim Esquecido.",
  },
  {
    id: "oasis",
    name: "Refúgio das Areias",
    x: 201,
    y: 120,
    w: 6,
    h: 4,
    kind: "inn",
    resident: "nomad",
    note: "A leste, a areia engoliu um templo. Sua entrada ainda respira luz.",
  },
  {
    id: "monastery",
    name: "Mosteiro da Aurora",
    x: 124,
    y: 34,
    w: 6,
    h: 5,
    kind: "library",
    resident: "hermit",
    note: "O cristal azul aponta para a cripta. Nem tudo que dorme no gelo está morto.",
  },
  {
    id: "bakery",
    name: "Padaria Mel & Trigo",
    x: 107,
    y: 99,
    w: 5,
    h: 4,
    kind: "home",
    note: "Cheiro de pão quente. A padeira jura que o trigo das Campinas do Sol cresce mais doce.",
  },
  {
    id: "weaver",
    name: "Casa do Tecelão",
    x: 114,
    y: 99,
    w: 5,
    h: 4,
    kind: "home",
    note: "Teares cheios de fios coloridos. Um tapete ainda inacabado mostra um mapa do continente.",
  },
  {
    id: "academy",
    name: "Escola de Magia de Potos",
    x: 126,
    y: 99,
    w: 6,
    h: 4,
    kind: "library",
    note: "Monstros têm níveis fixos: cada bioma tem seu perigo, e cada espécie soma sua própria força.",
  },
  {
    id: "watch",
    name: "Torre da Guarda",
    x: 144,
    y: 101,
    w: 5,
    h: 4,
    kind: "home",
    note: "O capitão anota: “Planícies nível 1. Cavernas, nível 18. Obsidiana... só os tolos vão sem nível 30.”",
  },
  {
    id: "tavern",
    name: "Taverna do Javali Dourado",
    x: 92,
    y: 113,
    w: 6,
    h: 4,
    kind: "inn",
    note: "Música, risadas e sopa quente. Aqui todo aventureiro descansa.",
  },
  {
    id: "armory",
    name: "Armaria de Garrick",
    x: 92,
    y: 130,
    w: 6,
    h: 4,
    kind: "smith",
    note: "Espadas penduradas em fileiras. Garrick diz que minério de cristal faz as melhores lâminas.",
  },
  {
    id: "herbalist",
    name: "Herbanário da Vovó Fen",
    x: 94,
    y: 144,
    w: 5,
    h: 4,
    kind: "alchemy",
    note: "Potes de ervas secas até o teto. Um bilhete: “Ervas da geada curam o que o frio feriu.”",
  },
  {
    id: "fishers",
    name: "Casa dos Pescadores",
    x: 107,
    y: 144,
    w: 5,
    h: 4,
    kind: "home",
    note: "Redes, varas e histórias sobre peixes que brilham nos lagos da fronteira.",
  },
  {
    id: "moss",
    name: "Casa da Família Moss",
    x: 114,
    y: 144,
    w: 5,
    h: 4,
    kind: "home",
    note: "Desenhos de crianças nas paredes mostram o herói enfrentando um golem gigante.",
  },
  {
    id: "cathedral",
    name: "Catedral da Árvore de Mana",
    x: 126,
    y: 144,
    w: 8,
    h: 6,
    kind: "library",
    note: "Vitrais contam a história da Árvore de Mana e dos oito espíritos.",
  },
  {
    id: "stable",
    name: "Estábulo do Caravaneiro",
    x: 144,
    y: 113,
    w: 5,
    h: 4,
    kind: "home",
    note: "Caravanas partem daqui para as fronteiras. Feno, selas e mapas rabiscados.",
  },
  {
    id: "garden",
    name: "Jardim Esquecido",
    x: 30,
    y: 151,
    w: 5,
    h: 4,
    kind: "ruin",
    secret: true,
    note: "Entre raízes e estrelas, alguém ainda cuida deste jardim.",
  },
  {
    id: "temple",
    name: "Templo do Sol Afogado",
    x: 258,
    y: 156,
    w: 7,
    h: 5,
    kind: "ruin",
    secret: true,
    note: "O império caiu. A luz permaneceu.",
  },
  {
    id: "crypt",
    name: "Cripta da Aurora",
    x: 72,
    y: 23,
    w: 5,
    h: 4,
    kind: "ruin",
    secret: true,
    note: "Os guardiões gravaram seus nomes em cristais de gelo.",
  },
  {
    id: "roots",
    name: "Santuário das Raízes",
    x: 144,
    y: 190,
    w: 7,
    h: 5,
    kind: "ruin",
    secret: true,
    note: "A Árvore de Mana se estende muito além do que os olhos alcançam.",
  },
  {
    id: "lantern-hall",
    name: "Salão das Lanternas Imóveis",
    x: 187,
    y: 91,
    w: 6,
    h: 5,
    kind: "library",
    resident: "elder",
    note: "Uma lanterninha âmbar se acende quando alguém conta uma lembrança verdadeira.",
  },
  {
    id: "sky-observatory",
    name: "Observatório do Bosque Enraizado",
    x: 240,
    y: 102,
    w: 6,
    h: 5,
    kind: "library",
    resident: "hermit",
    note: "O astrônomo planta relógios no solo para descobrir quando a próxima estação esquecida chegará.",
  },
  {
    id: "salt-inn",
    name: "Pousada da Maré de Sal",
    x: 263,
    y: 132,
    w: 6,
    h: 4,
    kind: "inn",
    resident: "nomad",
    note: "Os viajantes deixam conchas nas janelas; cada uma contém uma nota de uma cidade submersa.",
  },
  {
    id: "comet-forge",
    name: "Forja dos Cometas",
    x: 236,
    y: 184,
    w: 6,
    h: 5,
    kind: "smith",
    resident: "smith",
    note: "O ferreiro usa pedra estelar fria e espera o dia em que o céu volte a nascer.",
  },
];

interface CityBuildingRow {
  suffix: string;
  name: string;
  kind: BuildingKind;
  resident: string;
  note: string;
}
export interface FrontierCity {
  id: string;
  name: string;
  gateId: string;
  biome: string;
  tx: number;
  ty: number;
  lore: string;
  color: string;
}
const CITY_TALES: Array<{
  gate: number;
  name: string;
  lore: string;
  color: string;
  buildings: CityBuildingRow[];
}> = [
  {
    gate: 0,
    name: "Lúmen-Pétala",
    lore: "As pétalas da avenida central mudam de cor com cada lembrança partilhada.",
    color: "#f1a7c4",
    buildings: [
      {
        suffix: "salão_das_pétalas",
        name: "Salão das Pétalas",
        kind: "library",
        resident: "lumen_keeper",
        note: "O arquivo da cidade guarda folhas que caíram antes da fundação. Uma margem fala de um mapa sob as raízes.",
      },
      {
        suffix: "oficina_rosada",
        name: "Oficina Rosada",
        kind: "smith",
        resident: "smith",
        note: "A ferreira grava o nome de cada aprendiz no cabo da primeira ferramenta que ele constrói.",
      },
      {
        suffix: "pousada_borboleta",
        name: "Pousada da Borboleta",
        kind: "inn",
        resident: "merchant",
        note: "Uma viajante deixou bilhetes de três cidades que ainda não aparecem no Atlas.",
      },
    ],
  },
  {
    gate: 2,
    name: "Prisma-Viva",
    lore: "Mercadores trocam cacos de cristal por histórias, nunca por moedas.",
    color: "#8ce1d7",
    buildings: [
      {
        suffix: "casa_dos_veios",
        name: "Casa dos Veios",
        kind: "library",
        resident: "prism_keeper",
        note: "O mestre dos cristais afirma que cada cor responde a um som diferente.",
      },
      {
        suffix: "forja_prismatica",
        name: "Forja Prismática",
        kind: "smith",
        resident: "smith",
        note: "A bigorna tem sete marcas: uma para cada minério que veio do coração da montanha.",
      },
      {
        suffix: "estalagem_espectro",
        name: "Estalagem do Espectro",
        kind: "inn",
        resident: "nomad",
        note: "Mapas de vidro mostram uma passagem segura entre os pilares do labirinto.",
      },
    ],
  },
  {
    gate: 4,
    name: "Porto das Marés Doces",
    lore: "O porto suspende lanternas azuis quando barcos fantasmas voltam para casa.",
    color: "#70bfd8",
    buildings: [
      {
        suffix: "arquivo_mare",
        name: "Arquivo da Maré",
        kind: "library",
        resident: "tide_keeper",
        note: "Os livros são pesados com conchas. Um diário descreve sinos que continuam tocando no fundo do mar.",
      },
      {
        suffix: "estaleiro_concha",
        name: "Estaleiro da Concha",
        kind: "smith",
        resident: "smith",
        note: "A oficina conserta cascos com madeira antiga e resina dos manguezais.",
      },
      {
        suffix: "casa_marulho",
        name: "Casa do Marulho",
        kind: "inn",
        resident: "merchant",
        note: "Uma mesa está reservada para um capitão que ainda não regressou da travessia.",
      },
    ],
  },
  {
    gate: 6,
    name: "Bambu do Zéfiro",
    lore: "Pontes de bambu cantam quando os ventos indicam que uma caravana está próxima.",
    color: "#92c994",
    buildings: [
      {
        suffix: "escola_dos_ventos",
        name: "Escola dos Ventos",
        kind: "library",
        resident: "zephyr_keeper",
        note: "Os aprendizes aprendem primeiro a ouvir o vento, depois a escolher o caminho.",
      },
      {
        suffix: "ateliê_jade",
        name: "Ateliê de Jade",
        kind: "alchemy",
        resident: "alchemist",
        note: "Chás de jade acalmam espíritos que perderam a direção entre as raízes.",
      },
      {
        suffix: "pousada_grou",
        name: "Pousada do Grou",
        kind: "inn",
        resident: "ranger",
        note: "A guardiã das trilhas marca no mapa os lugares onde os bambus crescem ao contrário.",
      },
    ],
  },
  {
    gate: 8,
    name: "Farol de Âmbar",
    lore: "A cidade usa lentes de âmbar para guiar viajantes durante as tempestades de areia.",
    color: "#e6b46d",
    buildings: [
      {
        suffix: "observatorio_ambar",
        name: "Observatório de Âmbar",
        kind: "library",
        resident: "amber_keeper",
        note: "A lente principal revela estradas que só existem ao meio-dia.",
      },
      {
        suffix: "fundição_dourada",
        name: "Fundição Dourada",
        kind: "smith",
        resident: "smith",
        note: "O metal desta região fica mais resistente depois de uma noite sob as estrelas.",
      },
      {
        suffix: "mercado_do_oasis",
        name: "Mercado do Oásis",
        kind: "inn",
        resident: "merchant",
        note: "Os caravaneiros aceitam ervas raras como pagamento por rotas secretas.",
      },
    ],
  },
  {
    gate: 9,
    name: "Raiz de Trovão",
    lore: "A muralha é feita de árvores que atraem relâmpagos e os guardam no tronco.",
    color: "#a6b3c8",
    buildings: [
      {
        suffix: "casa_dos_tambores",
        name: "Casa dos Tambores",
        kind: "library",
        resident: "storm_keeper",
        note: "Cada tambor reproduz um trovão antigo; a sequência certa abre o portão do planalto.",
      },
      {
        suffix: "oficina_raio",
        name: "Oficina do Raio",
        kind: "smith",
        resident: "smith",
        note: "As lâminas são temperadas durante uma tempestade, nunca dentro de uma fornalha.",
      },
      {
        suffix: "estalagem_nuvem",
        name: "Estalagem da Nuvem Baixa",
        kind: "inn",
        resident: "nomad",
        note: "Um mapa dobrado indica as ruínas mais altas da fronteira.",
      },
    ],
  },
  {
    gate: 11,
    name: "Mata dos Esporos",
    lore: "Cogumelos luminosos formam uma rede de recados entre as casas da cidade.",
    color: "#bd9ad6",
    buildings: [
      {
        suffix: "arquivo_micelio",
        name: "Arquivo do Micélio",
        kind: "library",
        resident: "mycelium_keeper",
        note: "As raízes trocam notícias entre si. O arquivo apenas traduz os sussurros.",
      },
      {
        suffix: "botica_fosforescente",
        name: "Botica Fosforescente",
        kind: "alchemy",
        resident: "alchemist",
        note: "Uma gota de orvalho lunar cura feridas, mas revela por um instante o que foi esquecido.",
      },
      {
        suffix: "pousada_cogumelo",
        name: "Pousada do Cogumelo Azul",
        kind: "inn",
        resident: "merchant",
        note: "Os hóspedes desenham em guardanapos os caminhos que tiveram coragem de seguir.",
      },
    ],
  },
  {
    gate: 14,
    name: "Marbleira",
    lore: "Escultores deixam espaços vazios nas estátuas para que a cidade possa mudar de ideia.",
    color: "#d8d4bd",
    buildings: [
      {
        suffix: "museu_marmore",
        name: "Museu do Mármore",
        kind: "library",
        resident: "marble_keeper",
        note: "Uma sala vazia celebra todas as pessoas que ajudaram sem deixar o nome.",
      },
      {
        suffix: "atelier_escultores",
        name: "Ateliê dos Escultores",
        kind: "smith",
        resident: "smith",
        note: "O escultor diz que o mármore tem memória e só precisa de tempo para falar.",
      },
      {
        suffix: "hospedaria_quieta",
        name: "Hospedaria da Praça",
        kind: "inn",
        resident: "ranger",
        note: "Os bancos da praça apontam para os portões mais antigos do continente.",
      },
    ],
  },
];

export const FRONTIER_CITIES: FrontierCity[] = CITY_TALES.map((city) => {
  const gate = FRONTIER_GATES[city.gate]!;
  return {
    id: `city_${gate.biome}`,
    name: city.name,
    gateId: gate.id,
    biome: gate.biome,
    tx: gate.tx,
    ty: gate.ty,
    lore: city.lore,
    color: city.color,
  };
});
const CITY_BUILDINGS: Building[] = CITY_TALES.flatMap((city, i) => {
  const district = FRONTIER_CITIES[i]!;
  const points = [
    [-18, -17],
    [7, -17],
    [-5, 10],
  ] as const;
  return city.buildings.map((entry, j) => {
    const [dx, dy] = points[j]!;
    return {
      id: `${district.id}_${entry.suffix}`,
      name: `${entry.name} de ${district.name}`,
      x: district.tx + dx,
      y: district.ty + dy,
      w: j === 2 ? 8 : 6,
      h: 5,
      kind: entry.kind,
      resident: entry.resident,
      accent: district.color,
      note: entry.note,
    };
  });
});

const PURPOSE_FOR_KIND: Record<BuildingKind, BuildingPurpose> = {
  home: "house",
  inn: "inn",
  smith: "forge",
  alchemy: "laboratory",
  library: "archive",
  ruin: "ruin",
  laboratory: "laboratory",
  observatory: "observatory",
  mine: "mine",
  dungeon: "dungeon",
};
const LEGACY_PALETTES: BuildingPalette[] = [
  {
    roof: "#943e48",
    wall: "#e2d7b4",
    trim: "#e5a380",
    shadow: "#23392b",
    door: "#76523b",
    window: "#7db9ba",
    detail: "#397a4b",
  },
  {
    roof: "#526c83",
    wall: "#d9d0b8",
    trim: "#b7d9d3",
    shadow: "#22343d",
    door: "#5b4038",
    window: "#b2e0d5",
    detail: "#6a9e72",
  },
  {
    roof: "#687e69",
    wall: "#e5d7b9",
    trim: "#d8bc76",
    shadow: "#293a31",
    door: "#60452f",
    window: "#a2d4c0",
    detail: "#70994d",
  },
];
const purposeNames: Record<BuildingPurpose, string[]> = {
  house: ["Casa", "Cabana", "Solar"],
  ruin: ["Ruína", "Vestígio", "Santuário Partido"],
  laboratory: ["Laboratório", "Oficina de Elixires", "Alambique"],
  observatory: ["Observatório", "Torre Celeste", "Cúpula"],
  forge: ["Forja", "Fundição", "Bigorna"],
  archive: ["Arquivo", "Biblioteca", "Cartório"],
  inn: ["Pousada", "Estalagem", "Abrigo"],
  mine: ["Mina", "Poço de Veios", "Galeria"],
  dungeon: ["Calabouço", "Masmorra", "Cofre Profundo"],
};
const objectiveNames: Record<BuildingPurpose, string[]> = {
  house: [
    "reunir as chaves da família",
    "acender a lareira antiga",
    "mapear os quartos esquecidos",
  ],
  ruin: ["recompor o selo partido", "ler a pedra fundadora", "acalmar o eco dos mortos"],
  laboratory: ["estabilizar o reator de mana", "catalogar as amostras", "selar o frasco instável"],
  observatory: [
    "alinhar a lente errante",
    "anotar a constelação perdida",
    "sincronizar o astrolábio",
  ],
  forge: ["temperar a peça celeste", "reacender o braseiro", "recuperar o molde mestre"],
  archive: ["decifrar o índice desaparecido", "preservar a página viva", "ordenar os registros"],
  inn: [
    "deixar uma mensagem ao viajante",
    "reacender a placa da estrada",
    "encontrar o quarto sem nome",
  ],
  mine: ["marcar o veio seguro", "resgatar a lâmpada do mineiro", "selar a fratura mineral"],
  dungeon: [
    "quebrar o lacre da masmorra",
    "recuperar o estandarte antigo",
    "derrotar o eco guardião",
  ],
};
const rewardItems = [
  "ether",
  "hi_potion",
  "mana_shard",
  "crystal_ore",
  "elixir",
  "iron_ore",
  "frost_herb",
  "desert_rose",
] as const;

function paletteForLegacy(b: Building, index: number): BuildingPalette {
  const base = LEGACY_PALETTES[index % LEGACY_PALETTES.length]!;
  return b.accent ? { ...base, roof: b.accent, trim: b.accent } : base;
}
function objectiveForLegacy(b: Building): BuildingObjective {
  return {
    id: `legacy:${b.id}:objective`,
    name: `Examinar ${b.name}`,
    description: b.note,
    floor: 1,
    reward: { gold: 35, xp: 24, item: b.secret ? "elixir" : "ether", qty: 1 },
  };
}
function decorateLegacy(b: Building, index: number): Building {
  const signature = `legacy|${b.id}|${b.x},${b.y}|${b.w}x${b.h}|${b.kind}`;
  return {
    ...b,
    purpose: PURPOSE_FOR_KIND[b.kind],
    description: b.note,
    biome: b.accent
      ? ((FRONTIER_CITIES.find((city) => city.color === b.accent)?.biome as Biome | undefined) ??
        "plains")
      : "plains",
    region: b.accent ? "frontier-city" : "potos-legacy",
    floors: 1,
    signature,
    designSignature: signature,
    palette: paletteForLegacy(b, index),
    facade: index % 3,
    objective: objectiveForLegacy(b),
  };
}

const LEGACY_BUILDINGS = [...POTOS_BUILDINGS, ...CITY_BUILDINGS].map(decorateLegacy);
export const doorOf = (b: Building) => ({ tx: b.x + Math.floor(b.w / 2), ty: b.y + b.h - 1 });
export interface Treasure {
  id: string;
  tx: number;
  ty: number;
  gold: number;
  item: string;
  qty: number;
  name: string;
}
export const TREASURES: Treasure[] = [
  {
    id: "village-well",
    tx: 127,
    ty: 136,
    gold: 25,
    item: "potion",
    qty: 2,
    name: "O presente do viajante",
  },
  ...Array.from({ length: 35 }, (_, i) => ({
    id: `wild-${i}`,
    tx: 15 + Math.floor(hash(i, 7, 81) * (LEGACY_W - 35)),
    ty: 12 + Math.floor(hash(i, 3, 42) * (LEGACY_H - 30)),
    gold: 35 + i * 7,
    item: ["ether", "hi_potion", "mana_shard", "crystal_ore", "elixir"][i % 5]!,
    qty: (i % 3) + 1,
    name: [
      "Cache dos peregrinos",
      "Herança dos antigos",
      "Relíquia entre raízes",
      "Tesouro da lua",
      "O segredo do explorador",
    ][i % 5]!,
  })),
  ...FRONTIER_GATES.map((g, i) => ({
    id: `cache-${g.id}`,
    tx: g.tx + 6,
    ty: g.ty + 5,
    gold: 75 + i * 15,
    item: "mana_shard",
    qty: 3,
    name: `Relíquia: ${g.name}`,
  })),
];

interface Point {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
const protectedPoints: Point[] = [
  ...FRONTIER_GATES.map((gate) => ({ x: gate.tx, y: gate.ty })),
  ...TEMPLES.flatMap((temple) => {
    const d = templeDoor(temple);
    return [
      { x: temple.tx, y: temple.ty },
      { x: d.tx, y: d.ty },
    ];
  }),
  ...BOSSES.map((boss) => ({ x: boss.tx, y: boss.ty })),
  ...STATUES.map((statue) => ({ x: statue.tx, y: statue.ty })),
  ...NPCS.map((npc) => ({ x: npc.tx, y: npc.ty })),
  ...TREASURES.map((treasure) => ({ x: treasure.tx, y: treasure.ty })),
  { x: ABYSS_ENTRY.x + 3, y: ABYSS_ENTRY.y + 2 },
  { x: ABYSS_DOOR.tx, y: ABYSS_DOOR.ty },
  { x: SIEGE_PORTAL.tx, y: SIEGE_PORTAL.ty },
  { x: CITADEL_DOOR.tx, y: CITADEL_DOOR.ty },
  { x: CITADEL_ENTRY.tx, y: CITADEL_ENTRY.ty },
  { x: 127, y: 139 }, // portal principal das Terras Distantes, em coordenada legada estável
];
function overlaps(a: Rect, b: Rect, margin = 0) {
  return (
    a.x - margin < b.x + b.w &&
    a.x + a.w + margin > b.x &&
    a.y - margin < b.y + b.h &&
    a.y + a.h + margin > b.y
  );
}
function protectedRect(rect: Rect) {
  if (rect.x < 2 || rect.y < 2 || rect.x + rect.w + 4 >= W || rect.y + rect.h + 5 >= H) return true;
  if (rect.x < LEGACY_W && rect.y < LEGACY_H) return true;
  if (
    protectedPoints.some(
      (point) =>
        point.x >= rect.x - 4 &&
        point.x <= rect.x + rect.w + 4 &&
        point.y >= rect.y - 4 &&
        point.y <= rect.y + rect.h + 5,
    )
  )
    return true;
  return false;
}
function interiorSeed(b: Building) {
  return Math.floor(hash(b.x * 17 + b.w, b.y * 31 + b.h, b.facade ?? 0) * 0x7fffffff);
}
function generatedPalette(biome: Biome, index: number, facade: number): BuildingPalette {
  const base = FRONTIER[biome as keyof typeof FRONTIER]?.base ?? "#7d8b83";
  const accents = ["#e7b36b", "#a9d8cb", "#d28fb0", "#a6b5e3", "#d8d09a", "#c58be0"];
  const roofs = ["#4f536e", "#72546c", "#4d786b", "#825c45", "#536c83", "#786b4c"];
  const wall = ["#dfd0ae", "#d4dfc2", "#d8c5df", "#d1d7dc"][facade % 4]!;
  return {
    roof: roofs[(index + facade) % roofs.length]!,
    wall,
    trim: base,
    shadow: "#1b2932",
    door: "#4b3640",
    window: accents[(index * 3 + facade) % accents.length]!,
    detail: accents[(index + facade * 2) % accents.length]!,
  };
}
function generatedBuilding(
  index: number,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
): Building {
  const purpose = (Object.keys(purposeNames) as BuildingPurpose[])[
    Math.floor(hash(index, seed, 17) * 9)
  ]!;
  const biome = frontierBiomeAt(x, y) as Biome;
  const facade = Math.floor(hash(index, seed, 23) * 6);
  const floors = 1 + Math.floor(hash(index, seed, 31) * 12);
  const biomeName = FRONTIER[biome as keyof typeof FRONTIER]?.name ?? biome;
  const ordinal = String(index + 1).padStart(4, "0");
  const id = `frontier-building-${ordinal}`;
  const variantName =
    purposeNames[purpose]![Math.floor(hash(index, seed, 41) * purposeNames[purpose]!.length)]!;
  const objectiveAction =
    objectiveNames[purpose]![Math.floor(hash(index, seed, 43) * objectiveNames[purpose]!.length)]!;
  const signature = [id, biome, purpose, floors, w, h, facade, seed, x, y].join("|");
  const objectiveFloor = 1 + Math.floor(hash(index, seed, 47) * floors);
  const item = rewardItems[Math.floor(hash(index, seed, 53) * rewardItems.length)]!;
  const objective: BuildingObjective = {
    id: `building:${id}:objective`,
    name: `Objetivo ${ordinal}: ${objectiveAction}`,
    description: `${biomeName} · ${variantName.toLowerCase()} ${ordinal}: ${objectiveAction} em ${floors} andar${floors === 1 ? "" : "es"} e leve a descoberta ao próximo marco.`,
    floor: objectiveFloor,
    reward: {
      gold: 40 + (index % 9) * 12 + floors * 3,
      xp: 40 + floors * 14,
      item,
      qty: 1 + (index % 2),
    },
  };
  return {
    id,
    name: `${variantName} ${biomeName} · ${ordinal}`,
    x,
    y,
    w,
    h,
    kind:
      purpose === "house"
        ? "home"
        : purpose === "forge"
          ? "smith"
          : purpose === "laboratory"
            ? "alchemy"
            : purpose === "archive" || purpose === "observatory"
              ? "library"
              : purpose === "inn"
                ? "inn"
                : purpose,
    note: objective.description,
    purpose,
    description: `${variantName} de ${biomeName}, um marco acessível das Terras de Fronteira.`,
    biome,
    region: `frontier:${Math.floor(x / LEGACY_W)},${Math.floor(y / LEGACY_H)}`,
    floors,
    signature,
    designSignature: signature,
    palette: generatedPalette(biome, index, facade),
    facade,
    objective,
  };
}

/** Geração pura de marcos acessíveis. Não lê nem altera o World; prepareExploration faz a pintura. */
export function generateFrontierBuildings(seed = 0): Building[] {
  const generated: Building[] = [];
  const occupied: Rect[] = LEGACY_BUILDINGS.map((building) => ({
    x: building.x,
    y: building.y,
    w: building.w,
    h: building.h + 4,
  }));
  const targetPerSector = 11;
  const sectorsX = Math.ceil(W / LEGACY_W),
    sectorsY = Math.ceil(H / LEGACY_H);
  for (let sy = 0; sy < sectorsY; sy++)
    for (let sx = 0; sx < sectorsX; sx++) {
      if (sx === 0 && sy === 0) continue;
      const slots = Array.from({ length: 8 * 7 }, (_, slot) => slot).sort(
        (a, b) => hash(a, sx + seed, sy + 101) - hash(b, sx + seed, sy + 101),
      );
      let made = 0;
      for (const slot of slots) {
        if (made >= targetPerSector) break;
        const col = slot % 8,
          row = Math.floor(slot / 8);
        const x = sx * LEGACY_W + 8 + col * 38 + Math.floor(hash(slot, sx + seed, sy + 7) * 4);
        const y = sy * LEGACY_H + 8 + row * 31 + Math.floor(hash(slot, sy + seed, sx + 13) * 4);
        const w = 5 + Math.floor(hash(slot, sx + 19, sy + seed) * 4);
        const h = 4 + Math.floor(hash(slot, sy + 23, sx + seed) * 4);
        const rect = { x, y, w, h: h + 4 };
        if (protectedRect(rect) || occupied.some((other) => overlaps(rect, other, 3))) continue;
        generated.push(generatedBuilding(generated.length, x, y, w, h, seed));
        occupied.push(rect);
        made++;
      }
    }
  // A segunda malha só é usada se um bioma muito ocupado rejeitar slots da primeira.
  if (generated.length < 1000) {
    for (let sy = 0; sy < sectorsY && generated.length < 1008; sy++)
      for (let sx = 0; sx < sectorsX && generated.length < 1008; sx++) {
        if (sx === 0 && sy === 0) continue;
        for (let row = 0; row < 12 && generated.length < 1008; row++)
          for (let col = 0; col < 14 && generated.length < 1008; col++) {
            const x =
              sx * LEGACY_W + 5 + col * 23 + Math.floor(hash(col, row + seed, sx + sy * 13) * 3);
            const y =
              sy * LEGACY_H + 5 + row * 19 + Math.floor(hash(row, col + seed, sy + sx * 17) * 3);
            const w = 5 + Math.floor(hash(col, sx + seed, row + 37) * 3),
              h = 4 + Math.floor(hash(row, sy + seed, col + 41) * 3);
            const rect = { x, y, w, h: h + 4 };
            if (protectedRect(rect) || occupied.some((other) => overlaps(rect, other, 3))) continue;
            generated.push(generatedBuilding(generated.length, x, y, w, h, seed));
            occupied.push(rect);
          }
      }
  }
  return generated;
}

const PROCEDURAL_BUILDINGS = generateFrontierBuildings(0);
export const BUILDINGS: Building[] = [...LEGACY_BUILDINGS, ...PROCEDURAL_BUILDINGS];

export function frontierCityAt(tx: number, ty: number) {
  let nearest: FrontierCity | undefined;
  let distance = Infinity;
  for (const city of FRONTIER_CITIES) {
    const d = Math.hypot(tx - city.tx, ty - city.ty);
    if (d < distance) {
      nearest = city;
      distance = d;
    }
  }
  return distance <= 38 ? nearest : undefined;
}

export function buildingFloors(b: Building) {
  return Math.max(1, Math.min(12, Math.floor(b.floors ?? 1)));
}
export function buildingSignature(b: Building) {
  return b.designSignature ?? b.signature ?? `legacy|${b.id}|${b.x},${b.y}|${b.w}x${b.h}`;
}
export function interiorPlanOf(b: Building, floor = 1): InteriorPlan {
  const total = buildingFloors(b),
    current = Math.max(1, Math.min(total, Math.floor(floor)));
  const seed = interiorSeed(b),
    variant = Math.abs(seed + current * 17) % 6;
  const objective =
    b.objective && b.objective.floor === current
      ? { tx: 114 + (variant % 3) * 5, ty: 99 + Math.floor(variant / 3) * 4 }
      : null;
  const stairUp = current < total ? { tx: 128 - (variant % 2) * 3, ty: 106 } : null;
  const stairDown = current > 1 ? { tx: 111 + (variant % 2) * 3, ty: 106 } : null;
  return { variant, objective, stairUp, stairDown };
}
export const buildingEnteredKey = (id: string) => `building:${id}:entered`;
export const buildingFloorKey = (id: string, floor: number) =>
  `building:${id}:floor:${Math.max(1, Math.floor(floor))}`;
export const buildingObjectiveKey = (id: string) => `building:${id}:objective:done`;
export const buildingObjectiveDone = (discoveries: ReadonlySet<string>, id: string) =>
  discoveries.has(buildingObjectiveKey(id));
export function recordBuildingFloor(discoveries: Set<string>, id: string, floor: number) {
  discoveries.add(buildingFloorKey(id, floor));
  return discoveries;
}

export const ROOM = {
  left: 106,
  top: 94,
  width: 27,
  height: 17,
  spawnX: 119 * TS + 8,
  spawnY: 108 * TS + 8,
  exitX: 119,
  exitY: 110,
};
function roomWorld(reuse?: World): World {
  if (reuse) {
    reuse.tiles.fill(T.CWALL);
    reuse.biomes.fill(0);
    reuse.nodes.length = 0;
    return reuse;
  }
  return { tiles: new Uint8Array(W * H).fill(T.CWALL), biomes: new Uint8Array(W * H), nodes: [] };
}
/** Constrói um único interior virtual no buffer recebido; nenhum interior é pré-gerado para os 1000 prédios. */
export function createInterior(b: Building, floor = 1, reuse?: World): World {
  const world = roomWorld(reuse),
    plan = interiorPlanOf(b, floor);
  const inner =
    b.purpose === "ruin" || b.purpose === "mine" || b.purpose === "dungeon" || b.kind === "ruin"
      ? T.CAVE
      : T.FLOOR;
  const biome =
    b.kind === "ruin"
      ? 3
      : b.biome
        ? Math.max(0, Math.min(255, Math.floor(hash(b.x, b.y, 91) * 8)))
        : 0;
  world.biomes.fill(biome);
  for (let y = ROOM.top; y <= ROOM.exitY; y++)
    for (let x = ROOM.left; x < ROOM.left + ROOM.width; x++)
      world.tiles[y * W + x] = y < ROOM.top + 2 ? T.PANEL : inner;
  for (let x = ROOM.left; x < ROOM.left + ROOM.width; x++)
    world.tiles[ROOM.exitY * W + x] = x === ROOM.exitX ? T.DOOR : T.PANEL;
  for (let y = ROOM.top + 2; y < ROOM.exitY; y++) {
    world.tiles[y * W + ROOM.left] = T.PANEL;
    world.tiles[y * W + ROOM.left + ROOM.width - 1] = T.PANEL;
  }
  const furniture =
    plan.variant % 2 === 0
      ? [
          [108, 96, 4, 2],
          [126, 96, 4, 2],
          [114, 101, 4, 2],
          [126, 103, 3, 3],
        ]
      : [
          [108, 97, 3, 2],
          [128, 97, 3, 2],
          [113, 102, 3, 2],
          [124, 103, 4, 2],
        ];
  for (const [x, y, w, h] of furniture)
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) {
        const tx = x + dx,
          ty = y + dy;
        if (
          (plan.stairUp && tx === plan.stairUp.tx && ty === plan.stairUp.ty) ||
          (plan.stairDown && tx === plan.stairDown.tx && ty === plan.stairDown.ty) ||
          (plan.objective && tx === plan.objective.tx && ty === plan.objective.ty)
        )
          continue;
        world.tiles[ty * W + tx] = T.FURNITURE;
      }
  for (const stair of [plan.stairUp, plan.stairDown])
    if (stair) world.tiles[stair.ty * W + stair.tx] = T.FLOOR;
  if (plan.objective) world.tiles[plan.objective.ty * W + plan.objective.tx] = T.FLOOR;
  world.tiles[ROOM.exitY * W + ROOM.exitX] = T.DOOR;
  return world;
}

export function prepareExploration(world: World) {
  for (const b of BUILDINGS) {
    for (let y = b.y - 2; y <= b.y + b.h + 2; y++)
      for (let x = b.x - 2; x <= b.x + b.w + 2; x++)
        if (x >= 0 && y >= 0 && x < W && y < H) world.tiles[y * W + x] = T.GRASS;
    for (let y = 0; y < b.h; y++)
      for (let x = 0; x < b.w; x++)
        world.tiles[(b.y + y) * W + b.x + x] = y < b.h - 2 ? T.ROOF : T.WALL;
    const d = doorOf(b);
    world.tiles[d.ty * W + d.tx] = T.DOOR;
    for (let y = d.ty + 1; y < d.ty + 4 && y < H; y++) world.tiles[y * W + d.tx] = T.PATH;
  }
  for (const t of TREASURES)
    for (let y = -1; y <= 1; y++)
      for (let x = -1; x <= 1; x++) {
        const tx = t.tx + x,
          ty = t.ty + y;
        if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
        const i = ty * W + tx;
        if (SOLID.has(world.tiles[i]!))
          world.tiles[i] =
            world.biomes[i] === 3
              ? T.CAVE
              : world.biomes[i] === 4
                ? T.SNOW
                : world.biomes[i] === 2
                  ? T.SAND
                  : T.GRASS;
      }
}
export function canClaimTreasure(opened: ReadonlySet<string>, id: string) {
  return !opened.has(id);
}

const BUCKET = 32;
const buildingBuckets = new Map<string, Building[]>();
for (const building of BUILDINGS) {
  const bx = Math.floor(building.x / BUCKET),
    by = Math.floor(building.y / BUCKET),
    key = `${bx},${by}`;
  const bucket = buildingBuckets.get(key);
  if (bucket) bucket.push(building);
  else buildingBuckets.set(key, [building]);
}
/** Consulta indexada por setor para o renderizador não visitar fachadas fora da viewport. */
export function buildingsInBounds(x0: number, y0: number, x1: number, y1: number): Building[] {
  if (![x0, y0, x1, y1].every(Number.isFinite)) return BUILDINGS;
  const out: Building[] = [],
    seen = new Set<string>();
  const minX = Math.floor((x0 - 6) / BUCKET),
    maxX = Math.floor((x1 + 6) / BUCKET),
    minY = Math.floor((y0 - 6) / BUCKET),
    maxY = Math.floor((y1 + 6) / BUCKET);
  for (let by = minY; by <= maxY; by++)
    for (let bx = minX; bx <= maxX; bx++)
      for (const building of buildingBuckets.get(`${bx},${by}`) ?? []) {
        if (
          seen.has(building.id) ||
          building.x + building.w < x0 - 6 ||
          building.x > x1 + 6 ||
          building.y + building.h < y0 - 6 ||
          building.y > y1 + 6
        )
          continue;
        seen.add(building.id);
        out.push(building);
      }
  return out;
}
