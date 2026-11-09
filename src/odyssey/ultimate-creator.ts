import type { Game } from "./engine";

export type UltimateSchool = "arcane" | "primal" | "void";
export type UltimateForm = "nova" | "beam" | "storm" | "guardian";
export type UltimateModifier = "pierce" | "drain" | "freeze" | "echo";
export type UltimateTarget = "single" | "area" | "all";

export interface UltimateBuild {
  name: string;
  school: UltimateSchool;
  form: UltimateForm;
  modifier: UltimateModifier;
  target: UltimateTarget;
  essence: string;
  quality: number;
  tier: "Raro" | "Épico" | "Lendário" | "Mítico";
  damage: number;
  radius: number;
  cooldown: number;
  mpCost: number;
  charges: number;
  createdAtLevel: number;
}

export interface UltimateChoice<T extends string> { id: T; name: string; desc: string; color: string; icon: string; specificity: number }

export const ULTIMATE_SCHOOLS: readonly UltimateChoice<UltimateSchool>[] = [
  { id: "arcane", name: "Arcanismo", desc: "Converte inteligência e mana em dano preciso.", color: "#b596ff", icon: "/assets/ultimate/icon-arcane.png", specificity: 2 },
  { id: "primal", name: "Primordial", desc: "Ataque brutal que cresce com força e vitalidade.", color: "#ff9a62", icon: "/assets/ultimate/icon-primal.png", specificity: 2 },
  { id: "void", name: "Vazio", desc: "Rasga defesas e recompensa combinações raras.", color: "#76d8ff", icon: "/assets/ultimate/icon-void.png", specificity: 3 },
];
export const ULTIMATE_FORMS: readonly UltimateChoice<UltimateForm>[] = [
  { id: "nova", name: "Nova", desc: "Explosão circular imediata.", color: "#ffd080", icon: "/assets/ultimate/icon-catalyst.png", specificity: 1 },
  { id: "beam", name: "Lança", desc: "Golpe concentrado no alvo mais próximo.", color: "#8ce8ff", icon: "/assets/ultimate/icon-arcane.png", specificity: 3 },
  { id: "storm", name: "Tempestade", desc: "Vários impactos em uma área persistente.", color: "#dca8ff", icon: "/assets/ultimate/icon-void.png", specificity: 4 },
  { id: "guardian", name: "Guardião", desc: "Dano e proteção numa conjuração defensiva.", color: "#9cffb7", icon: "/assets/ultimate/icon-crown.png", specificity: 4 },
];
export const ULTIMATE_MODIFIERS: readonly UltimateChoice<UltimateModifier>[] = [
  { id: "pierce", name: "Perfurante", desc: "Ignora parte da defesa inimiga.", color: "#ffcf74", icon: "/assets/ultimate/icon-primal.png", specificity: 3 },
  { id: "drain", name: "Sanguessuga", desc: "Converte uma fração do dano em cura.", color: "#ff7d9b", icon: "/assets/ultimate/icon-catalyst.png", specificity: 3 },
  { id: "freeze", name: "Congelante", desc: "Reduz a velocidade dos sobreviventes.", color: "#83eaff", icon: "/assets/ultimate/icon-void.png", specificity: 2 },
  { id: "echo", name: "Eco Duplo", desc: "Repete uma parte do impacto depois de um atraso.", color: "#c99cff", icon: "/assets/ultimate/icon-arcane.png", specificity: 5 },
];
export const ULTIMATE_TARGETS: readonly UltimateChoice<UltimateTarget>[] = [
  { id: "single", name: "Um alvo", desc: "Máxima potência contra um inimigo.", color: "#ff927e", icon: "/assets/ultimate/icon-primal.png", specificity: 1 },
  { id: "area", name: "Área", desc: "Equilíbrio entre alcance e dano.", color: "#ffd080", icon: "/assets/ultimate/icon-catalyst.png", specificity: 2 },
  { id: "all", name: "Todos na tela", desc: "Alcance extremo, custo e recarga altos.", color: "#b896ff", icon: "/assets/ultimate/icon-void.png", specificity: 5 },
];

export const ULTIMATE_ESSENCES = [
  { id: "eco_shard", name: "Fragmento de Eco", qty: 8, specificity: 2 },
  { id: "void_essence", name: "Essência do Vazio", qty: 3, specificity: 5 },
  { id: "mana_shard", name: "Fragmento de Mana", qty: 18, specificity: 2 },
] as const;

export function freshUltimate(): UltimateBuild | null { return null; }
export function ultimateChoices<T extends string>(list: readonly UltimateChoice<T>[], id: T): UltimateChoice<T> { return list.find((choice) => choice.id === id) ?? list[0]!; }
export function normalizeUltimate(value: unknown): UltimateBuild | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<UltimateBuild>;
  if (!v.name || typeof v.name !== "string" || !ULTIMATE_SCHOOLS.some((x) => x.id === v.school) || !ULTIMATE_FORMS.some((x) => x.id === v.form) || !ULTIMATE_MODIFIERS.some((x) => x.id === v.modifier) || !ULTIMATE_TARGETS.some((x) => x.id === v.target) || typeof v.essence !== "string") return null;
  return { name: v.name.slice(0, 32), school: v.school!, form: v.form!, modifier: v.modifier!, target: v.target!, essence: v.essence, quality: Math.max(0, Math.min(100, Math.floor(Number(v.quality) || 0))), tier: v.tier === "Mítico" || v.tier === "Lendário" || v.tier === "Épico" ? v.tier : "Raro", damage: Math.max(1, Math.floor(Number(v.damage) || 1)), radius: Math.max(12, Math.floor(Number(v.radius) || 12)), cooldown: Math.max(1, Number(v.cooldown) || 1), mpCost: Math.max(1, Math.floor(Number(v.mpCost) || 1)), charges: Math.max(1, Math.floor(Number(v.charges) || 1)), createdAtLevel: Math.max(1, Math.floor(Number(v.createdAtLevel) || 1)) };
}

export function calculateUltimateCost(g: Game, build: Pick<UltimateBuild, "school" | "form" | "modifier" | "target" | "essence">) {
  const school = ultimateChoices(ULTIMATE_SCHOOLS, build.school), form = ultimateChoices(ULTIMATE_FORMS, build.form), modifier = ultimateChoices(ULTIMATE_MODIFIERS, build.modifier), target = ultimateChoices(ULTIMATE_TARGETS, build.target);
  const precision = school.specificity + form.specificity + modifier.specificity + target.specificity;
  const level = Math.max(1, g.p.level);
  return { gold: 750 + precision * 325 + level * 90, mana: 35 + precision * 9, essenceQty: Math.max(1, Math.ceil(precision / 3)), materialQty: 8 + precision * 2, specificity: precision };
}

export function craftUltimate(g: Game, draft: { name: string; school: UltimateSchool; form: UltimateForm; modifier: UltimateModifier; target: UltimateTarget; essence: string }): { ok: boolean; message: string; ultimate: UltimateBuild | null } {
  const cost = calculateUltimateCost(g, draft);
  const essence = ULTIMATE_ESSENCES.find((x) => x.id === draft.essence) ?? ULTIMATE_ESSENCES[0]!;
  const missing: string[] = [];
  if (g.p.gold < cost.gold) missing.push(`${cost.gold - g.p.gold} ouro`);
  if (g.p.mp < cost.mana) missing.push(`${cost.mana - Math.floor(g.p.mp)} mana`);
  if (g.count(essence.id) < cost.essenceQty) missing.push(`${cost.essenceQty - g.count(essence.id)} ${essence.name}`);
  if (g.count("crystal_ore") < cost.materialQty) missing.push(`${cost.materialQty - g.count("crystal_ore")} Cristal de Mana`);
  if (missing.length) return { ok: false, message: `O ritual falhou. Faltam: ${missing.join(" · ")}.`, ultimate: null };
  if (g.p.level < 8) return { ok: false, message: "O núcleo ainda não suporta uma Ultimate. Requer nível 8.", ultimate: null };
  const quality = Math.min(100, 34 + cost.specificity * 8 + (essence.specificity * 5) + Math.min(15, Math.floor(g.p.level / 2)));
  const tier = quality >= 91 ? "Mítico" : quality >= 76 ? "Lendário" : quality >= 60 ? "Épico" : "Raro";
  const damage = Math.round((g.stats().int + g.stats().str + g.p.level * 3) * (1 + quality / 70));
  const ultimate: UltimateBuild = { ...draft, name: draft.name.trim().slice(0, 32) || "Ultimate sem nome", essence: essence.id, quality, tier, damage, radius: draft.target === "single" ? 36 : draft.target === "area" ? 82 : 150, cooldown: 42 - Math.min(14, Math.floor(quality / 8)), mpCost: cost.mana, charges: 1, createdAtLevel: g.p.level };
  g.p.gold -= cost.gold; g.p.mp -= cost.mana; g.removeItem(essence.id, cost.essenceQty); g.removeItem("crystal_ore", cost.materialQty); g.p.ultimate = ultimate; g.save();
  return { ok: true, message: `${tier}! ${ultimate.name} foi gravada no seu núcleo.`, ultimate };
}

export function castUltimate(g: Game): string | null {
  const ultimate = normalizeUltimate(g.p.ultimate); if (!ultimate) return "Crie uma Ultimate antes de conjurá-la.";
  if (g.p.spellCd > 0) return "O núcleo ainda está em recarga.";
  if (g.p.mp < ultimate.mpCost) return `Sem mana suficiente. Requer ${ultimate.mpCost} MP.`;
  g.p.mp -= ultimate.mpCost; g.p.spellCd = ultimate.cooldown; g.p.attackT = 1;
  const cx = g.p.x, cy = g.p.y - 8;
  const nearest = g.enemies.filter((e) => e.alive && Math.hypot(e.x - cx, e.y - cy) < 240).sort((x, y) => Math.hypot(x.x - cx, x.y - cy) - Math.hypot(y.x - cx, y.y - cy))[0];
  const hit = (enemy: (typeof g.enemies)[number]) => { if (enemy.alive) g.damageEnemy(enemy, ultimate.damage * (ultimate.modifier === "pierce" ? 1.35 : 1), 0, 0, ultimate.tier === "Mítico" ? "#fff0a0" : "#c99cff"); };
  const targets = g.enemies.filter((e) => e.alive && (ultimate.target === "single" ? e === nearest : ultimate.target === "area" ? Math.hypot(e.x - cx, e.y - cy) < ultimate.radius : true));
  targets.forEach(hit);
  if (ultimate.modifier === "drain") g.p.hp = Math.min(g.maxHp(), g.p.hp + Math.round(ultimate.damage * targets.length * 0.12));
  if (ultimate.modifier === "freeze") targets.forEach((e) => { e.slow = 3.5; });
  if (ultimate.modifier === "echo") window.setTimeout(() => targets.filter((e) => e.alive).forEach((e) => hit(e)), 500);
  g.burst(cx, cy, ultimate.tier === "Mítico" ? "#fff0a0" : "#c99cff", 72, 190, 3, -80); g.float(cx, cy - 36, ultimate.name, "#fff0a0"); g.audio.sfx("level"); g.save(); return null;
}
