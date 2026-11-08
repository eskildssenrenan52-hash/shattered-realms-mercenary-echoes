export type ProgressPanel = "inv" | "char" | "quest" | "map" | "secrets" | "bestiary" | "grimoire" | "chronicle" | "epic" | "echoes" | "pets" | "mercenaries";

export type SkillId = "vigor" | "iron_skin" | "swift_step" | "focus" | "mana_well" | "scavenger" | "battle_rhythm" | "echo_ward";

export interface SkillNode {
  id: SkillId;
  name: string;
  branch: "vanguarda" | "arcano" | "exploracao";
  desc: string;
  maxRank: number;
  cost: (rank: number) => number;
  minLevel: number;
  requires?: SkillId;
}

export const SKILL_NODES: SkillNode[] = [
  { id: "vigor", name: "Vigor", branch: "vanguarda", desc: "+6 HP máximo por rank", maxRank: 3, cost: (r) => 1 + r, minLevel: 2 },
  { id: "iron_skin", name: "Pele de Ferro", branch: "vanguarda", desc: "+2 defesa por rank", maxRank: 3, cost: (r) => 1 + r, minLevel: 5, requires: "vigor" },
  { id: "battle_rhythm", name: "Ritmo de Batalha", branch: "vanguarda", desc: "+4% dano de arma por rank", maxRank: 3, cost: (r) => 2 + r, minLevel: 10, requires: "iron_skin" },
  { id: "focus", name: "Foco", branch: "arcano", desc: "+4 MP máximo por rank", maxRank: 3, cost: (r) => 1 + r, minLevel: 2 },
  { id: "mana_well", name: "Poço de Mana", branch: "arcano", desc: "+5% regeneração de MP por rank", maxRank: 3, cost: (r) => 1 + r, minLevel: 5, requires: "focus" },
  { id: "echo_ward", name: "Égide do Eco", branch: "arcano", desc: "-3% dano recebido por rank", maxRank: 3, cost: (r) => 2 + r, minLevel: 10, requires: "mana_well" },
  { id: "swift_step", name: "Passo Ligeiro", branch: "exploracao", desc: "+3% velocidade por rank", maxRank: 3, cost: (r) => 1 + r, minLevel: 3 },
  { id: "scavenger", name: "Catador de Relíquias", branch: "exploracao", desc: "+5% ouro encontrado por rank", maxRank: 3, cost: (r) => 1 + r, minLevel: 7, requires: "swift_step" },
];

export type SkillRanks = Partial<Record<SkillId, number>>;
export const freshSkillRanks = (): SkillRanks => ({});
export const skillNode = (id: SkillId) => SKILL_NODES.find((node) => node.id === id)!;
export function skillRank(ranks: SkillRanks | undefined, id: SkillId) { return Math.max(0, Math.floor(ranks?.[id] ?? 0)); }
export function skillAvailable(level: number, ranks: SkillRanks | undefined, node: SkillNode) {
  return level >= node.minLevel && (!node.requires || skillRank(ranks, node.requires) > 0);
}
export function skillCost(node: SkillNode, ranks: SkillRanks | undefined) { return node.cost(skillRank(ranks, node.id)); }
export function canBuySkill(level: number, points: number, ranks: SkillRanks | undefined, id: SkillId) {
  const node = skillNode(id), rank = skillRank(ranks, id);
  return rank < node.maxRank && skillAvailable(level, ranks, node) && points >= skillCost(node, ranks);
}
export function buySkill(level: number, points: number, ranks: SkillRanks, id: SkillId) {
  if (!canBuySkill(level, points, ranks, id)) return { ok: false, points, ranks };
  return { ok: true, points: points - skillCost(skillNode(id), ranks), ranks: { ...ranks, [id]: skillRank(ranks, id) + 1 } };
}

export function panelUnlockLevel(panel: ProgressPanel): number {
  return ({ inv: 1, char: 1, quest: 3, map: 3, secrets: 5, bestiary: 6, grimoire: 7, chronicle: 8, pets: 10, mercenaries: 12, epic: 15, echoes: 20 } as Record<ProgressPanel, number>)[panel];
}
export function panelUnlocked(level: number, panel: ProgressPanel) { return level >= panelUnlockLevel(panel); }
export function panelLabel(panel: ProgressPanel) { return ({ inv: "Mochila", char: "Herói", quest: "Missões", map: "Mapa", secrets: "Descobertas", bestiary: "Bestiário", grimoire: "Grimório", chronicle: "Crônica", epic: "Grande Crônica", echoes: "Ecos Além", pets: "Pets", mercenaries: "Mercenários" } as Record<ProgressPanel, string>)[panel]; }
export function skillBonuses(ranks: SkillRanks | undefined) {
  return {
    hp: skillRank(ranks, "vigor") * 6,
    mp: skillRank(ranks, "focus") * 4,
    defense: skillRank(ranks, "iron_skin") * 2,
    weaponDamage: skillRank(ranks, "battle_rhythm") * 0.04,
    damageTaken: 1 - skillRank(ranks, "echo_ward") * 0.03,
    speed: 1 + skillRank(ranks, "swift_step") * 0.03,
    mpRegen: 1 + skillRank(ranks, "mana_well") * 0.05,
  };
}
