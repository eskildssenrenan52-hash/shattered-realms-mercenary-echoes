import type { NpcDef } from "./data";
import { findNearbyWalkableTile, resolveFarlandsSites } from "./farlands";
import { H, W, type World } from "./world";

type FarlandsNpcSeed = Omit<NpcDef, "tx" | "ty"> & { siteId: string };

const SEEDS: FarlandsNpcSeed[] = [
  {
    id: "farlands_talia", siteId: "glass-tide", name: "Tália Vidralume", title: "Cartógrafa da Maré de Vidro",
    pal: { skin: "#e2b18f", hair: "#69b8c4", body: "#377e8b", legs: "#284756", accent: "#b5f4f0" },
    lines: ["Cada caco de vidro guarda o último rumo de um navio. Já juntei tantos que quase consigo desenhar o oceano perdido.", "Se a maré mudar de cor, espere. As correntes deste continente respondem às lembranças."],
  },
  {
    id: "farlands_taurin", siteId: "windward", name: "Taurin Passo-Claro", title: "Guia dos Degraus do Vento",
    pal: { skin: "#c99272", hair: "#e0d3b6", body: "#617d9a", legs: "#344960", accent: "#d8f0ff" },
    lines: ["Os degraus sobem até onde o mapa acaba. Eu prefiro acreditar que o céu continua por lá.", "O gelo canta antes de ceder. Pare um instante e ouça a montanha."],
  },
  {
    id: "farlands_nima", siteId: "ember-well", name: "Nima Brasa", title: "Guardadora da Fonte de Cinzas",
    pal: { skin: "#bf8668", hair: "#f08c56", body: "#9b483c", legs: "#50313b", accent: "#ffd184" },
    lines: ["A fonte aquece as mãos, mas não consome nada. É o coração antigo da terra, ainda aprendendo a bater.", "Trago água morna aos viajantes. As cinzas daqui já foram uma floresta inteira."],
  },
  {
    id: "farlands_liora", siteId: "mothwood", name: "Liora Asa-de-Mariposa", title: "Herborista de Mothwood",
    pal: { skin: "#e5bd9d", hair: "#b8a0da", body: "#607d5a", legs: "#384d40", accent: "#e2f5a2" },
    lines: ["As mariposas me mostram trilhas novas toda noite. De manhã, finjo que já sabia o caminho.", "Não assuste as luzes do bosque. Elas guiam quem caminha com cuidado."],
  },
  {
    id: "farlands_samir", siteId: "salt-oracle", name: "Samir do Sal", title: "Leitor das Tempestades",
    pal: { skin: "#b97f58", hair: "#382f34", body: "#c39853", legs: "#67503a", accent: "#fff0ae" },
    lines: ["O oráculo nunca revela o passado. Talvez queira que aprendamos a olhar para o céu de agora.", "Quando o horizonte ficar branco, procure abrigo a oeste. A areia passa depressa, mas não perdoa distrações."],
  },
  {
    id: "farlands_vela", siteId: "pearl-marsh", name: "Vela Raiz-Pérola", title: "Cuidadora das Águas Quietas",
    pal: { skin: "#9f755b", hair: "#a6d7c1", body: "#497b72", legs: "#34554f", accent: "#e1fff0" },
    lines: ["As pérolas nas raízes são sementes. Deixe-as onde estão e o pântano continuará cantando.", "A névoa não esconde o caminho; ela pede que você desacelere."],
  },
  {
    id: "farlands_oren", siteId: "blue-archive", name: "Oren Azul", title: "Arquivista dos Veios",
    pal: { skin: "#d2a58a", hair: "#648db8", body: "#50648a", legs: "#303f5b", accent: "#b7dfff" },
    lines: ["Leio as histórias gravadas nos cristais. A maioria termina com alguém voltando para casa.", "As estantes minerais não guardam livros: guardam as vozes de quem viveu aqui."],
  },
  {
    id: "farlands_cira", siteId: "far-seed", name: "Cira Semente-Distante", title: "Jardineira do Horizonte",
    pal: { skin: "#dfb18c", hair: "#71834d", body: "#78955a", legs: "#455b3d", accent: "#c1f08e" },
    lines: ["Esta semente veio de uma floresta que ainda não existe. Cuido dela para que um dia alguém tenha um lugar novo para chamar de lar.", "O horizonte parece distante até que uma pequena semente decide atravessá-lo."],
  },
];

const cache = new WeakMap<World, NpcDef[]>();

/** NPCs próprios do segundo continente; coordenadas derivadas dos marcos determinísticos. */
export function farlandsNpcs(world: World): NpcDef[] {
  const cached = cache.get(world);
  if (cached) return cached;

  const sites = resolveFarlandsSites(world);
  const byId = new Map(sites.map((site) => [site.id, site]));
  const used = new Set<number>();
  for (const site of sites) for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const x = site.x + dx, y = site.y + dy;
    if (x >= 0 && y >= 0 && x < W && y < H) used.add(y * W + x);
  }
  const npcs = SEEDS.flatMap(({ siteId, ...seed }) => {
    const site = byId.get(siteId);
    if (!site) return [];
    const spot = findNearbyWalkableTile(world, site.x + 4, site.y + 3, used, 48);
    if (!spot) return [];
    used.add(spot.y * W + spot.x);
    return [{ ...seed, tx: spot.x, ty: spot.y }];
  });

  cache.set(world, npcs);
  return npcs;
}
