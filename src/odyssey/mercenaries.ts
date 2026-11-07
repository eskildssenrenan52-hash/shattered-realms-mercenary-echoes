import type { Game, Enemy } from "./engine";
import { K_SHEETS, K_DIR, drawK } from "./kaetram";
import { ITEMS, type Slot } from "./data";
import { EXPANDED_MERCENARIES } from "./mercenary-expansion";
import { drawUniqueCharacter, type UniqueCharacterDesign } from "./unique-character";

export type MercRarity = "comum" | "incomum" | "raro" | "epico" | "lendario";
export type MercRole = "guardiao" | "duelista" | "mago" | "curandeira" | "lenda";
export type MercState = "reserva" | "ativo" | "recuando" | "recuperando";
export type MercenaryFormation = "line" | "wedge" | "close";
export type MercenaryStance = "aggressive" | "balanced" | "defensive";

export interface MercenaryDef {
  id: string;
  name: string;
  title: string;
  rarity: MercRarity;
  role: MercRole;
  element: string;
  portrait: string;
  /** Folha de andar/ataque compartilhada; o renderer aplica filtro ou fallback procedural. */
  sheet: string;
  /** Arma Kaetram desenhada em camada, como no herói. */
  weapon: string;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  attackRange: number;
  attackCooldown: number;
  recoverySeconds: number;
  lore: string;
  contract: string;
  skill: string;
  color: string;
  /** Nível mínimo e marco de progresso para o catálogo. */
  minLevel: number;
  progressKey?: string;
  /** Design completo para os contratos expandidos; ausente nos IDs legados. */
  design?: UniqueCharacterDesign;
}

export interface MercenaryRecord {
  id: string;
  level: number;
  xp: number;
  bond: number;
  hp: number;
  state: MercState;
  recovery: number;
  victories: number;
  attacks: number;
  storyBeat: number;
  cooldown: number;
  x: number;
  y: number;
  equipment?: Partial<Record<Slot, string | null>>;
  talents?: [number, number, number];
  expeditionId?: string | null | undefined;
}

export interface MercenaryState {
  roster: MercenaryRecord[];
  active: [string | null, string | null];
  contractSeals: number;
  pity: number;
  totalRolls: number;
  chapters: string[];
  duoBonds: string[];
  formation: MercenaryFormation;
  stance: MercenaryStance;
  expeditions?: MercenaryExpedition[];
}

export interface MercenaryExpedition {
  id: string;
  mercenaryId: string;
  remaining: number;
  status: "running" | "complete" | "claimed";
  seed: number;
  kind?: string;
}
export const TALENT_PATHS = [
  {
    id: "assalto",
    name: "Assalto",
    desc: "+3% dano por rank",
    cost: (rank: number) => 100 + rank * 75,
  },
  {
    id: "guardia",
    name: "Guarda",
    desc: "+2 defesa efetiva por rank",
    cost: (rank: number) => 100 + rank * 75,
  },
  {
    id: "veterania",
    name: "Veterania",
    desc: "+4% HP máximo por rank",
    cost: (rank: number) => 100 + rank * 75,
  },
] as const;
export const EXPEDITIONS = [
  { id: "patrulha", name: "Patrulha da Fronteira", duration: 90, xp: 35, gold: 45, item: "herb" },
  { id: "ruinas", name: "Ruínas Silentes", duration: 180, xp: 70, gold: 100, item: "iron_ore" },
] as const;
type MercenaryInput = Omit<MercenaryDef, "minLevel"> & { minLevel?: number };
const M = (d: MercenaryInput): MercenaryDef => ({ ...d, minLevel: d.minLevel ?? 1 });

export const MERCENARY_GOLD_COST = 850;
export const MERCENARY_SEAL_COST = 3;
export const MERCENARY_PITY_LIMIT = 18;
export const MERCENARY_FORMATIONS: { id: MercenaryFormation; name: string; desc: string }[] = [
  { id: "line", name: "Linha", desc: "Companheiros abrem espaço lado a lado." },
  {
    id: "wedge",
    name: "Vanguarda",
    desc: "O primeiro fica à frente; o segundo cobre a retaguarda.",
  },
  { id: "close", name: "Laço", desc: "Ambos permanecem próximos do herói." },
];
export const MERCENARY_STANCES: { id: MercenaryStance; name: string; desc: string }[] = [
  {
    id: "aggressive",
    name: "Agressiva",
    desc: "Persegue ameaças próximas até a distância de ataque.",
  },
  { id: "balanced", name: "Equilibrada", desc: "Avança só quando o alvo ameaça a formação." },
  { id: "defensive", name: "Defensiva", desc: "Mantém formação e só ataca quem chega perto." },
];
export const MERCENARIES: MercenaryDef[] = [
  M({
    id: "ferrovia",
    name: "Ferrovia",
    title: "A Muralha que Caminha",
    rarity: "comum",
    role: "guardiao",
    element: "ferro",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "ironsword",
    maxHp: 92,
    atk: 9,
    def: 8,
    speed: 42,
    attackRange: 24,
    attackCooldown: 1.8,
    recoverySeconds: 38,
    lore: "Ferrovia escolta refugiados pelas estradas onde a guerra deixou placas sem nome.",
    contract: "Ela não pede glória: pede que ninguém fique para trás.",
    skill: "Interposição: reduz em 24% o dano que chega ao herói quando está perto.",
    color: "#7fc8c0",
  }),
  M({
    id: "mae-das-brumas",
    name: "Mae das Brumas",
    title: "A Faca que Escuta",
    rarity: "incomum",
    role: "duelista",
    element: "bruma",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "nightsword",
    maxHp: 66,
    atk: 16,
    def: 3,
    speed: 70,
    attackRange: 40,
    attackCooldown: 1.15,
    recoverySeconds: 46,
    lore: "Mae aprendeu a contar passos em cidades onde a memória era uma moeda proibida.",
    contract: "Ela aceita ouro, mas fica por histórias que ainda não terminaram.",
    skill: "Passo Nebuloso: a cada terceiro golpe, aplica lentidão breve no alvo.",
    color: "#a998ff",
  }),
  M({
    id: "irmao-cinzas",
    name: "Irmão Cinzas",
    title: "O Fogo que Lembra",
    rarity: "raro",
    role: "mago",
    element: "brasa",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "firestaff",
    maxHp: 58,
    atk: 23,
    def: 2,
    speed: 35,
    attackRange: 112,
    attackCooldown: 2.2,
    recoverySeconds: 55,
    lore: "Seu mosteiro queimou sem testemunhas. Ele guarda as cinzas para que o nome dos mortos não se dissolva.",
    contract: "Cada contrato é uma fogueira pequena contra o esquecimento.",
    skill: "Carvão Vivo: o impacto atinge inimigos próximos por 45% do dano.",
    color: "#ff9764",
  }),
  M({
    id: "lia-azul",
    name: "Lia Azul",
    title: "Cartógrafa das Marés",
    rarity: "epico",
    role: "curandeira",
    element: "maré",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "aquastaff",
    maxHp: 72,
    atk: 11,
    def: 4,
    speed: 48,
    attackRange: 88,
    attackCooldown: 2.4,
    recoverySeconds: 62,
    lore: "Lia mapeia rotas que só existem quando duas pessoas confiam uma na outra.",
    contract: "Ela entrou na companhia para devolver ao mundo os caminhos que o medo apagou.",
    skill: "Maré de Retorno: cura o herói e aliados próximos a cada 9 segundos.",
    color: "#6ee7ff",
  }),
  M({
    id: "rei-sem-rosto",
    name: "Rei Sem Rosto",
    title: "O Último Juramento",
    rarity: "lendario",
    role: "lenda",
    element: "ouro",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "royalrapier",
    maxHp: 108,
    atk: 28,
    def: 7,
    speed: 58,
    attackRange: 48,
    attackCooldown: 1.35,
    recoverySeconds: 78,
    lore: "Ele removeu a coroa para que o povo pudesse reconhecer o próprio rosto nos salões do reino.",
    contract: "Seu contrato só se completa quando a companhia vence sem abandonar ninguém.",
    skill: "Duelo Real: aumenta o dano do grupo em 12% enquanto estiver saudável.",
    color: "#ffd15c",
  }),
  // Novos contratos (adicionados ao fim para manter a ordem antiga do roster).
  M({
    id: "tico-fagulha",
    name: "Tico Fagulha",
    title: "O Aprendiz de Relâmpagos",
    rarity: "comum",
    role: "mago",
    element: "faísca",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "lightningstaff",
    maxHp: 54,
    atk: 14,
    def: 2,
    speed: 52,
    attackRange: 96,
    attackCooldown: 1.9,
    recoverySeconds: 36,
    lore: "Tico consertava os sinos de Potos até descobrir que um deles guardava um raio preso desde a Fratura.",
    contract: "Ele assina com a mão chamuscada e promete não explodir nada importante.",
    skill: "Curto-Circuito: a faísca salta para inimigos próximos por 45% do dano.",
    color: "#ffd84a",
  }),
  M({
    id: "yara-das-raizes",
    name: "Yara das Raízes",
    title: "A Voz da Mata Antiga",
    rarity: "incomum",
    role: "curandeira",
    element: "seiva",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "naturestaff",
    maxHp: 70,
    atk: 10,
    def: 4,
    speed: 46,
    attackRange: 84,
    attackCooldown: 2.3,
    recoverySeconds: 50,
    lore: "Yara ouviu as raízes chorarem quando a floresta perdeu seus guardiões e seguiu o som até o seu acampamento.",
    contract: "Ela não cobra ouro: pede que cada semente plantada pela companhia seja regada.",
    skill: "Seiva Viva: cura o herói e aliados próximos a cada 9 segundos.",
    color: "#7fe08a",
  }),
  M({
    id: "skadi-garra-de-gelo",
    name: "Skadi Garra-de-Gelo",
    title: "O Escudo do Norte",
    rarity: "raro",
    role: "guardiao",
    element: "gelo",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "icesword",
    maxHp: 118,
    atk: 13,
    def: 10,
    speed: 40,
    attackRange: 26,
    attackCooldown: 1.7,
    recoverySeconds: 58,
    lore: "Skadi segurou sozinha a ponte congelada de Hvel enquanto sua vila fugia. A ponte caiu; ela não.",
    contract: "Ela jura ficar à frente enquanto houver alguém atrás dela.",
    skill: "Muralha Gélida: reduz em 24% o dano que chega ao herói quando está perto.",
    color: "#9fe3ff",
  }),
  M({
    id: "vesper-corvo",
    name: "Vesper Corvo",
    title: "A Flecha da Meia-Noite",
    rarity: "epico",
    role: "duelista",
    element: "sombra",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "bowmoon",
    maxHp: 64,
    atk: 21,
    def: 3,
    speed: 64,
    attackRange: 124,
    attackCooldown: 1.25,
    recoverySeconds: 60,
    lore: "Vesper caça à noite com um corvo que lembra o rosto de todos que ele já salvou — e de quem não conseguiu.",
    contract: "O corvo escolhe os contratos. Desta vez, pousou no seu ombro.",
    skill: "Pena Sombria: a cada terceiro disparo, aplica lentidão breve no alvo.",
    color: "#b9a6d9",
  }),
  M({
    id: "aurora-partida",
    name: "Aurora Partida",
    title: "A Luz que Não Apagou",
    rarity: "lendario",
    role: "lenda",
    element: "luz",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "angelicblade",
    maxHp: 112,
    atk: 30,
    def: 8,
    speed: 56,
    attackRange: 46,
    attackCooldown: 1.3,
    recoverySeconds: 82,
    lore: "A auréola de Aurora rachou no dia em que os Oito Céus se fecharam. Ela ainda brilha, só que por dentro.",
    contract: "Ela luta para que a próxima geração não precise de heróis com auréolas partidas.",
    skill: "Alvorada: aumenta o dano do grupo em 12% enquanto estiver saudável.",
    color: "#ffe9a3",
  }),
  M({
    id: "bruno-bigorna",
    name: "Bruno Bigorna",
    title: "O Ferreiro de Guerra",
    rarity: "comum",
    role: "guardiao",
    element: "forja",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "smithshammer",
    maxHp: 98,
    atk: 10,
    def: 8,
    speed: 40,
    attackRange: 26,
    attackCooldown: 1.9,
    recoverySeconds: 40,
    lore: "Bruno forjou as dobradiças de metade das portas de Potos. Quando a guerra chegou, ele forjou a si mesmo.",
    contract: "Ele cobra em carvão e em boas histórias contadas perto da bigorna.",
    skill: "Couraça Quente: reduz em 24% o dano que chega ao herói quando está perto.",
    color: "#e0a060",
  }),
  M({
    id: "nina-lamina-rubra",
    name: "Nina Lâmina-Rubra",
    title: "A Espadachim Veloz",
    rarity: "incomum",
    role: "duelista",
    element: "rubi",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "cinnabarsword",
    maxHp: 64,
    atk: 17,
    def: 3,
    speed: 74,
    attackRange: 38,
    attackCooldown: 1.05,
    recoverySeconds: 44,
    lore: "Nina venceu cem duelos nas arenas do sul e perdeu só um: o que lhe deu a cicatriz e o lenço vermelho.",
    contract: "Ela procura quem a derrotou. Até lá, sua lâmina é sua.",
    skill: "Corte Carmesim: a cada terceiro golpe, aplica lentidão breve no alvo.",
    color: "#ff5a5a",
  }),
  M({
    id: "pip-cogumelo",
    name: "Pip Cogumelo",
    title: "O Colhedor Sorridente",
    rarity: "comum",
    role: "curandeira",
    element: "esporo",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "naturestaff",
    maxHp: 60,
    atk: 8,
    def: 3,
    speed: 50,
    attackRange: 80,
    attackCooldown: 2.4,
    recoverySeconds: 34,
    lore: "Pip sabe o nome de cada cogumelo da floresta — e qual deles cura, qual faz rir e qual nunca se deve comer.",
    contract: "Paga-se com uma sopa quente no fim do dia.",
    skill: "Chá de Esporos: cura o herói e aliados próximos a cada 9 segundos.",
    color: "#ff7b6b",
  }),
  M({
    id: "zara-das-dunas",
    name: "Zara das Dunas",
    title: "A Tecelã de Areia",
    rarity: "incomum",
    role: "mago",
    element: "areia",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "sunshinestaff",
    maxHp: 58,
    atk: 18,
    def: 2,
    speed: 46,
    attackRange: 104,
    attackCooldown: 2.1,
    recoverySeconds: 48,
    lore: "Zara guiava caravanas por desertos que mudam de forma toda noite. Ela aprendeu a mudar junto.",
    contract: "Cada contrato é uma rota nova no mapa que ela carrega na memória.",
    skill: "Tempestade de Areia: o impacto atinge inimigos próximos por 45% do dano.",
    color: "#e8c27a",
  }),
  M({
    id: "grom-rachapedra",
    name: "Grom Rachapedra",
    title: "O Rochedo Verde",
    rarity: "raro",
    role: "guardiao",
    element: "pedra",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "brutishblade",
    maxHp: 132,
    atk: 14,
    def: 11,
    speed: 38,
    attackRange: 28,
    attackCooldown: 1.8,
    recoverySeconds: 60,
    lore: "Expulso do clã por se recusar a saquear uma vila, Grom passou a defender exatamente vilas como aquela.",
    contract: "Ele assina com o polegar sujo de terra e nunca quebra a palavra.",
    skill: "Escudo de Granito: reduz em 24% o dano que chega ao herói quando está perto.",
    color: "#8fbf6a",
  }),
  M({
    id: "oraculo-ossian",
    name: "Oráculo Ossian",
    title: "O Leitor de Estrelas",
    rarity: "raro",
    role: "mago",
    element: "astro",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "bluemoonstaff",
    maxHp: 56,
    atk: 24,
    def: 2,
    speed: 34,
    attackRange: 118,
    attackCooldown: 2.25,
    recoverySeconds: 56,
    lore: "Ossian viu nas estrelas o dia em que os Oito Céus se fechariam. Ninguém acreditou nele a tempo.",
    contract: "Ele segue o herói porque a constelação dele ainda não terminou de ser desenhada.",
    skill: "Chuva Estelar: o impacto atinge inimigos próximos por 45% do dano.",
    color: "#8aa4ff",
  }),
  M({
    id: "hana-vento-bambu",
    name: "Hana Vento-Bambu",
    title: "O Punho da Brisa",
    rarity: "raro",
    role: "duelista",
    element: "vento",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "scimitar",
    maxHp: 70,
    atk: 19,
    def: 4,
    speed: 78,
    attackRange: 36,
    attackCooldown: 1.0,
    recoverySeconds: 52,
    lore: "Hana treinou num bosque de bambu onde o vento ensinava a se curvar sem quebrar.",
    contract: "Ela luta para provar que leveza também é força.",
    skill: "Folha Cortante: a cada terceiro golpe, aplica lentidão breve no alvo.",
    color: "#5fd39a",
  }),
  M({
    id: "irma-lotus",
    name: "Irmã Lótus",
    title: "A Flor que Cura",
    rarity: "epico",
    role: "curandeira",
    element: "lótus",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "sunshinestaff",
    maxHp: 78,
    atk: 12,
    def: 5,
    speed: 46,
    attackRange: 90,
    attackCooldown: 2.3,
    recoverySeconds: 64,
    lore: "Irmã Lótus cuidou dos feridos da Fratura por sete anos sem dormir uma noite inteira.",
    contract: "Ela não aceita pagamento — só a promessa de que ninguém será deixado para trás.",
    skill: "Pétala Serena: cura o herói e aliados próximos a cada 9 segundos.",
    color: "#ff9ec8",
  }),
  M({
    id: "selene-mare-negra",
    name: "Selene Maré-Negra",
    title: "A Capitã sem Navio",
    rarity: "epico",
    role: "duelista",
    element: "abismo",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "swashbuckler",
    maxHp: 74,
    atk: 22,
    def: 4,
    speed: 66,
    attackRange: 40,
    attackCooldown: 1.15,
    recoverySeconds: 62,
    lore: "Selene afundou o próprio navio para impedir que o Abismo o usasse. A tripulação dela ainda canta nas ondas.",
    contract: "Ela navega com você até encontrar um mar que mereça outro navio.",
    skill: "Ressaca: a cada terceiro golpe, aplica lentidão breve no alvo.",
    color: "#5f86c9",
  }),
  M({
    id: "kael-sangue-de-dragao",
    name: "Kael Sangue-de-Dragão",
    title: "O Último Cavaleiro Dracônico",
    rarity: "lendario",
    role: "lenda",
    element: "dragão",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "dragonscale",
    maxHp: 120,
    atk: 31,
    def: 9,
    speed: 54,
    attackRange: 50,
    attackCooldown: 1.35,
    recoverySeconds: 84,
    lore: "Kael bebeu o sangue do último dragão para salvar a vida dele. Agora os dois dividem o mesmo coração.",
    contract: "Ele luta até que exista outro dragão no céu.",
    skill: "Fúria Dracônica: aumenta o dano do grupo em 12% enquanto estiver saudável.",
    color: "#ff6b4a",
  }),
  M({
    id: "brisa-lanterna",
    name: "Brisa Lanterna",
    title: "A Vigia dos Caminhos",
    rarity: "comum",
    role: "guardiao",
    element: "luz",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "bronzesword",
    maxHp: 88,
    atk: 11,
    def: 7,
    speed: 44,
    attackRange: 28,
    attackCooldown: 1.75,
    recoverySeconds: 42,
    lore: "Brisa acende lanternas nas trilhas depois que as caravanas passam, para que os atrasados encontrem casa.",
    contract: "Seu mapa precisa de uma última luz antes de aceitar uma assinatura.",
    skill: "Farol: intercepta o perigo que se aproxima do herói.",
    color: "#f6d77a",
    minLevel: 6,
    progressKey: "catalog:brisa-lanterna",
  }),
  M({
    id: "dario-ponteiro",
    name: "Dário Ponteiro",
    title: "O Homem dos Segundos",
    rarity: "incomum",
    role: "duelista",
    element: "tempo",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "royalrapier",
    maxHp: 68,
    atk: 18,
    def: 4,
    speed: 72,
    attackRange: 42,
    attackCooldown: 1.08,
    recoverySeconds: 48,
    lore: "Dário conserta relógios quebrados e cobra apenas o minuto em que alguém decidiu não desistir.",
    contract: "Ele chega cedo a toda batalha e tarde a todo arrependimento.",
    skill: "Segundo Corte: o terceiro golpe deixa o alvo lento.",
    color: "#d9b6ff",
    minLevel: 7,
    progressKey: "catalog:dario-ponteiro",
  }),
  M({
    id: "mira-coral",
    name: "Mira Coral",
    title: "A Voz do Recife",
    rarity: "raro",
    role: "mago",
    element: "coral",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "aquastaff",
    maxHp: 62,
    atk: 25,
    def: 3,
    speed: 39,
    attackRange: 116,
    attackCooldown: 2.18,
    recoverySeconds: 58,
    lore: "Mira escuta o coral cantar nomes de navios antes que a maré os devolva à areia.",
    contract: "Ela pede uma história do mar por cada batalha vencida.",
    skill: "Ressonância Coral: o impacto alcança inimigos ao redor.",
    color: "#ff8fb8",
    minLevel: 8,
    progressKey: "catalog:mira-coral",
  }),
  M({
    id: "soren-musgo",
    name: "Soren Musgo",
    title: "O Jardineiro de Ruínas",
    rarity: "incomum",
    role: "curandeira",
    element: "musgo",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "naturestaff",
    maxHp: 76,
    atk: 12,
    def: 5,
    speed: 47,
    attackRange: 86,
    attackCooldown: 2.32,
    recoverySeconds: 54,
    lore: "Soren cultiva jardins em telhados rachados e sabe onde a vida insiste em voltar.",
    contract: "Ele troca ouro por água limpa para suas mudas.",
    skill: "Verde Persistente: regenera o herói em ondas lentas.",
    color: "#72cf91",
    minLevel: 9,
    progressKey: "catalog:soren-musgo",
  }),
  M({
    id: "tala-vidro",
    name: "Tala de Vidro",
    title: "A Arqueira Transparente",
    rarity: "raro",
    role: "duelista",
    element: "cristal",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "bowsky",
    maxHp: 65,
    atk: 23,
    def: 3,
    speed: 68,
    attackRange: 132,
    attackCooldown: 1.34,
    recoverySeconds: 61,
    lore: "Tala fabrica flechas de vidro que só brilham quando encontram um alvo que merece ser visto.",
    contract: "Ela quer uma mira que atravesse a névoa da Fratura.",
    skill: "Estilhaço: cada terceiro disparo retarda o inimigo.",
    color: "#b8f2ee",
    minLevel: 10,
    progressKey: "catalog:tala-vidro",
  }),
  M({
    id: "noa-ferrugem",
    name: "Noa Ferrugem",
    title: "A Engrenagem Errante",
    rarity: "comum",
    role: "guardiao",
    element: "latão",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "smithshammer",
    maxHp: 101,
    atk: 12,
    def: 9,
    speed: 37,
    attackRange: 26,
    attackCooldown: 1.92,
    recoverySeconds: 44,
    lore: "Noa remenda pontes com peças que ninguém mais quer e nunca pergunta de onde veio a ferrugem.",
    contract: "Um abrigo para a companhia vale mais que uma bolsa cheia.",
    skill: "Rebite: recebe menos dano quando está junto do herói.",
    color: "#c88962",
    minLevel: 11,
    progressKey: "catalog:noa-ferrugem",
  }),
  M({
    id: "bela-cometa",
    name: "Bela Cometa",
    title: "A Mensageira do Céu",
    rarity: "epico",
    role: "mago",
    element: "cometa",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "bluemoonstaff",
    maxHp: 60,
    atk: 29,
    def: 2,
    speed: 43,
    attackRange: 124,
    attackCooldown: 2.42,
    recoverySeconds: 68,
    lore: "Bela caiu com um fragmento de cometa no bolso e passou a entregar mensagens entre aldeias isoladas.",
    contract: "Seu próximo destino é sempre o lugar que perdeu a esperança.",
    skill: "Rastro Celeste: uma magia salta para alvos próximos.",
    color: "#88c8ff",
    minLevel: 12,
    progressKey: "catalog:bela-cometa",
  }),
  M({
    id: "kaio-marfim",
    name: "Kaio Marfim",
    title: "O Escudo do Estuário",
    rarity: "raro",
    role: "guardiao",
    element: "marfim",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "sentinelsword",
    maxHp: 126,
    atk: 15,
    def: 12,
    speed: 36,
    attackRange: 30,
    attackCooldown: 1.86,
    recoverySeconds: 66,
    lore: "Kaio aprendeu a erguer escudos com ossos de baleia sem esquecer a criatura que os deixou.",
    contract: "Ele fica na porta até a última pessoa atravessar.",
    skill: "Muralha de Marfim: protege a linha próxima.",
    color: "#f0dfb0",
    minLevel: 13,
    progressKey: "catalog:kaio-marfim",
  }),
  M({
    id: "nix-candeia",
    name: "Nix Candeia",
    title: "A Curandeira do Breu",
    rarity: "epico",
    role: "curandeira",
    element: "breu",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "witchsstaffmoon",
    maxHp: 82,
    atk: 14,
    def: 5,
    speed: 45,
    attackRange: 94,
    attackCooldown: 2.36,
    recoverySeconds: 70,
    lore: "Nix leva uma pequena chama azul para minas onde até as sombras perderam o caminho.",
    contract: "Ela cura melhor quando alguém continua contando uma história.",
    skill: "Candeia Azul: restaura vida do grupo em pulsações.",
    color: "#8797ff",
    minLevel: 14,
    progressKey: "catalog:nix-candeia",
  }),
  M({
    id: "orion-limo",
    name: "Orion Limo",
    title: "O Batedor Verde",
    rarity: "incomum",
    role: "duelista",
    element: "limo",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "coppersword",
    maxHp: 73,
    atk: 19,
    def: 5,
    speed: 76,
    attackRange: 40,
    attackCooldown: 1.02,
    recoverySeconds: 50,
    lore: "Orion conhece cada atalho enlameado porque foi o primeiro a atravessá-lo carregando suprimentos.",
    contract: "Ele pede botas novas e uma direção que não seja para trás.",
    skill: "Passo Escorregadio: o terceiro corte atrasa a reação inimiga.",
    color: "#9dd66d",
    minLevel: 15,
    progressKey: "catalog:orion-limo",
  }),
  M({
    id: "elara-folha",
    name: "Elara Folha",
    title: "A Bibliotecária do Vento",
    rarity: "raro",
    role: "mago",
    element: "folha",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "sunshinestaff",
    maxHp: 57,
    atk: 26,
    def: 3,
    speed: 51,
    attackRange: 108,
    attackCooldown: 2.06,
    recoverySeconds: 59,
    lore: "Elara guarda páginas em folhas prensadas e reconhece um feitiço pelo som que faz ao cair.",
    contract: "Sua biblioteca viaja com a companhia.",
    skill: "Rajada de Páginas: dano espalhado em torno do alvo.",
    color: "#b6e58a",
    minLevel: 16,
    progressKey: "catalog:elara-folha",
  }),
  M({
    id: "ravi-cobre",
    name: "Ravi Cobre",
    title: "O Ferreiro da Chuva",
    rarity: "incomum",
    role: "guardiao",
    element: "cobre",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "ironaxe",
    maxHp: 108,
    atk: 14,
    def: 8,
    speed: 41,
    attackRange: 28,
    attackCooldown: 1.8,
    recoverySeconds: 52,
    lore: "Ravi constrói calhas para que a chuva não lave as inscrições dos mortos.",
    contract: "Ele prefere uma oficina pequena a qualquer trono.",
    skill: "Calha de Ferro: divide parte do impacto recebido.",
    color: "#da9b5d",
    minLevel: 17,
    progressKey: "catalog:ravi-cobre",
  }),
  M({
    id: "safa-neve",
    name: "Safa Neve",
    title: "A Pastora de Geada",
    rarity: "raro",
    role: "curandeira",
    element: "neve",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "icesword",
    maxHp: 79,
    atk: 15,
    def: 6,
    speed: 49,
    attackRange: 82,
    attackCooldown: 2.28,
    recoverySeconds: 63,
    lore: "Safa atravessa nevascas guiando animais de carga pelo som dos sinos presos ao casaco.",
    contract: "Ela só assina quando todos têm um cobertor.",
    skill: "Degelo: cura e limpa o medo do grupo.",
    color: "#c5f1ff",
    minLevel: 18,
    progressKey: "catalog:safa-neve",
  }),
  M({
    id: "milo-eco",
    name: "Milo Eco",
    title: "O Tambor da Caverna",
    rarity: "comum",
    role: "mago",
    element: "eco",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "ancientstaff",
    maxHp: 64,
    atk: 17,
    def: 4,
    speed: 47,
    attackRange: 98,
    attackCooldown: 2.0,
    recoverySeconds: 45,
    lore: "Milo marca o ritmo das expedições nas paredes e sabe quando uma caverna responde com fome.",
    contract: "Ele espera que os monstros aprendam a cantar junto.",
    skill: "Batida Oca: reverbera dano em um segundo inimigo.",
    color: "#e0a6e8",
    minLevel: 19,
    progressKey: "catalog:milo-eco",
  }),
  M({
    id: "iris-carmesim",
    name: "Íris Carmesim",
    title: "A Lâmina da Ponte",
    rarity: "epico",
    role: "duelista",
    element: "sangue",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "cinnabarsword",
    maxHp: 77,
    atk: 27,
    def: 5,
    speed: 70,
    attackRange: 44,
    attackCooldown: 1.16,
    recoverySeconds: 72,
    lore: "Íris defendeu uma ponte carmesim até que os inimigos esqueceram por que queriam atravessá-la.",
    contract: "Ela quer uma batalha que termine em silêncio, não em vingança.",
    skill: "Marca Rubra: o terceiro acerto retarda a presa.",
    color: "#eb5578",
    minLevel: 20,
    progressKey: "catalog:iris-carmesim",
  }),
  M({
    id: "tomas-azeviche",
    name: "Tomás Azeviche",
    title: "O Vigia das Minas",
    rarity: "raro",
    role: "guardiao",
    element: "azeviche",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "brutishblade",
    maxHp: 138,
    atk: 16,
    def: 13,
    speed: 34,
    attackRange: 29,
    attackCooldown: 1.94,
    recoverySeconds: 74,
    lore: "Tomás fecha túneis perigosos com a própria picareta e deixa sinais para que ninguém se perca.",
    contract: "Ele garante a saída antes de perguntar pelo pagamento.",
    skill: "Marco Negro: torna a linha mais resistente.",
    color: "#5e687d",
    minLevel: 21,
    progressKey: "catalog:tomas-azeviche",
  }),
  M({
    id: "luma-vela",
    name: "Luma Vela",
    title: "A Navegadora de Cera",
    rarity: "incomum",
    role: "curandeira",
    element: "cera",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "naturestaff",
    maxHp: 71,
    atk: 13,
    def: 5,
    speed: 53,
    attackRange: 88,
    attackCooldown: 2.34,
    recoverySeconds: 57,
    lore: "Luma desenha mapas em velas; cada chama guarda uma rota que o nevoeiro tentou apagar.",
    contract: "Sua chama acompanha quem ainda não encontrou o porto.",
    skill: "Cera Viva: cura aliados próximos com calor constante.",
    color: "#ffe08c",
    minLevel: 22,
    progressKey: "catalog:luma-vela",
  }),
  M({
    id: "cassia-pedra",
    name: "Cássia Pedra",
    title: "A Escultora de Portões",
    rarity: "raro",
    role: "guardiao",
    element: "granito",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "golemsmace",
    maxHp: 145,
    atk: 17,
    def: 14,
    speed: 31,
    attackRange: 31,
    attackCooldown: 2.02,
    recoverySeconds: 79,
    lore: "Cássia esculpe portões que contam a história de cada pessoa autorizada a passar.",
    contract: "Ela abre a pedra apenas para quem retorna por seus companheiros.",
    skill: "Lintel: reduz a força do próximo golpe próximo.",
    color: "#9a9aab",
    minLevel: 23,
    progressKey: "catalog:cassia-pedra",
  }),
  M({
    id: "ren-espelho",
    name: "Ren Espelho",
    title: "O Duelista de Duas Sombras",
    rarity: "epico",
    role: "duelista",
    element: "reflexo",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "bladeofdarkness",
    maxHp: 69,
    atk: 30,
    def: 4,
    speed: 78,
    attackRange: 46,
    attackCooldown: 1.1,
    recoverySeconds: 76,
    lore: "Ren combate o reflexo que o acompanha desde a Fratura e já não sabe qual dos dois venceu.",
    contract: "Um contrato, duas assinaturas, nenhuma mentira.",
    skill: "Imagem Tardia: cada terceiro golpe desacelera o inimigo.",
    color: "#7d68bd",
    minLevel: 24,
    progressKey: "catalog:ren-espelho",
  }),
  M({
    id: "talia-cinza",
    name: "Tália Cinza",
    title: "A Cinza que Floresce",
    rarity: "raro",
    role: "mago",
    element: "cinza",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "cursestaff",
    maxHp: 61,
    atk: 32,
    def: 3,
    speed: 36,
    attackRange: 120,
    attackCooldown: 2.5,
    recoverySeconds: 81,
    lore: "Tália encontrou flores crescendo nas cinzas de uma aldeia e aprendeu a transformar perda em faísca.",
    contract: "Ela deixa uma semente onde cada feitiço termina.",
    skill: "Cinza Florescente: espalha parte do dano.",
    color: "#b9a8a1",
    minLevel: 25,
    progressKey: "catalog:talia-cinza",
  }),
  M({
    id: "zev-aurora",
    name: "Zev Aurora",
    title: "O Cavaleiro do Primeiro Raio",
    rarity: "lendario",
    role: "lenda",
    element: "aurora",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "angelicblade",
    maxHp: 132,
    atk: 34,
    def: 10,
    speed: 59,
    attackRange: 52,
    attackCooldown: 1.3,
    recoverySeconds: 88,
    lore: "Zev foi o primeiro a ver o amanhecer depois da Noite Longa e guardou um raio dentro da espada.",
    contract: "Ele luta para que todo fim possa ser reconhecido como começo.",
    skill: "Primeiro Raio: fortalece a companhia enquanto estiver saudável.",
    color: "#ffd6a0",
    minLevel: 26,
    progressKey: "catalog:zev-aurora",
  }),
  M({
    id: "uma-sino",
    name: "Uma Sino",
    title: "A Campainha do Norte",
    rarity: "incomum",
    role: "curandeira",
    element: "som",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "witchsstaffsunshine",
    maxHp: 84,
    atk: 16,
    def: 6,
    speed: 42,
    attackRange: 92,
    attackCooldown: 2.4,
    recoverySeconds: 73,
    lore: "Uma carrega um sino que chama viajantes perdidos e silencia feras durante uma respiração.",
    contract: "Sua música pede uma formação que nunca se desfaça.",
    skill: "Toque Claro: cura em pulsos e acalma o combate.",
    color: "#f2f0c0",
    minLevel: 27,
    progressKey: "catalog:uma-sino",
  }),
  M({
    id: "bento-fumaca",
    name: "Bento Fumaça",
    title: "O Ferreiro da Caldeira",
    rarity: "epico",
    role: "guardiao",
    element: "fumaça",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "executionershammer",
    maxHp: 152,
    atk: 20,
    def: 12,
    speed: 29,
    attackRange: 32,
    attackCooldown: 2.1,
    recoverySeconds: 91,
    lore: "Bento forja ferramentas em uma caldeira que nunca esfria, mesmo quando a montanha dorme.",
    contract: "Ele quer proteger a oficina que ainda não construiu.",
    skill: "Golpe de Fuligem: atrasa adversários próximos.",
    color: "#6f7784",
    minLevel: 28,
    progressKey: "catalog:bento-fumaca",
  }),
  M({
    id: "vivi-constelacao",
    name: "Vivi Constelação",
    title: "A Última Cartógrafa",
    rarity: "lendario",
    role: "lenda",
    element: "constelação",
    portrait: "/kaetram/img/sprites/player/base.png",
    sheet: "/kaetram/img/sprites/player/base.png",
    weapon: "oldonesblade",
    maxHp: 118,
    atk: 37,
    def: 9,
    speed: 61,
    attackRange: 56,
    attackCooldown: 1.28,
    recoverySeconds: 96,
    lore: "Vivi desenhou no céu as rotas que ligam todos os reinos e agora procura a estrela que falta.",
    contract: "A companhia é a primeira linha do mapa que ela ainda não terminou.",
    skill: "Mapa Vivo: aumenta o dano da dupla enquanto saudável.",
    color: "#e5a7ff",
    minLevel: 29,
    progressKey: "catalog:vivi-constelacao",
  }),
];
// Append-only: saves refer to these records by string ID, so the legacy prefix stays byte-for-byte ordered.
MERCENARIES.push(...EXPANDED_MERCENARIES);
export const MERC_BY_ID = Object.fromEntries(MERCENARIES.map((m) => [m.id, m]));
/** Cada contrato reutiliza a folha real do herói; a cor determinística evita 44 URLs inventadas. */
export const mercSheetKey = (id: string) => `merc/${id}`;
for (const m of MERCENARIES)
  K_SHEETS[mercSheetKey(m.id)] = {
    ...K_SHEETS["player/base"]!,
    url: "/kaetram/img/sprites/player/base.png",
  };
export const mercenaryFilter = (id: string) => {
  const index = Math.max(
    0,
    MERCENARIES.findIndex((m) => m.id === id),
  );
  return `hue-rotate(${(index * 37) % 360}deg) saturate(${1.05 + (index % 4) * 0.12})`;
};
export const MERC_RARITY: Record<MercRarity, { label: string; color: string; weight: number }> = {
  comum: { label: "Comum", color: "#c6c6c6", weight: 58 },
  incomum: { label: "Incomum", color: "#75d68c", weight: 25 },
  raro: { label: "Raro", color: "#66a7ff", weight: 11 },
  epico: { label: "Épico", color: "#c477ff", weight: 5 },
  lendario: { label: "Lendário", color: "#ffd15c", weight: 1 },
};

export const freshMercenaryState = (): MercenaryState => ({
  roster: [],
  active: [null, null],
  contractSeals: 3,
  pity: 0,
  totalRolls: 0,
  chapters: [],
  duoBonds: [],
  formation: "line",
  stance: "balanced",
  expeditions: [],
});
const seededRecord = (id: string): MercenaryRecord => ({
  id,
  level: 1,
  xp: 0,
  bond: 0,
  hp: MERC_BY_ID[id]!.maxHp,
  state: "reserva",
  recovery: 0,
  victories: 0,
  attacks: 0,
  storyBeat: 0,
  cooldown: 0,
  x: 0,
  y: 0,
  equipment: {},
  talents: [0, 0, 0],
  expeditionId: null,
});
function sanitizeEquipment(raw: unknown): Partial<Record<Slot, string | null>> {
  const out: Partial<Record<Slot, string | null>> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const slot of ["weapon", "armor", "ring", "amulet"] as Slot[]) {
    const id = (raw as Record<string, unknown>)[slot];
    if (typeof id === "string" && ITEMS[id]?.type === slot) out[slot] = id;
  }
  return out;
}
function sanitizeTalents(raw: unknown): [number, number, number] {
  const a = Array.isArray(raw) ? raw : [];
  return [0, 1, 2].map((i) => Math.max(0, Math.min(5, Math.floor(Number(a[i]) || 0)))) as [
    number,
    number,
    number,
  ];
}
export function trainMercenary(g: Game, id: string, path: 0 | 1 | 2): boolean {
  const m = record(g, id);
  if (!m || !Number.isInteger(path) || path < 0 || path > 2) return false;
  m.talents = sanitizeTalents(m.talents);
  const rank = m.talents[path];
  const cost = TALENT_PATHS[path].cost(rank);
  if (rank >= 5 || m.level < rank + 1 || g.p.gold < cost) return false;
  g.p.gold -= cost;
  m.talents[path]++;
  g.save();
  return true;
}
export function equipMercenary(g: Game, id: string, slot: Slot, itemId: string | null): boolean {
  const m = record(g, id);
  if (!m || !["weapon", "armor", "ring", "amulet"].includes(slot)) return false;
  if (itemId && (ITEMS[itemId]?.type !== slot || g.count(itemId) < 1)) return false;
  m.equipment = { ...m.equipment };
  if (itemId) m.equipment[slot] = itemId;
  else delete m.equipment[slot];
  g.save();
  return true;
}
export function startMercenaryExpedition(g: Game, id: string, expeditionId: string): boolean {
  const m = record(g, id),
    def = EXPEDITIONS.find((e) => e.id === expeditionId);
  if (!m || !def || m.state !== "reserva" || m.expeditionId) return false;
  const e: MercenaryExpedition = {
    id: `exp:${id}:${g.clock | 0}:${g.mercenaries.expeditions?.length || 0}`,
    mercenaryId: id,
    remaining: def.duration,
    status: "running",
    seed: (g.clock | 0) + id.length,
    kind: expeditionId,
  };
  g.mercenaries.expeditions = [...(g.mercenaries.expeditions || []), e];
  m.expeditionId = e.id;
  g.save();
  return true;
}
export function resolveMercenaryExpedition(g: Game, expeditionId: string): boolean {
  const e = g.mercenaries.expeditions?.find((x) => x.id === expeditionId);
  if (!e || e.status !== "complete") return false;
  const reward = EXPEDITIONS.find((x) => x.id === e.kind);
  if (!reward) return false;
  if (g.inventory.length >= g.INV_MAX && !g.inventory.some((s) => s.id === reward.item))
    return false;
  if (!g.addItem(reward.item)) return false;
  const m = record(g, e.mercenaryId);
  if (m) {
    m.xp += reward.xp;
    m.expeditionId = null;
  }
  g.p.gold += reward.gold;
  e.status = "claimed";
  g.save();
  return true;
}
const FORMATIONS = new Set<MercenaryFormation>(["line", "wedge", "close"]);
const STANCES = new Set<MercenaryStance>(["aggressive", "balanced", "defensive"]);
export function sanitizeMercenaryState(raw: unknown): MercenaryState {
  const base = freshMercenaryState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<MercenaryState>;
  const seen = new Set<string>();
  const roster = Array.isArray(r.roster)
    ? r.roster
        .filter(
          (x): x is MercenaryRecord =>
            !!x &&
            typeof x === "object" &&
            typeof (x as MercenaryRecord).id === "string" &&
            !!MERC_BY_ID[(x as MercenaryRecord).id] &&
            !seen.has((x as MercenaryRecord).id) &&
            (seen.add((x as MercenaryRecord).id), true),
        )
        .map((x) => {
          const level = Math.max(1, Math.floor(Number(x.level) || 1));
          const def = MERC_BY_ID[x.id]!;
          const state = ["reserva", "ativo", "recuando", "recuperando"].includes(String(x.state))
            ? x.state
            : "reserva";
          return {
            ...seededRecord(x.id),
            ...x,
            level,
            xp: Math.max(0, Number(x.xp) || 0),
            bond: Math.max(0, Math.min(100, Number(x.bond) || 0)),
            hp: Math.max(0, Math.min(def.maxHp + level * 8, Number(x.hp) || 0)),
            state,
            recovery: Math.max(0, Number(x.recovery) || 0),
            cooldown: Number(x.cooldown) || 0,
            x: Number.isFinite(Number(x.x)) ? Number(x.x) : 0,
            y: Number.isFinite(Number(x.y)) ? Number(x.y) : 0,
            equipment: sanitizeEquipment(
              (x as MercenaryRecord & { equipment?: unknown }).equipment,
            ),
            talents: sanitizeTalents((x as MercenaryRecord & { talents?: unknown }).talents),
            expeditionId:
              typeof (x as MercenaryRecord & { expeditionId?: unknown }).expeditionId === "string"
                ? (x as MercenaryRecord).expeditionId
                : null,
          };
        })
    : [];
  const requested: string[] = Array.isArray(r.active)
    ? r.active
        .map((id) => (typeof id === "string" ? id : ""))
        .filter((id, i, a) => !!id && a.indexOf(id) === i)
        .slice(0, 2)
    : [];
  const active: [string | null, string | null] = [
    requested[0] &&
    roster.some((m) => m.id === requested[0] && m.state !== "recuando" && m.state !== "recuperando")
      ? requested[0]
      : null,
    requested[1] &&
    roster.some((m) => m.id === requested[1] && m.state !== "recuando" && m.state !== "recuperando")
      ? requested[1]
      : null,
  ];
  const activeSet = new Set(active.filter((id): id is string => !!id));
  for (const m of roster)
    if (activeSet.has(m.id)) m.state = "ativo";
    else if (m.state === "ativo") m.state = "reserva";
  const formation =
    typeof r.formation === "string" && FORMATIONS.has(r.formation as MercenaryFormation)
      ? (r.formation as MercenaryFormation)
      : base.formation;
  const stance =
    typeof r.stance === "string" && STANCES.has(r.stance as MercenaryStance)
      ? (r.stance as MercenaryStance)
      : base.stance;
  const seals =
    r.contractSeals == null
      ? base.contractSeals
      : Math.max(0, Math.floor(Number(r.contractSeals) || 0));
  return {
    roster,
    active,
    contractSeals: seals,
    pity: Math.max(0, Math.min(MERCENARY_PITY_LIMIT, Math.floor(Number(r.pity) || 0))),
    totalRolls: Math.max(0, Math.floor(Number(r.totalRolls) || 0)),
    chapters: Array.isArray(r.chapters)
      ? r.chapters.filter((x): x is string => typeof x === "string")
      : [],
    duoBonds: Array.isArray(r.duoBonds)
      ? r.duoBonds.filter((x): x is string => typeof x === "string")
      : [],
    formation,
    stance,
    expeditions: Array.isArray((r as MercenaryState).expeditions)
      ? (r as MercenaryState)
          .expeditions!.filter(
            (e) =>
              e &&
              typeof e.id === "string" &&
              roster.some((m) => m.id === e.mercenaryId) &&
              ["running", "complete", "claimed"].includes(e.status),
          )
          .map((e) => ({
            ...e,
            remaining: Math.max(0, Number(e.remaining) || 0),
            seed: Number(e.seed) || 1,
          }))
      : [],
  };
}
const record = (g: Game, id: string) => g.mercenaries.roster.find((m) => m.id === id);
export const activeMercenaries = (g: Game) => {
  const ids = new Set<string>();
  return g.mercenaries.active
    .map((id) => (id ? record(g, id) : undefined))
    .filter(
      (m): m is MercenaryRecord =>
        !!m && m.state === "ativo" && !ids.has(m.id) && (ids.add(m.id), true),
    );
};
const maxHp = (m: MercenaryRecord) =>
  Math.round(
    (MERC_BY_ID[m.id]!.maxHp +
      (m.level - 1) * 8 +
      Object.values(m.equipment || {}).reduce(
        (v, id) => v + (id ? ITEMS[id]?.bonus?.hp || 0 : 0),
        0,
      )) *
      (1 + sanitizeTalents(m.talents)[2] * 0.04),
  );
export const mercGuardMult = (g: Game) =>
  activeMercenaries(g).some(
    (m) => MERC_BY_ID[m.id]!.role === "guardiao" && Math.hypot(m.x - g.p.x, m.y - g.p.y) < 70,
  )
    ? 0.76
    : 1;
export const mercDamageMult = (g: Game) =>
  activeMercenaries(g).some((m) => MERC_BY_ID[m.id]!.role === "lenda" && m.hp > maxHp(m) * 0.5)
    ? 1.12
    : 1;
export function mercenaryUnlocked(g: Game, def: MercenaryDef): boolean {
  const level = Number(g.p?.level ?? 1);
  if (level < def.minLevel) return false;
  if (!def.progressKey) return true;
  const discoveries = g.discoveries;
  const bossesDone = (g as Game & { bossesDone?: Set<string> }).bossesDone;
  return (
    !!discoveries?.has(def.progressKey) ||
    !!bossesDone?.has(def.progressKey) ||
    g.mercenaries.chapters.includes(def.progressKey)
  );
}
export function mercenaryRequirement(def: MercenaryDef): string {
  return `Nv ${def.minLevel}${def.progressKey ? ` · progresso ${def.progressKey.replace("catalog:", "")}` : ""}`;
}
export function recruitMercenary(g: Game, id: string) {
  const def = MERC_BY_ID[id];
  if (!def || record(g, id) || !mercenaryUnlocked(g, def)) return false;
  g.mercenaries.roster.push(seededRecord(id));
  g.mercenaries.chapters.push(`contract:${id}:1`);
  return true;
}
export function rollMercenary(g: Game, currency: "gold" | "seal" = "gold"): MercenaryDef | null {
  const cost = currency === "gold" ? MERCENARY_GOLD_COST : MERCENARY_SEAL_COST;
  if (
    (currency === "gold" && g.p.gold < cost) ||
    (currency === "seal" && g.mercenaries.contractSeals < cost)
  )
    return null;
  const guaranteed = g.mercenaries.pity >= MERCENARY_PITY_LIMIT - 1;
  const pool = MERCENARIES.filter((m) => !record(g, m.id) && mercenaryUnlocked(g, m));
  const eligible = pool.filter(
    (m) => !guaranteed || ["raro", "epico", "lendario"].includes(m.rarity),
  );
  if (!eligible.length) return null; // Never charge a currency when the catalog has no candidate.
  const total = eligible.reduce((n, m) => n + MERC_RARITY[m.rarity].weight, 0);
  let n = Math.random() * total;
  const chosen =
    eligible.find((m) => (n -= MERC_RARITY[m.rarity].weight) <= 0) ?? eligible[eligible.length - 1];
  if (!chosen) return null;
  if (currency === "gold") g.p.gold -= cost;
  else g.mercenaries.contractSeals -= cost;
  g.mercenaries.pity = ["raro", "epico", "lendario"].includes(chosen.rarity)
    ? 0
    : g.mercenaries.pity + 1;
  g.mercenaries.totalRolls++;
  recruitMercenary(g, chosen.id);
  g.toast(
    `${chosen.name} assinou o contrato (${MERC_RARITY[chosen.rarity].label})!`,
    MERC_RARITY[chosen.rarity].color,
  );
  return chosen;
}
function updateDuo(g: Game) {
  const [a, b] = g.mercenaries.active;
  if (a && b) {
    const key = [a, b].sort().join("+");
    if (!g.mercenaries.duoBonds.includes(key)) g.mercenaries.duoBonds.push(key);
  }
}
export function assignMercenary(g: Game, id: string, slot: 0 | 1) {
  const m = record(g, id);
  if (!m || m.state === "recuando" || m.state === "recuperando") return false;
  const old = g.mercenaries.active[slot];
  if (
    old &&
    old !== id &&
    !g.mercenaries.active.some((activeId, i) => i !== slot && activeId === old)
  ) {
    const oldRecord = record(g, old);
    if (oldRecord) oldRecord.state = "reserva";
  }
  const other = slot === 0 ? 1 : 0;
  if (g.mercenaries.active[other] === id) g.mercenaries.active[other] = null;
  g.mercenaries.active[slot] = id;
  m.state = "ativo";
  m.hp = Math.max(1, m.hp);
  const anchor = formationAnchor(g, slot);
  m.x = anchor.x;
  m.y = anchor.y;
  updateDuo(g);
  g.save();
  return true;
}
export function dismissMercenary(g: Game, slot: 0 | 1) {
  const id = g.mercenaries.active[slot];
  if (!id) return false;
  const m = record(g, id);
  if (m && !g.mercenaries.active.some((activeId, i) => i !== slot && activeId === id))
    m.state = "reserva";
  g.mercenaries.active[slot] = null;
  updateDuo(g);
  g.save();
  return true;
}
export function recommendMercenaryDuo(g: Game): boolean {
  const available = g.mercenaries.roster.filter(
    (m) => m.state === "reserva" && !m.expeditionId && m.hp > 0,
  );
  if (available.length < 1) return false;
  const guard = available.find((m) => MERC_BY_ID[m.id]!.role === "guardiao");
  const healer = available.find(
    (m) => MERC_BY_ID[m.id]!.role === "curandeira" && m.id !== guard?.id,
  );
  const first = guard ?? available[0]!;
  const second = healer ?? available.find((m) => m.id !== first.id);
  if (!assignMercenary(g, first.id, 0)) return false;
  if (second) assignMercenary(g, second.id, 1);
  return true;
}
function startRetreat(g: Game, m: MercenaryRecord) {
  m.state = "recuando";
  m.recovery = MERC_BY_ID[m.id]!.recoverySeconds;
  g.mercenaries.active = g.mercenaries.active.map((id) => (id === m.id ? null : id)) as [
    string | null,
    string | null,
  ];
  g.toast(`${MERC_BY_ID[m.id]!.name} recuou para tratar os ferimentos.`, "#ff9a70");
}
function damageMerc(g: Game, m: MercenaryRecord, amount: number) {
  const d = Math.max(
    1,
    Math.round(
      amount -
        (MERC_BY_ID[m.id]!.def +
          Object.values(m.equipment || {}).reduce(
            (v, id) => v + (id ? ITEMS[id]?.def || 0 : 0),
            0,
          ) +
          sanitizeTalents(m.talents)[1] * 2) *
          0.35,
    ),
  );
  m.hp -= d;
  g.float(m.x, m.y - 18, `-${d}`, "#ff9a70");
  if (m.hp <= maxHp(m) * 0.15) {
    m.hp = Math.max(1, m.hp);
    startRetreat(g, m);
  }
}
/** Distância a partir da qual o mercenário reaparece ao lado do herói (portas, viagem rápida, mar). */
export const MERC_SNAP_DISTANCE = 160;
export function formationAnchor(g: Game, slot: number): { x: number; y: number } {
  const side = slot === 0 ? -1 : 1;
  const formation = g.mercenaries.formation;
  if (formation === "wedge")
    return { x: g.p.x + side * (slot === 0 ? 19 : 34), y: g.p.y + (slot === 0 ? 4 : 20) };
  if (formation === "close") return { x: g.p.x + side * 16, y: g.p.y + 8 };
  return { x: g.p.x + side * 27, y: g.p.y + 11 };
}
export function followHero(
  g: Game,
  m: MercenaryRecord,
  slot: number,
  dt: number,
  target?: Enemy | null,
) {
  const anchor = formationAnchor(g, slot);
  let ax = anchor.x,
    ay = anchor.y;
  const def = MERC_BY_ID[m.id]!;
  const stance = g.mercenaries.stance;
  if (target && stance !== "defensive") {
    const tx = target.x - m.x,
      ty = target.y - m.y,
      targetDist = Math.hypot(tx, ty);
    const desired = Math.max(18, def.attackRange * (stance === "aggressive" ? 0.78 : 0.94));
    if (targetDist > desired) {
      ax = target.x - (tx / targetDist) * desired;
      ay = target.y - (ty / targetDist) * desired;
    }
  }
  const dx = ax - m.x,
    dy = ay - m.y,
    dist = Math.hypot(dx, dy);
  if (!Number.isFinite(dist) || dist > MERC_SNAP_DISTANCE) {
    m.x = anchor.x;
    m.y = anchor.y;
    return;
  }
  if (dist < 0.5) return;
  const safeDt = Math.max(0, Math.min(0.25, dt));
  const step = Math.min(dist, Math.max(dist * Math.min(1, safeDt * 7), (def.speed + 90) * safeDt));
  m.x += (dx / dist) * step;
  m.y += (dy / dist) * step;
}
export function tickMercenaries(g: Game, dt: number) {
  for (const e of g.mercenaries.expeditions || [])
    if (e.status === "running") {
      e.remaining = Math.max(0, e.remaining - dt);
      if (e.remaining === 0) e.status = "complete";
    }
  for (const m of g.mercenaries.roster) {
    const def = MERC_BY_ID[m.id]!;
    if (m.state === "recuando" || m.state === "recuperando") {
      m.recovery -= dt;
      m.hp = Math.min(maxHp(m), m.hp + (maxHp(m) / def.recoverySeconds) * dt);
      if (m.hp >= maxHp(m) && m.recovery <= 0) {
        m.hp = maxHp(m);
        m.state = "reserva";
        g.toast(`${def.name} terminou a recuperação e pode voltar.`, "#8ff0b0");
      }
      continue;
    }
    m.cooldown -= dt;
  }
  const active = activeMercenaries(g);
  if (!active.length) return;
  const enemies = g.enemies.filter((e) => e.alive && !e.summoned);
  const targets = enemies.filter(
    (e) =>
      Math.hypot(e.x - g.p.x, e.y - g.p.y) < (g.mercenaries.stance === "aggressive" ? 230 : 175),
  );
  active.forEach((m, slot) => {
    const def = MERC_BY_ID[m.id]!;
    const target = targets
      .slice()
      .sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y))[0];
    followHero(g, m, slot, dt, target);
    if (
      target &&
      m.cooldown <= 0 &&
      Math.hypot(target.x - m.x, target.y - m.y) <= def.attackRange
    ) {
      m.cooldown = def.attackCooldown;
      m.attacks++;
      const gear = Object.values(m.equipment || {})
        .filter((id): id is string => !!id)
        .map((id) => ITEMS[id])
        .filter(Boolean);
      const talent = sanitizeTalents(m.talents);
      const power =
        (def.atk +
          m.level * 2 +
          (m.bond >= 50 ? 4 : 0) +
          gear.reduce((v, it) => v + (it.atk || 0), 0) +
          talent[0] * 2) *
        (1 + talent[0] * 0.03) *
        mercDamageMult(g);
      g.damageEnemy(target, power, 0, 0, def.color, 0.72);
      if (def.role === "mago")
        for (const splash of enemies)
          if (
            splash !== target &&
            splash.alive &&
            Math.hypot(splash.x - target.x, splash.y - target.y) < 38
          )
            g.damageEnemy(splash, power * 0.45, 0, 0, def.color, 0.45);
      if (def.role === "duelista" && m.attacks % 3 === 0) target.slow = Math.max(target.slow, 2.5);
      if (!target.alive || target.hp <= 0) m.victories += 1;
      m.xp += 2;
      if (m.xp >= m.level * 50) {
        m.xp = 0;
        m.level++;
        g.toast(`${def.name} alcançou o nível ${m.level}.`, def.color);
      }
      m.bond = Math.min(100, m.bond + 0.05);
    }
    const danger = enemies.find((e) => e.alive && Math.hypot(e.x - m.x, e.y - m.y) < 22);
    if (danger && Math.random() < dt * 1.7) damageMerc(g, m, danger.atk * 0.42);
    if (
      def.role === "curandeira" &&
      Math.floor(g.clock) % 9 === 0 &&
      Math.floor(g.clock - dt) % 9 !== 0
    )
      g.p.hp = Math.min(g.maxHp(), g.p.hp + Math.round(g.maxHp() * 0.08));
  });
  const tank = active.find((m) => MERC_BY_ID[m.id]!.role === "guardiao");
  if (tank && Math.hypot(tank.x - g.p.x, tank.y - g.p.y) < 70)
    g.p.hp = Math.min(g.maxHp(), g.p.hp + 0.02 * dt);
}
/** Estado só de animação (direção, passo, golpe); nunca entra no save. */
const anim = new Map<
  string,
  {
    dir: number;
    walk: number;
    atk: number;
    lx: number;
    ly: number;
    tx: number;
    ty: number;
    attacks: number;
  }
>();
function drawMercFallback(
  g: Game,
  c: CanvasRenderingContext2D,
  m: MercenaryRecord,
  d: MercenaryDef,
) {
  c.fillStyle = `${d.color}55`;
  c.beginPath();
  c.arc(m.x, m.y - 11, 10, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = d.color;
  c.fillRect(m.x - 5, m.y - 14, 10, 11);
  c.fillStyle = "#f0d3aa";
  c.fillRect(m.x - 4, m.y - 21, 8, 7);
  c.fillStyle = "#1b1830";
  c.fillRect(m.x - 5, m.y - 22, 10, 3);
  c.fillStyle = "#251b2c";
  c.fillRect(m.x - 5, m.y - 3, 4, 5);
  c.fillRect(m.x + 1, m.y - 3, 4, 5);
  void g;
}
export function drawMercenaries(
  g: Game,
  c: CanvasRenderingContext2D,
  draws: { y: number; f: () => void }[],
) {
  for (const id of g.mercenaries.active) {
    const m = id ? record(g, id) : undefined;
    if (!m || m.state !== "ativo") continue;
    const d = MERC_BY_ID[m.id]!;
    let a = anim.get(m.id);
    if (!a) {
      a = { dir: 0, walk: 0, atk: 0, lx: m.x, ly: m.y, tx: m.x, ty: m.y + 10, attacks: m.attacks };
      anim.set(m.id, a);
    }
    const dx = m.x - a.lx,
      dy = m.y - a.ly;
    const moving = Math.hypot(dx, dy) > 0.15;
    a.lx = m.x;
    a.ly = m.y;
    if (m.attacks !== a.attacks) {
      a.attacks = m.attacks;
      a.atk = 1;
      const t = g.enemies
        .filter((e) => e.alive)
        .sort((p, q) => Math.hypot(p.x - m.x, p.y - m.y) - Math.hypot(q.x - m.x, q.y - m.y))[0];
      if (t) {
        a.tx = t.x;
        a.ty = t.y;
      }
    }
    const face = (fx: number, fy: number) =>
      Math.abs(fx) > Math.abs(fy) ? (fx < 0 ? 1 : 2) : fy < 0 ? 3 : 0;
    if (a.atk > 0) a.dir = face(a.tx - m.x, a.ty - m.y);
    else if (moving) a.dir = face(dx, dy);
    if (moving) a.walk += 0.18;
    a.atk = Math.max(0, a.atk - 1 / 22);
    const st = a;
    draws.push({
      y: m.y,
      f: () => {
        g.shadow(c, m.x, m.y, 6, 0.28);
        const dir = K_DIR[st.dir] ?? "down",
          flip = st.dir === 1,
          bow = d.weapon.startsWith("bow");
        const an =
          st.atk > 0 ? `${bow ? "bow_" : ""}atk_${dir}` : moving ? `walk_${dir}` : `idle_${dir}`;
        const frame =
          st.atk > 0 ? Math.min(3, Math.floor((1 - st.atk) * 4)) : moving ? st.walk : g.clock * 2.2;
        const wkey = `player/weapon/${d.weapon}`;
        if (d.design) {
          drawUniqueCharacter(c, d.design, { x: m.x, y: m.y, dir: st.dir, frame, moving, attacking: st.atk > 0, time: g.clock });
        } else {
          c.save();
          c.filter = mercenaryFilter(m.id);
          if (dir === "up") drawK(c, wkey, an, frame, m.x, m.y, flip);
          const rendered = drawK(c, mercSheetKey(m.id), an, frame, m.x, m.y, flip);
          if (dir !== "up") drawK(c, wkey, an, frame, m.x, m.y, flip);
          c.restore();
          if (!rendered) drawMercFallback(g, c, m, d);
        }
        c.fillStyle = "#271b22";
        c.fillRect(m.x - 9, m.y - 27, 18, 2);
        c.fillStyle = d.color;
        c.fillRect(m.x - 9, m.y - 27, 18 * Math.max(0, m.hp / maxHp(m)), 2);
        c.font = "5px monospace";
        c.textAlign = "center";
        c.fillStyle = "#fff3c4";
        c.fillText(d.name, m.x, m.y - 31);
      },
    });
  }
}
export const mercenaryStory = (id: string, chapter: number) => {
  const m = MERC_BY_ID[id];
  if (!m) return "";
  const beats = [
    `${m.name} chega a Potos sem pedir uma apresentação. Deixa o contrato sobre a mesa e observa se você lê as letras miúdas.`,
    m.lore,
    `${m.name} revela por que recua: sobreviver não é covardia, é a única forma de voltar para a próxima batalha.`,
    `${m.name} pergunta qual reino você pretende salvar quando ninguém estiver pagando para isso.`,
    `O contrato de ${m.name} muda de tinta. A companhia deixou de ser um serviço e virou uma promessa difícil de quebrar.`,
  ];
  return beats[Math.min(chapter, beats.length - 1)]!;
};
