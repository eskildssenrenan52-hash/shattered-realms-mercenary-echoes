import type { BossDef, EnemyKind } from "./data";
import { generateFloor, type DungeonFloor, type Theme } from "./dungeon";
import { T } from "./world";

export const NEMESIS_STAGE_COUNT = 12;

const FORMS: ReadonlyArray<{
  name: string;
  kind: EnemyKind;
  color: string;
  lore: string;
}> = [
  {
    name: "Rastreador da Cinza",
    kind: "wraith",
    color: "#aaa6bd",
    lore: "O primeiro eco aprendeu a seguir pegadas.",
  },
  {
    name: "Espelho de Lâminas",
    kind: "shade",
    color: "#a9b5ff",
    lore: "Ele devolve os golpes que você repete.",
  },
  {
    name: "Colosso das Correntes",
    kind: "golem",
    color: "#d18b72",
    lore: "A arena se fecha como uma corrente.",
  },
  {
    name: "Corvo das Rotas Mortas",
    kind: "crow",
    color: "#b7a0e8",
    lore: "Cada saída que você escolheu virou uma asa.",
  },
  {
    name: "Raiz que Caça",
    kind: "treant",
    color: "#96c87d",
    lore: "O bosque aprendeu o peso dos seus passos.",
  },
  {
    name: "Tempestade de Vidro",
    kind: "gargoyle",
    color: "#8bd8e9",
    lore: "Fragmentos guardam o ritmo dos duelos anteriores.",
  },
  {
    name: "Mímico do Horizonte",
    kind: "mimic",
    color: "#e7b96b",
    lore: "A silhueta familiar nunca significa segurança.",
  },
  {
    name: "Sentinela das Memórias",
    kind: "golem",
    color: "#df91c3",
    lore: "O rival agora prevê as escolhas que o trouxeram até aqui.",
  },
  {
    name: "Fera do Véu Partido",
    kind: "wolf",
    color: "#9aafff",
    lore: "Uma sombra corre ao lado de cada movimento.",
  },
  {
    name: "Maestro do Contragolpe",
    kind: "wraith",
    color: "#ef9be3",
    lore: "Ele rege o intervalo entre o seu ataque e a próxima decisão.",
  },
  {
    name: "Arauto das Doze Marcas",
    kind: "gargoyle",
    color: "#ffc477",
    lore: "As marcas dos duelos anteriores brilham em sua armadura.",
  },
  {
    name: "O Último Caçador",
    kind: "shade",
    color: "#f4e7ff",
    lore: "O eco final pergunta se aprender também pode significar mudar.",
  },
];

const THEME: Theme = {
  name: "Anel das Lembranças",
  floor: T.CAVE,
  wall: T.CWALL,
  deco: T.CRYSTAL,
  biome: "cave",
  enemies: ["shade", "gargoyle", "wraith", "golem"],
  color: "#b9a0ff",
  lore: "Uma arena procedural se forma a partir das lembranças de combate do rival.",
};

export const nemesisBossId = (stage: number) => `echo_nemesis_${stage}`;
export const nemesisForm = (stage: number) =>
  FORMS[Math.max(1, Math.min(NEMESIS_STAGE_COUNT, Math.floor(stage))) - 1]!;

export function nemesisArenaData(stage: number, heroLevel: number): DungeonFloor {
  const rank = Math.max(1, Math.min(NEMESIS_STAGE_COUNT, Math.floor(stage)));
  const level = Math.max(1, Math.floor(heroLevel));
  const form = nemesisForm(rank);
  const data = generateFloor(1, {
    theme: { ...THEME, name: `Anel das Lembranças · Marca ${String(rank).padStart(2, "0")}` },
    seed: 82_741 + rank * 9_973 + level * 131,
    size: { w: 62, h: 44 },
    level: level + Math.floor(rank / 3),
    idPrefix: `nemesis-${rank}`,
    eliteBonus: 0.2,
    style: rank % 3 === 0 ? "labyrinth" : rank % 3 === 1 ? "gauntlet" : "mirror",
  });

  data.spawns = data.spawns.slice(0, 2 + Math.floor((rank - 1) / 3)).map((spawn, index, list) => ({
    ...spawn,
    elite: index === list.length - 1 && rank >= 4,
  }));
  data.chests = [
    {
      id: `nemesis-${rank}-cache`,
      tx: data.start.tx + 2,
      ty: data.start.ty + 1,
      gold: 120 + rank * 55,
      item: rank >= 9 ? "elixir" : "hi_potion",
      qty: rank >= 9 ? 1 : 2,
    },
  ];

  const boss: BossDef = {
    id: nemesisBossId(rank),
    name: form.name,
    biome: "cave",
    tx: data.stairs.tx,
    ty: data.stairs.ty - 2,
    hp: Math.round(650 + level * 27 + rank * 300),
    atk: Math.round(20 + level * 0.9 + rank * 4),
    xp: Math.round(500 + level * 16 + rank * 180),
    gold: 250 + rank * 170,
    color: form.color,
    minion: form.kind,
    reward: ["eco_shard", "mana_shard"],
  };
  data.boss = boss;
  data.theme = { ...data.theme, color: form.color, lore: form.lore };
  return data;
}

export const nemesisBossDef = (stage: number, level: number): BossDef =>
  nemesisArenaData(stage, level).boss!;

export function nemesisStageLoot(stage: number) {
  const rank = Math.max(1, Math.min(NEMESIS_STAGE_COUNT, Math.floor(stage)));
  return { gold: 450 + rank * 240, xp: 500 + rank * 220, shards: rank % 3 === 0 ? 3 : 2 };
}
