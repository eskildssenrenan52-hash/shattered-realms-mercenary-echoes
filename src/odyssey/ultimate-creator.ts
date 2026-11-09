import type { Game } from "./engine";

export type UltimateSchool = "arcane" | "primal" | "void";
export type UltimateForm = "nova" | "beam" | "storm" | "guardian" | "rift" | "rain";
export type UltimateModifier = "pierce" | "drain" | "freeze" | "echo" | "execute" | "silence" | "mark";
export type UltimateTarget = "single" | "area" | "all" | "cone" | "ally";
export type UltimateElement = "fire" | "ice" | "lightning" | "nature" | "shadow" | "astral";
export type UltimateTrigger = "impact" | "low-health" | "combo" | "boss" | "dodge";
export type UltimateAugment = "overcharge" | "rebound" | "barrier" | "summon" | "timebreak";
export type UltimateCore = "crystal" | "heart" | "relic" | "singularity";
export type UltimateTier = "Raro" | "Épico" | "Lendário" | "Mítico";

export interface UltimateBuild {
  name: string; school: UltimateSchool; form: UltimateForm; modifier: UltimateModifier; target: UltimateTarget;
  element: UltimateElement; trigger: UltimateTrigger; augment: UltimateAugment; core: UltimateCore; essence: string;
  quality: number; stability: number; tier: UltimateTier; damage: number; radius: number; cooldown: number; mpCost: number;
  charges: number; masteryGain: number; createdAtLevel: number; blueprintId: string;
}
export interface UltimateChoice<T extends string> { id: T; name: string; desc: string; color: string; icon: string; specificity: number }
const icon = (name: string) => `/assets/ultimate/${name}.png`;

export const ULTIMATE_SCHOOLS: readonly UltimateChoice<UltimateSchool>[] = [
  { id: "arcane", name: "Arcanismo", desc: "Converte inteligência e mana em dano preciso.", color: "#b596ff", icon: icon("icon-arcane"), specificity: 2 },
  { id: "primal", name: "Primordial", desc: "Ataque brutal que cresce com força e vitalidade.", color: "#ff9a62", icon: icon("icon-primal"), specificity: 2 },
  { id: "void", name: "Vazio", desc: "Rasga defesas e recompensa combinações raras.", color: "#76d8ff", icon: icon("icon-void"), specificity: 3 },
];
export const ULTIMATE_FORMS: readonly UltimateChoice<UltimateForm>[] = [
  { id: "nova", name: "Nova", desc: "Explosão circular imediata.", color: "#ffd080", icon: icon("icon-catalyst"), specificity: 1 },
  { id: "beam", name: "Lança", desc: "Golpe concentrado no alvo mais próximo.", color: "#8ce8ff", icon: icon("icon-arcane"), specificity: 3 },
  { id: "storm", name: "Tempestade", desc: "Vários impactos em uma área persistente.", color: "#dca8ff", icon: icon("icon-void"), specificity: 4 },
  { id: "guardian", name: "Guardião", desc: "Dano e proteção numa conjuração defensiva.", color: "#9cffb7", icon: icon("icon-crown"), specificity: 4 },
  { id: "rift", name: "Fenda", desc: "Abre um rasgo que dobra distância e tempo.", color: "#ff92d6", icon: icon("icon-void"), specificity: 5 },
  { id: "rain", name: "Chuva", desc: "Cria uma sequência de impactos sobre uma zona.", color: "#9fe4ff", icon: icon("icon-catalyst"), specificity: 5 },
];
export const ULTIMATE_MODIFIERS: readonly UltimateChoice<UltimateModifier>[] = [
  { id: "pierce", name: "Perfurante", desc: "Ignora parte da defesa inimiga.", color: "#ffcf74", icon: icon("icon-primal"), specificity: 3 },
  { id: "drain", name: "Sanguessuga", desc: "Converte uma fração do dano em cura.", color: "#ff7d9b", icon: icon("icon-catalyst"), specificity: 3 },
  { id: "freeze", name: "Congelante", desc: "Reduz a velocidade dos sobreviventes.", color: "#83eaff", icon: icon("icon-void"), specificity: 2 },
  { id: "echo", name: "Eco Duplo", desc: "Repete parte do impacto depois de um atraso.", color: "#c99cff", icon: icon("icon-arcane"), specificity: 5 },
  { id: "execute", name: "Execução", desc: "Causa dano extra a inimigos abaixo de 30% de vida.", color: "#ff6b78", icon: icon("icon-primal"), specificity: 5 },
  { id: "silence", name: "Silêncio", desc: "Interrompe chefes e reduz a agressividade por instantes.", color: "#b1b6d9", icon: icon("icon-void"), specificity: 4 },
  { id: "mark", name: "Marca", desc: "O próximo golpe contra o alvo marcado é amplificado.", color: "#ffd35e", icon: icon("icon-crown"), specificity: 4 },
];
export const ULTIMATE_TARGETS: readonly UltimateChoice<UltimateTarget>[] = [
  { id: "single", name: "Um alvo", desc: "Máxima potência contra um inimigo.", color: "#ff927e", icon: icon("icon-primal"), specificity: 1 },
  { id: "area", name: "Área", desc: "Equilíbrio entre alcance e dano.", color: "#ffd080", icon: icon("icon-catalyst"), specificity: 2 },
  { id: "all", name: "Toda a tela", desc: "Alcance extremo, custo e recarga altos.", color: "#b896ff", icon: icon("icon-void"), specificity: 5 },
  { id: "cone", name: "Cone frontal", desc: "Derruba uma linha de inimigos à frente.", color: "#ffb56b", icon: icon("icon-primal"), specificity: 3 },
  { id: "ally", name: "Você e aliados", desc: "Dano reduzido, mas fortalece a companhia.", color: "#9cffc5", icon: icon("icon-crown"), specificity: 4 },
];
export const ULTIMATE_ELEMENTS: readonly UltimateChoice<UltimateElement>[] = [
  { id: "fire", name: "Brasa", desc: "Queima e aumenta dano ao longo do tempo.", color: "#ff6f38", icon: icon("icon-primal"), specificity: 2 },
  { id: "ice", name: "Geada", desc: "Congela e controla espaço.", color: "#9beaff", icon: icon("icon-void"), specificity: 2 },
  { id: "lightning", name: "Trovão", desc: "Atinge alvos extras com eletricidade.", color: "#ffe77a", icon: icon("icon-crown"), specificity: 4 },
  { id: "nature", name: "Raiz", desc: "Recupera vida e cria domínio natural.", color: "#92f09d", icon: icon("icon-catalyst"), specificity: 3 },
  { id: "shadow", name: "Sombra", desc: "Ignora parte da resistência e oculta o conjurador.", color: "#9c8cff", icon: icon("icon-void"), specificity: 4 },
  { id: "astral", name: "Astral", desc: "Escala com qualidade e nível de maestria.", color: "#f2c1ff", icon: icon("icon-arcane"), specificity: 6 },
];
export const ULTIMATE_TRIGGERS: readonly UltimateChoice<UltimateTrigger>[] = [
  { id: "impact", name: "Ao conjurar", desc: "Efeito imediato e confiável.", color: "#ded4ff", icon: icon("icon-catalyst"), specificity: 1 },
  { id: "low-health", name: "Sob 35% HP", desc: "Só pode ser usada em situação crítica, mas fica mais forte.", color: "#ff8194", icon: icon("icon-primal"), specificity: 5 },
  { id: "combo", name: "Após combo 5", desc: "Exige domínio do combate para liberar o ritual.", color: "#ffc86d", icon: icon("icon-crown"), specificity: 5 },
  { id: "boss", name: "Contra chefe", desc: "Especializada em encontros de chefe.", color: "#c69cff", icon: icon("icon-void"), specificity: 6 },
  { id: "dodge", name: "Após esquiva", desc: "Uma janela curta recompensa timing perfeito.", color: "#9eeaff", icon: icon("icon-arcane"), specificity: 4 },
];
export const ULTIMATE_AUGMENTS: readonly UltimateChoice<UltimateAugment>[] = [
  { id: "overcharge", name: "Sobrecarga", desc: "+dano e +custo de mana.", color: "#ffcb6b", icon: icon("icon-primal"), specificity: 3 },
  { id: "rebound", name: "Rebote", desc: "Uma parte do impacto retorna ao segundo alvo.", color: "#c7a5ff", icon: icon("icon-arcane"), specificity: 5 },
  { id: "barrier", name: "Barreira", desc: "Cria proteção proporcional ao dano causado.", color: "#9eeaff", icon: icon("icon-crown"), specificity: 4 },
  { id: "summon", name: "Avatar", desc: "Invoca uma presença de curta duração.", color: "#a1ffa9", icon: icon("icon-catalyst"), specificity: 6 },
  { id: "timebreak", name: "Ruptura temporal", desc: "Reduz a recarga de habilidades após o impacto.", color: "#f1adff", icon: icon("icon-void"), specificity: 6 },
];
export const ULTIMATE_CORES: readonly UltimateChoice<UltimateCore>[] = [
  { id: "crystal", name: "Cristal", desc: "Estável e equilibrado.", color: "#c5a3ff", icon: icon("icon-catalyst"), specificity: 1 },
  { id: "heart", name: "Coração", desc: "Dá vida à habilidade e aumenta cura/escudo.", color: "#ff8b9e", icon: icon("icon-primal"), specificity: 3 },
  { id: "relic", name: "Relíquia", desc: "Poder antigo, alto risco e alto retorno.", color: "#ffda84", icon: icon("icon-crown"), specificity: 5 },
  { id: "singularity", name: "Singularidade", desc: "O núcleo mais raro e instável.", color: "#86e4ff", icon: icon("icon-void"), specificity: 8 },
];
export const ULTIMATE_ESSENCES = [
  { id: "eco_shard", name: "Fragmento de Eco", qty: 8, specificity: 2 },
  { id: "void_essence", name: "Essência do Vazio", qty: 3, specificity: 5 },
  { id: "mana_shard", name: "Fragmento de Mana", qty: 18, specificity: 2 },
  { id: "elixir", name: "Elixir Condensado", qty: 2, specificity: 6 },
] as const;
const ELEMENT_REAGENTS: Record<UltimateElement, { id: string; name: string }> = {
  fire: { id: "coal", name: "Carvão Incandescente" }, ice: { id: "frost_herb", name: "Erva Gélida" }, lightning: { id: "mana_shard", name: "Fragmento de Mana" },
  nature: { id: "herb", name: "Erva Medicinal" }, shadow: { id: "goo", name: "Esporo" }, astral: { id: "crystal_ore", name: "Cristal de Mana" },
};

export function freshUltimate(): UltimateBuild | null { return null; }
export function ultimateChoices<T extends string>(list: readonly UltimateChoice<T>[], id: T): UltimateChoice<T> { return list.find((choice) => choice.id === id) ?? list[0]!; }
const oneOf = <T extends string>(list: readonly UltimateChoice<T>[], value: unknown, fallback: T) => typeof value === "string" && list.some((x) => x.id === value) ? value as T : fallback;
export function normalizeUltimate(value: unknown): UltimateBuild | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<UltimateBuild>;
  if (!v.name || typeof v.name !== "string") return null;
  const school = oneOf(ULTIMATE_SCHOOLS, v.school, "arcane"), form = oneOf(ULTIMATE_FORMS, v.form, "nova"), modifier = oneOf(ULTIMATE_MODIFIERS, v.modifier, "pierce"), target = oneOf(ULTIMATE_TARGETS, v.target, "area");
  const element = oneOf(ULTIMATE_ELEMENTS, v.element, "astral");
  const trigger = oneOf(ULTIMATE_TRIGGERS, v.trigger, "impact"), augment = oneOf(ULTIMATE_AUGMENTS, v.augment, "overcharge"), core = oneOf(ULTIMATE_CORES, v.core, "crystal");
  if (typeof v.essence !== "string") return null;
  return { name: v.name.slice(0, 32), school, form, modifier, target, element, trigger, augment, core, essence: v.essence, quality: Math.max(0, Math.min(100, Math.floor(Number(v.quality) || 0))), stability: Math.max(0, Math.min(100, Math.floor(Number(v.stability) || 50))), tier: v.tier === "Mítico" || v.tier === "Lendário" || v.tier === "Épico" ? v.tier : "Raro", damage: Math.max(1, Math.floor(Number(v.damage) || 1)), radius: Math.max(12, Math.floor(Number(v.radius) || 12)), cooldown: Math.max(1, Number(v.cooldown) || 1), mpCost: Math.max(1, Math.floor(Number(v.mpCost) || 1)), charges: Math.max(1, Math.floor(Number(v.charges) || 1)), masteryGain: Math.max(1, Math.floor(Number(v.masteryGain) || 1)), createdAtLevel: Math.max(1, Math.floor(Number(v.createdAtLevel) || 1)), blueprintId: typeof v.blueprintId === "string" ? v.blueprintId : `${school}-${form}-${element}` };
}

export function calculateUltimateCost(g: Game, build: Pick<UltimateBuild, "school" | "form" | "modifier" | "target" | "essence" | "element" | "trigger" | "augment" | "core">) {
  const ids = [
    ultimateChoices(ULTIMATE_SCHOOLS, build.school), ultimateChoices(ULTIMATE_FORMS, build.form), ultimateChoices(ULTIMATE_MODIFIERS, build.modifier), ultimateChoices(ULTIMATE_TARGETS, build.target),
    ultimateChoices(ULTIMATE_ELEMENTS, build.element), ultimateChoices(ULTIMATE_TRIGGERS, build.trigger), ultimateChoices(ULTIMATE_AUGMENTS, build.augment), ultimateChoices(ULTIMATE_CORES, build.core),
  ];
  const specificity = ids.reduce((sum, choice) => sum + choice.specificity, 0), level = Math.max(1, g.p.level), essence = ULTIMATE_ESSENCES.find((x) => x.id === build.essence) ?? ULTIMATE_ESSENCES[0]!, reagent = ELEMENT_REAGENTS[build.element];
  return { gold: 900 + specificity * 410 + level * 115, mana: 45 + specificity * 11, essenceQty: Math.max(1, Math.ceil((specificity + essence.specificity) / 6)), materialQty: 10 + specificity * 2, reagentQty: 4 + Math.ceil(specificity / 3), reagentId: reagent.id, reagentName: reagent.name, specificity, stability: Math.max(18, 100 - specificity * 2 - ultimateChoices(ULTIMATE_CORES, build.core).specificity * 2) };
}

export function craftUltimate(g: Game, draft: { name: string; school: UltimateSchool; form: UltimateForm; modifier: UltimateModifier; target: UltimateTarget; essence: string; element: UltimateElement; trigger: UltimateTrigger; augment: UltimateAugment; core: UltimateCore }): { ok: boolean; message: string; ultimate: UltimateBuild | null } {
  if (g.p.level < 8) return { ok: false, message: "O núcleo ainda não suporta uma Ultimate. Requer nível 8.", ultimate: null };
  const cost = calculateUltimateCost(g, draft), essence = ULTIMATE_ESSENCES.find((x) => x.id === draft.essence) ?? ULTIMATE_ESSENCES[0]!, missing: string[] = [];
  if (g.p.gold < cost.gold) missing.push(`${cost.gold - g.p.gold} ouro`); if (g.p.mp < cost.mana) missing.push(`${cost.mana - Math.floor(g.p.mp)} mana`); if (g.count(essence.id) < cost.essenceQty) missing.push(`${cost.essenceQty - g.count(essence.id)} ${essence.name}`); if (g.count("crystal_ore") < cost.materialQty) missing.push(`${cost.materialQty - g.count("crystal_ore")} Cristal de Mana`); if (g.count(cost.reagentId) < cost.reagentQty) missing.push(`${cost.reagentQty - g.count(cost.reagentId)} ${cost.reagentName}`);
  if (missing.length) return { ok: false, message: `O ritual falhou. Faltam: ${missing.join(" · ")}.`, ultimate: null };
  const mastery = Math.max(0, Math.floor(Number(g.p.ultimateMastery) || 0)), quality = Math.min(100, 28 + cost.specificity * 5 + essence.specificity * 4 + Math.min(18, Math.floor(g.p.level / 2)) + Math.min(12, Math.floor(mastery / 3))), tier: UltimateTier = quality >= 91 ? "Mítico" : quality >= 76 ? "Lendário" : quality >= 60 ? "Épico" : "Raro";
  const damage = Math.round((g.stats().int + g.stats().str + g.p.level * 3 + mastery) * (1 + quality / 62) * (draft.augment === "overcharge" ? 1.2 : 1));
  const blueprintId = [draft.school, draft.form, draft.element, draft.modifier, draft.trigger, draft.augment, draft.core].join(":");
  const ultimate: UltimateBuild = { ...draft, name: draft.name.trim().slice(0, 32) || "Ultimate sem nome", essence: essence.id, quality, stability: cost.stability, tier, damage, radius: draft.target === "single" ? 36 : draft.target === "area" ? 82 : draft.target === "cone" ? 110 : 150, cooldown: Math.max(18, 54 - Math.floor(quality / 4)), mpCost: cost.mana + (draft.augment === "overcharge" ? 12 : 0), charges: draft.core === "singularity" ? 1 : 2, masteryGain: Math.max(1, Math.floor(quality / 18)), createdAtLevel: g.p.level, blueprintId };
  g.p.gold -= cost.gold; g.p.mp -= cost.mana; g.removeItem(essence.id, cost.essenceQty); g.removeItem("crystal_ore", cost.materialQty); g.removeItem(cost.reagentId, cost.reagentQty); g.p.ultimate = ultimate; g.p.ultimateMastery = mastery + ultimate.masteryGain; g.p.ultimateBlueprints = Array.from(new Set([...(Array.isArray(g.p.ultimateBlueprints) ? g.p.ultimateBlueprints : []), blueprintId])).slice(-24); g.save();
  return { ok: true, message: `${tier}! ${ultimate.name} foi gravada com ${ultimate.stability}% de estabilidade.`, ultimate };
}

export function castUltimate(g: Game): string | null {
  const ultimate = normalizeUltimate(g.p.ultimate); if (!ultimate) return "Crie uma Ultimate antes de conjurá-la."; if (g.p.spellCd > 0) return "O núcleo ainda está em recarga."; if (g.p.mp < ultimate.mpCost) return `Sem mana suficiente. Requer ${ultimate.mpCost} MP.`;
  g.p.mp -= ultimate.mpCost; g.p.spellCd = ultimate.cooldown; g.p.attackT = 1; const cx = g.p.x, cy = g.p.y - 8, nearest = g.enemies.filter((e) => e.alive && Math.hypot(e.x - cx, e.y - cy) < 240).sort((x, y) => Math.hypot(x.x - cx, x.y - cy) - Math.hypot(y.x - cx, y.y - cy))[0];
  const bonus = ultimate.element === "fire" ? 1.15 : ultimate.element === "astral" ? 1 + Math.min(.3, (Number(g.p.ultimateMastery) || 0) / 100) : 1, hit = (enemy: (typeof g.enemies)[number]) => { if (enemy.alive) g.damageEnemy(enemy, ultimate.damage * bonus * (ultimate.modifier === "pierce" ? 1.35 : ultimate.modifier === "execute" && enemy.hp / enemy.maxhp < .3 ? 1.8 : 1), 0, 0, ultimate.tier === "Mítico" ? "#fff0a0" : "#c99cff"); };
  const targets = g.enemies.filter((e) => e.alive && (ultimate.target === "single" ? e === nearest : ultimate.target === "area" ? Math.hypot(e.x - cx, e.y - cy) < ultimate.radius : ultimate.target === "cone" ? Math.abs(e.x - cx) < ultimate.radius && Math.abs(e.y - cy) < ultimate.radius / 2 : true)); targets.forEach(hit);
  if (ultimate.modifier === "drain" || ultimate.element === "nature") g.p.hp = Math.min(g.maxHp(), g.p.hp + Math.round(ultimate.damage * targets.length * .12)); if (ultimate.modifier === "freeze" || ultimate.element === "ice") targets.forEach((e) => { e.slow = 3.5; }); if (ultimate.modifier === "echo" || ultimate.augment === "rebound") window.setTimeout(() => targets.filter((e) => e.alive).forEach((e) => hit(e)), 500); if (ultimate.augment === "barrier") g.buffs.shield = Math.max(g.buffs.shield, 4); if (ultimate.modifier === "silence" || ultimate.trigger === "boss") targets.filter((e) => e.boss).forEach((e) => { e.cd += 1.5; });
  g.burst(cx, cy, ultimate.tier === "Mítico" ? "#fff0a0" : "#c99cff", 72, 190, 3, -80); g.float(cx, cy - 36, ultimate.name, "#fff0a0"); g.audio.sfx("level"); g.save(); return null;
}
