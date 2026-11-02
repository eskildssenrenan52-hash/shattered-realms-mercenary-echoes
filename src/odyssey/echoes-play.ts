import type { Game } from "./engine";
import { generateFloor, type DungeonFloor, type Theme } from "./dungeon";
import { enterDepthState, enterRealm } from "./depthplay";
import { ECHOES_BEYOND_REALMS } from "./echoes-beyond";
import { actRealmUnlocked, realmUnlocked, sagaBossId, SAGA_REALMS, zoneUnlocked } from "./saga";
import { enterSagaZone } from "./saga-play";
import { T } from "./world";
import { epic, epicSave } from "./epic-play";
import { clampRep, type FactionId } from "./epic";
import { petsOf } from "./pet-play";
import { petById, SPECIES_BY_ID } from "./pets";
import { HEART_REALM, realmOpen } from "./secrets";
import type { MemoryVariant, RealmEndingChoice } from "./echoes-state";

export const COUNCIL_AGENDAS = [
  {
    id: "rotas",
    title: "Quem financiará as rotas reabertas?",
    options: [
      {
        id: "mare",
        label: "A Liga da Maré lidera a expansão mercantil.",
        rep: { mare: 4, veu: -1 },
        ending: "harmonia" as const,
      },
      {
        id: "forja",
        label: "A Irmandade da Forja constrói pontes e oficinas.",
        rep: { forja: 4, raiz: -1 },
        ending: "cancao" as const,
      },
    ],
  },
  {
    id: "acolhimento",
    title: "Como Potos deve receber quem retorna?",
    options: [
      {
        id: "raiz",
        label: "Replantar os campos e abrir os celeiros.",
        rep: { raiz: 4, forja: -1 },
        ending: "harmonia" as const,
      },
      {
        id: "coro",
        label: "Erguer uma praça para todos cantarem juntos.",
        rep: { coro: 4, silencio: -1 },
        ending: "cancao" as const,
      },
    ],
  },
  {
    id: "memorias",
    title: "O que fazer com as memórias dolorosas?",
    options: [
      {
        id: "veu",
        label: "Guardá-las no Arquivo do Véu, sem apagá-las.",
        rep: { veu: 4, mare: -1 },
        ending: "harmonia" as const,
      },
      {
        id: "silencio",
        label: "Permitir que cada pessoa escolha o que esquecer.",
        rep: { silencio: 4, coro: -1 },
        ending: "silencio" as const,
      },
    ],
  },
] as const;

export const CONSTELLATION_RITES = [
  {
    id: "ceu",
    title: "O céu que orienta",
    clue: "Primeiro a estrela; depois a onda; por fim, o sino.",
    answer: [0, 1, 2],
  },
  {
    id: "mare",
    title: "A maré que devolve",
    clue: "O sino desperta o mar, e a estrela marca a margem.",
    answer: [2, 1, 0],
  },
  {
    id: "som",
    title: "A canção que abre",
    clue: "O sino chama; a estrela responde; a onda encerra.",
    answer: [2, 0, 1],
  },
] as const;
export const CONSTELLATION_SYMBOLS = ["Estrela", "Onda", "Sino"] as const;

export const CARAVAN_ORDERS = [
  {
    id: "primeira-ponte",
    realm: "ferrolume",
    title: "Reabrir a Ponte-Mãe",
    costGold: 60,
    costPlank: 2,
    rewardGold: 360,
    rewardItem: "eco_shard",
  },
  {
    id: "farol-de-caligo",
    realm: "caligo",
    title: "Levar lentes ao farol de Caligo",
    costGold: 100,
    costPlank: 3,
    rewardGold: 520,
    rewardItem: "mana_shard",
  },
  {
    id: "sementes-auriflor",
    realm: "auriflor",
    title: "Entregar sementes a Auriflor",
    costGold: 140,
    costPlank: 4,
    rewardGold: 760,
    rewardItem: "eco_shard",
  },
] as const;

const hasSagaZone = (g: Game, realm: string) =>
  SAGA_REALMS.some(
    (r) => r.id === realm && r.zones.some((_, i) => g.discoveries.has(`saga:${realm}:${i}`)),
  );
const finalDone = (g: Game, realm: (typeof ECHOES_BEYOND_REALMS)[number]) =>
  g.bossesDone.has(sagaBossId(realm, realm.zones.length - 1));
const atPotos = (g: Game) =>
  !g.depth &&
  !g.interior &&
  !g.island &&
  !g.sea &&
  Math.hypot(g.p.x / 16 - 122, g.p.y / 16 - 126) < 19;

export const cartographyProgress = (g: Game) => ({
  realms: SAGA_REALMS.filter((r) => hasSagaZone(g, r.id)).length,
  charted: g.echoSystems.cartography.routes.length,
  islands: [...g.discoveries].filter((key) => key.startsWith("island:") || key.startsWith("isle:"))
    .length,
  choices: [...g.discoveries].filter((key) => key.startsWith("side:") && key.includes(":choice"))
    .length,
});

export function chartVesperRoute(g: Game, realmId: string) {
  if (!SAGA_REALMS.some((r) => r.id === realmId) || !hasSagaZone(g, realmId)) return false;
  if (g.echoSystems.cartography.routes.includes(realmId)) return true;
  g.echoSystems.cartography.routes.push(realmId);
  g.discoveries.add(`vesper:chart:${realmId}`);
  g.toast(
    `Vésper traçou uma rota segura para ${SAGA_REALMS.find((r) => r.id === realmId)!.name}. Ela agora aparece no Atlas.`,
    "#ffd27a",
  );
  g.audio.sfx("level");
  g.save();
  return true;
}

export function travelVesperRoute(g: Game, realmId: string) {
  if (g.depth || g.island || g.sea || g.interior || g.siege) {
    g.toast("A rota do Atlas só pode ser usada quando você estiver em terra firme.", "#ffb060");
    return false;
  }
  if (!g.echoSystems.cartography.routes.includes(realmId)) {
    g.toast("Explore e registre este reino no Mapa de Vésper antes de viajar.", "#ffb060");
    return false;
  }
  const ri = SAGA_REALMS.findIndex((r) => r.id === realmId),
    realm = SAGA_REALMS[ri];
  if (ri < 0 || !realm) return false;
  if (realm.gate === "atos" && !actRealmUnlocked(realm.act ?? 1, g.questStatus)) {
    g.toast("O lacre da campanha ainda não liberou essa rota.", "#ffb060");
    return false;
  }
  if (realm.gate === "ecos" && !actRealmUnlocked(5, g.questStatus)) {
    g.toast("Conclua o Ato V antes de reabrir esta rota.", "#ffb060");
    return false;
  }
  if (realm.gate === "manopla" && g.questStatus["m6"] !== "done") {
    g.toast("A Fenda Costurada continua selada.", "#ffb060");
    return false;
  }
  const done = (id: string) => g.bossesDone.has(id);
  if (realm.gate === "ecos") {
    const peers = SAGA_REALMS.filter((candidate) => candidate.gate === "ecos");
    const previous = peers[peers.indexOf(realm) - 1];
    if (previous && !done(sagaBossId(previous, previous.zones.length - 1))) {
      g.toast("Uma cidade-reino anterior ainda aguarda libertação.", "#ffb060");
      return false;
    }
  } else if (realm.gate !== "atos" && !realmUnlocked(ri, done)) {
    g.toast("Uma travessia anterior ainda precisa ser concluída.", "#ffb060");
    return false;
  }
  const zi = realm.zones.findIndex(
    (_, i) => g.discoveries.has(`saga:${realmId}:${i}`) && zoneUnlocked(realm, i, done),
  );
  if (zi < 0) {
    g.toast("Não há ainda um trecho seguro registrado neste reino.", "#ffb060");
    return false;
  }
  enterSagaZone(g, ri, zi);
  return true;
}

export function echoBondProgress(g: Game) {
  const st = petsOf(g);
  const team = st.team
    .map((uid) => petById(st, uid))
    .filter((pet): pet is NonNullable<typeof pet> => !!pet);
  const elements = new Set(team.map((pet) => SPECIES_BY_ID[pet.species]?.element).filter(Boolean));
  return {
    count: team.length,
    bond: team.length ? Math.round(team.reduce((n, pet) => n + pet.bond, 0) / team.length) : 0,
    diverse: elements.size >= 2,
    names: team.map((pet) => pet.nick),
  };
}

export function awakenEchoBond(g: Game) {
  const progress = echoBondProgress(g);
  if (progress.count < 2 || progress.bond < 20 || !progress.diverse) {
    g.toast(
      "Reúna ao menos dois companheiros de elementos diferentes e crie um vínculo médio de 20.",
      "#ffb060",
    );
    return false;
  }
  if (g.echoSystems.bonds.unlocked) return true;
  g.echoSystems.bonds.unlocked = true;
  g.echoSystems.bonds.sceneSeen = true;
  g.discoveries.add("echo:bond:loyalty-scene");
  g.toast(
    `${progress.names.join(" e ")} unem seus ritmos. Laço de Eco ativo: companheiros em equipe protegem e atacam melhor.`,
    "#f0a0c0",
  );
  g.audio.sfx("level");
  g.save();
  return true;
}

export function castCouncilVote(g: Game, agendaId: string, optionId: string) {
  const agenda = COUNCIL_AGENDAS.find((item) => item.id === agendaId);
  const option = agenda?.options.find((item) => item.id === optionId);
  if (!agenda || !option) return false;
  if (!actRealmUnlocked(5, g.questStatus)) {
    g.toast("O Conselho se reunirá quando a campanha alcançar o Ato V.", "#a0a0c0");
    return false;
  }
  if (g.echoSystems.council.votes.some((vote) => vote.startsWith(`${agendaId}:`))) return false;
  const state = epic(g);
  for (const [faction, amount] of Object.entries(option.rep))
    state.rep[faction as FactionId] = clampRep(state.rep[faction as FactionId] + amount);
  state.ending[option.ending] += 1;
  g.echoSystems.council.votes.push(`${agendaId}:${optionId}`);
  epicSave(g);
  g.save();
  g.audio.sfx("level");
  g.toast(`O Conselho aprovou: ${option.label} Reputação e finais foram atualizados.`, "#ffd27a");
  return true;
}

const DREAM_THEMES: Theme[] = [
  {
    name: "Sonho de Vidro",
    floor: T.ICE,
    wall: T.CWALL,
    deco: T.CRYSTAL,
    biome: "cave",
    enemies: ["wisp", "shade"],
    color: "#a0d8ff",
    lore: "As ondas de um mar impossível estão suspensas no céu.",
  },
  {
    name: "Sonho das Raízes",
    floor: T.MOSS,
    wall: T.ROCK,
    deco: T.FLOWER,
    biome: "forest",
    enemies: ["sporeling", "treant"],
    color: "#a0e080",
    lore: "Uma árvore cresce ao contrário e ainda assim procura o sol.",
  },
  {
    name: "Sonho da Última Nota",
    floor: T.FLOOR,
    wall: T.CWALL,
    deco: T.PILLAR,
    biome: "ruins",
    enemies: ["wraith", "shade"],
    color: "#dfb0ff",
    lore: "O silêncio deixa uma fresta para a canção atravessar.",
  },
  {
    name: "Sonho do Farol",
    floor: T.SAND,
    wall: T.ROCK,
    deco: T.WATER,
    biome: "coast",
    enemies: ["jelly", "wisp"],
    color: "#80e0e8",
    lore: "O farol acende para um barco que ainda não partiu.",
  },
];

export function dreamFloorData(run: number, level: number): DungeonFloor {
  const theme = DREAM_THEMES[(Math.max(1, run) - 1) % DREAM_THEMES.length]!;
  const data = generateFloor(1, {
    theme,
    seed: 71_009 + run * 7919,
    size: { w: 42, h: 30 },
    level: Math.max(3, level),
    idPrefix: `dream-${run}`,
    eliteBonus: 0,
  });
  data.spawns = data.spawns
    .slice(0, 6)
    .map((spawn, index) => ({ ...spawn, level: Math.max(1, level + (index % 2)), elite: false }));
  data.boss = null;
  data.chests = [
    {
      id: `dream-${run}-memory`,
      tx: data.start.tx + 2,
      ty: data.start.ty + 1,
      gold: 90 + level * 8,
      item: "mana_shard",
      qty: 1,
    },
  ];
  data.spawns.push({
    kind: theme.enemies[0]!,
    tx: data.stairs.tx - 2,
    ty: data.stairs.ty,
    level: Math.max(1, level + 3),
    elite: true,
  });
  return data;
}

export function startDreamExpedition(g: Game) {
  if (g.depth || g.interior || g.island || g.sea || g.siege) {
    g.toast(
      "A expedição onírica começa apenas quando você estiver em Potos ou na superfície.",
      "#ffb060",
    );
    return false;
  }
  if (!actRealmUnlocked(5, g.questStatus)) {
    g.toast("As memórias oníricas despertam depois da conclusão do Ato V.", "#a0a0c0");
    return false;
  }
  if (g.echoSystems.dreams.memories <= 0) {
    g.toast(
      "Você ainda não encontrou uma Memória de Eco. Vença chefes de Saga para coletá-las.",
      "#ffb060",
    );
    return false;
  }
  g.echoSystems.dreams.memories--;
  g.echoSystems.dreams.runs++;
  const run = g.echoSystems.dreams.runs;
  g.echoSystems.dreams.activeRun = run;
  const data = dreamFloorData(run, Math.max(4, Math.floor(g.p.level * 0.8)));
  enterDepthState(g, { kind: "dream", profile: "dream", floor: 1, data, stair: "moon" }, 1.18);
  g.biomeBanner = { name: `Expedição onírica · Memória ${run}`, t: 5 };
  g.toast(data.theme.lore, data.theme.color);
  g.save();
  return true;
}

export function submitConstellation(g: Game, input: number[]) {
  const state = g.echoSystems.constellations;
  const rite = CONSTELLATION_RITES[state.stage];
  if (!rite || state.completed) return state.completed;
  if (
    input.length !== rite.answer.length ||
    input.some((v) => !Number.isInteger(v) || v < 0 || v >= CONSTELLATION_SYMBOLS.length)
  )
    return false;
  if (input.some((v, i) => v !== rite.answer[i])) {
    state.failures++;
    g.toast("A constelação se desfaz. Leia a pista, ajuste a ordem e tente novamente.", "#ff9b8a");
    g.audio.sfx("hurt");
    g.save();
    return false;
  }
  state.stage++;
  if (state.stage >= CONSTELLATION_RITES.length) {
    state.stage = CONSTELLATION_RITES.length;
    state.completed = true;
    g.discoveries.add("vesper:constellation:complete");
    if (g.addItem("eco_shard"))
      g.toast(
        "Os três Rituais foram concluídos: uma rota estelar de Vésper foi registrada no Atlas.",
        "#bfefff",
      );
  } else
    g.toast(
      `Ritual ${state.stage}/${CONSTELLATION_RITES.length} concluído. A próxima constelação respondeu.`,
      "#bfefff",
    );
  g.audio.sfx("level");
  g.save();
  return true;
}

export function acceptCaravanOrder(g: Game) {
  if (!atPotos(g)) {
    g.toast("Aceite e entregue as encomendas no mercado de Potos.", "#ffb060");
    return false;
  }
  if (!actRealmUnlocked(5, g.questStatus)) {
    g.toast("As rotas comerciais de Ecos Além abrem após o Ato V.", "#a0a0c0");
    return false;
  }
  if (g.echoSystems.caravans.active) return false;
  const order = CARAVAN_ORDERS.find(
    (candidate) => !g.echoSystems.caravans.completed.includes(candidate.id),
  );
  if (!order) return false;
  if (g.p.gold < order.costGold || g.count("plank") < order.costPlank) {
    g.toast(
      `Faltam ${order.costGold} ouro e ${order.costPlank} tábuas para preparar esta caravana.`,
      "#ffb060",
    );
    return false;
  }
  g.p.gold -= order.costGold;
  g.removeItem("plank", order.costPlank);
  g.echoSystems.caravans.active = {
    id: order.id,
    realm: order.realm,
    acceptedAtCycle: g.echoSystems.beyond.cycle,
    arrivalVerified: false,
  };
  g.toast(
    `Caravana a caminho de ${ECHOES_BEYOND_REALMS.find((r) => r.id === order.realm)?.name ?? order.realm}. Explore o reino e volte a Potos para receber a entrega.`,
    "#e8c17c",
  );
  g.audio.sfx("pickup");
  g.save();
  return true;
}

export function caravanProgress(g: Game) {
  const active = g.echoSystems.caravans.active;
  return {
    active,
    visited: active ? active.arrivalVerified && hasSagaZone(g, active.realm) : false,
    atPotos: atPotos(g),
    next: CARAVAN_ORDERS.find((o) => !g.echoSystems.caravans.completed.includes(o.id)) ?? null,
  };
}

export function claimCaravanOrder(g: Game) {
  const active = g.echoSystems.caravans.active;
  const order = active && CARAVAN_ORDERS.find((candidate) => candidate.id === active.id);
  if (!active || !order) return false;
  if (!active.arrivalVerified || !hasSagaZone(g, active.realm)) {
    g.toast("A carga precisa chegar ao reino indicado depois de aceitar a encomenda.", "#ffb060");
    return false;
  }
  if (!atPotos(g)) {
    g.toast(
      "A entrega está registrada. Retorne ao mercado de Potos para receber o pagamento.",
      "#ffb060",
    );
    return false;
  }
  g.p.gold += order.rewardGold;
  g.addItem(order.rewardItem);
  g.echoSystems.caravans.completed.push(order.id);
  g.echoSystems.caravans.routes.push(order.realm);
  g.echoSystems.cartography.routes = [
    ...new Set([...g.echoSystems.cartography.routes, order.realm]),
  ];
  g.discoveries.add(`caravan:route:${order.realm}`);
  g.echoSystems.caravans.active = null;
  g.toast(
    `Entrega concluída: +${order.rewardGold} ouro · ${order.rewardItem}. A rota comercial aparece no Atlas.`,
    "#a0ffa0",
  );
  g.audio.sfx("level");
  g.save();
  return true;
}

export function syncMuseumRelics(g: Game) {
  let changed = false;
  for (const realm of ECHOES_BEYOND_REALMS) {
    const id = realm.reward.item;
    if (g.inventory.some((slot) => slot.id === id) || Object.values(g.p.equip).includes(id)) {
      if (!g.echoSystems.museum.relics.includes(id)) {
        g.echoSystems.museum.relics.push(id);
        changed = true;
      }
    }
  }
  if (changed) g.save();
}

export function museumScene(g: Game, relicId: string) {
  const realm = ECHOES_BEYOND_REALMS.find((item) => item.reward.item === relicId);
  if (!realm || !g.echoSystems.museum.relics.includes(relicId)) return false;
  if (!g.echoSystems.museum.scenes.includes(relicId)) g.echoSystems.museum.scenes.push(relicId);
  g.discoveries.add(`museum:${relicId}`);
  const remembered = g.echoSystems.museum.variants[relicId] === "remember";
  const line = remembered
    ? `A relíquia guarda o primeiro som de ${realm.name}. A memória permanece inteira — inclusive a parte que ainda dói.`
    : `A relíquia solta a lembrança com cuidado. O que aconteceu não desaparece, mas deixa de ser uma corrente.`;
  g.dialog = {
    npc: {
      id: "museum_keeper",
      name: "Edda das Canções",
      title: "Curadora do Museu",
      tx: 0,
      ty: 0,
      pal: {
        skin: "#e8d0c0",
        hair: "#d8b060",
        body: "#604080",
        legs: "#302040",
        accent: "#fff0a0",
      },
      lines: [],
    },
    text: `${realm.reward.name}\n\n${line}\n\n${realm.epilogue[1] ?? realm.epilogue[0]}`,
    choices: [
      {
        label: "Fechar a lembrança",
        act: () => {
          g.dialog = null;
        },
      },
    ],
  };
  g.save();
  return true;
}

export function setMuseumVariant(g: Game, relicId: string, variant: MemoryVariant) {
  if (!g.echoSystems.museum.relics.includes(relicId)) return false;
  g.echoSystems.museum.variants[relicId] = variant;
  g.discoveries.add(`museum:choice:${relicId}:${variant}`);
  g.toast(
    variant === "remember"
      ? "A canção ficará exposta sem cortes."
      : "A cidade escolheu uma memória mais gentil; o registro original permanece guardado.",
    "#d8c0ff",
  );
  g.save();
  return true;
}

export function toggleFractureOptIn(g: Game) {
  if (g.echoSystems.storms.active || g.depth?.kind === "storm") return false;
  g.echoSystems.storms.optIn = !g.echoSystems.storms.optIn;
  g.toast(
    g.echoSystems.storms.optIn
      ? "Você aceitou receber avisos de Tempestades de Fratura. Nada começa sem sua confirmação."
      : "Avisos de Tempestade desativados.",
    "#d8c0ff",
  );
  g.save();
  return g.echoSystems.storms.optIn;
}

export function setStormRealm(g: Game, realmId: string) {
  if (!ECHOES_BEYOND_REALMS.some((realm) => realm.id === realmId) || g.echoSystems.storms.active)
    return false;
  g.echoSystems.storms.selectedRealm = realmId;
  g.save();
  return true;
}

export function fractureFloorData(
  realmId: string,
  run: number,
  level: number,
): DungeonFloor | null {
  const realm = ECHOES_BEYOND_REALMS.find((candidate) => candidate.id === realmId);
  if (!realm) return null;
  const zone = realm.zones[realm.zones.length - 1]!;
  const theme: Theme = {
    name: `Fenda de ${realm.name}`,
    floor: T.ASH,
    wall: T.CWALL,
    deco: T.CRYSTAL,
    biome: zone.biome,
    enemies: [...zone.enemies],
    color: "#d080ff",
    lore: `Uma Tempestade de Fratura distorceu ${realm.name}. As estruturas são instáveis; derrote o Arauto para dissipar a ruptura.`,
  };
  const data = generateFloor(1, {
    theme,
    seed: 93_511 + run * 13_007 + realmId.length * 701,
    size: { w: 46, h: 32 },
    level: Math.max(level, realm.level),
    idPrefix: `fracture-${run}`,
    eliteBonus: 0,
  });
  data.spawns = data.spawns.slice(0, 7).map((spawn, index) => ({
    ...spawn,
    level: Math.max(level, realm.level) + (index % 3),
    elite: index === 5,
  }));
  data.boss = {
    id: `fracture_storm_${run}`,
    name: `Arauto da Fratura de ${realm.name}`,
    biome: zone.biome,
    tx: data.stairs.tx,
    ty: data.stairs.ty - 2,
    hp: Math.round(2200 + realm.level * realm.level * 7 + level * level * 10),
    atk: Math.round(28 + realm.level * 1.7 + level * 0.6),
    xp: 900 + realm.level * 120,
    gold: 450 + realm.level * 65,
    color: "#d080ff",
    minion: zone.enemies[0]!,
    reward: ["eco_shard", "mana_shard", "hi_potion"],
  };
  data.chests = [
    {
      id: `fracture-${run}-cache`,
      tx: data.start.tx + 2,
      ty: data.start.ty + 1,
      gold: 120 + realm.level * 12,
      item: "hi_potion",
      qty: 2,
    },
  ];
  return data;
}

export function startFractureStorm(g: Game) {
  if (!g.echoSystems.storms.optIn) {
    g.toast("Ative os avisos opt-in antes de iniciar o evento.", "#ffb060");
    return false;
  }
  if (g.echoSystems.storms.active || g.depth || g.interior || g.island || g.sea || g.siege) {
    g.toast("Termine sua atividade atual antes de atravessar a Fenda.", "#ffb060");
    return false;
  }
  if (!actRealmUnlocked(5, g.questStatus)) {
    g.toast("Tempestades de Fratura surgem depois do Ato V.", "#a0a0c0");
    return false;
  }
  const run = g.echoSystems.storms.completions + 1;
  const data = fractureFloorData(g.echoSystems.storms.selectedRealm, run, Math.max(g.p.level, 20));
  if (!data) return false;
  g.echoSystems.storms.active = true;
  enterDepthState(
    g,
    { kind: "storm", profile: "storm", floor: 1, data, stair: "storm" },
    1.22 + Math.min(0.6, run * 0.04),
  );
  g.biomeBanner = { name: `Tempestade de Fratura · ${g.echoSystems.storms.selectedRealm}`, t: 6 };
  g.toast(data.theme.lore, "#d8a0ff");
  g.save();
  return true;
}

export function recordStormBossVictory(g: Game, bossId: string) {
  if (!bossId.startsWith("fracture_storm_")) return false;
  g.echoSystems.storms.active = false;
  g.echoSystems.storms.completions++;
  g.echoSystems.storms.lastBossId = bossId;
  g.discoveries.add(`fracture:complete:${bossId}`);
  g.toast("Arauto derrotado. A Fenda se estabiliza e a região volta ao normal.", "#d8a0ff");
  g.save();
  return true;
}

export function chooseBeyondRealmEnding(g: Game, realmId: string, choice: RealmEndingChoice) {
  const realm = ECHOES_BEYOND_REALMS.find((candidate) => candidate.id === realmId);
  if (!realm || !finalDone(g, realm)) return false;
  g.echoSystems.beyond.choices[realmId] = choice;
  g.discoveries.add(`beyond:ending:${realmId}:${choice}`);
  g.toast(
    choice === "preserve"
      ? `${realm.name}: você preservará a lembrança para a próxima jornada.`
      : `${realm.name}: você permitirá que a cidade transforme a lembrança.`,
    realm.color,
  );
  g.save();
  return true;
}

export function beyondCycleProgress(g: Game) {
  const completed = ECHOES_BEYOND_REALMS.filter((realm) => finalDone(g, realm)).length;
  const choices = ECHOES_BEYOND_REALMS.filter(
    (realm) => !!g.echoSystems.beyond.choices[realm.id],
  ).length;
  return {
    cycle: g.echoSystems.beyond.cycle,
    completed,
    choices,
    required: ECHOES_BEYOND_REALMS.length,
    ready: completed === ECHOES_BEYOND_REALMS.length && choices === ECHOES_BEYOND_REALMS.length,
  };
}

export function startBeyondCycle(g: Game) {
  if (!atPotos(g)) {
    g.toast("O próximo Ciclo de Ecos Além deve começar no Mapa dos Atos em Potos.", "#ffb060");
    return false;
  }
  const progress = beyondCycleProgress(g);
  if (!progress.ready) {
    g.toast(
      "Conclua os cinco reinos de Ecos Além e escolha um desfecho para cada cidade.",
      "#ffb060",
    );
    return false;
  }
  const current = g.echoSystems.beyond.cycle;
  g.echoSystems.beyond.history.push({
    cycle: current,
    choices: { ...g.echoSystems.beyond.choices },
  });
  g.echoSystems.beyond.cycle++;
  g.echoSystems.beyond.choices = {};
  for (const realm of ECHOES_BEYOND_REALMS) {
    for (let i = 0; i < realm.zones.length; i++) {
      g.bossesDone.delete(sagaBossId(realm, i));
      g.seenBeats.delete(`saga_win_${realm.id}_${i}`);
    }
    g.seenBeats.delete(`saga_epi_${realm.id}`);
  }
  g.rebuildEnemies();
  g.p.hp = g.maxHp();
  g.p.mp = g.maxMp();
  g.toast(
    `Ciclo Ecos Além ${g.echoSystems.beyond.cycle + 1} começou. Chefes terão modificadores definidos por suas escolhas anteriores.`,
    "#d8a0ff",
  );
  g.audio.sfx("level");
  g.save();
  return true;
}

export function canTravelToHeartRealm(g: Game) {
  return (
    g.echoSystems.constellations.completed &&
    realmOpen(
      HEART_REALM,
      (key) => g.discoveries.has(key),
      (id) => g.openedChests.has(id),
    )
  );
}

export function enterHeartByConstellation(g: Game) {
  if (!canTravelToHeartRealm(g)) {
    g.toast("Conclua os três Rituais e honre as doze relíquias dos Reinos Ocultos.", "#ffb060");
    return false;
  }
  if (g.depth || g.interior || g.island || g.sea) {
    g.toast("Volte à superfície antes de seguir a rota estelar.", "#ffb060");
    return false;
  }
  enterRealm(g, HEART_REALM);
  return true;
}

export function canOpenEchoSystems(g: Game) {
  return actRealmUnlocked(5, g.questStatus);
}
export function isInPotos(g: Game) {
  return atPotos(g);
}
export function beyondChoicesReady(g: Game) {
  return ECHOES_BEYOND_REALMS.every((realm) => !!g.echoSystems.beyond.choices[realm.id]);
}
