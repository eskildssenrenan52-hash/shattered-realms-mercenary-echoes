import { useMemo, useState, type CSSProperties } from "react";
import { Modal, Section } from "@/components/GameModal";
import { Button } from "@/components/ui/button";
import type { Game } from "@/odyssey/engine";
import { calculateUltimateCost, craftUltimate, ULTIMATE_ESSENCES, ULTIMATE_FORMS, ULTIMATE_MODIFIERS, ULTIMATE_SCHOOLS, ULTIMATE_TARGETS, ULTIMATE_ELEMENTS, ULTIMATE_TRIGGERS, ULTIMATE_AUGMENTS, ULTIMATE_CORES, type UltimateElement, type UltimateForm, type UltimateModifier, type UltimateSchool, type UltimateTarget, type UltimateTrigger, type UltimateAugment, type UltimateCore } from "@/odyssey/ultimate-creator";

function Choice<T extends string>({ value, options, onChange }: { value: T; options: readonly { id: T; name: string; desc: string; color: string; icon: string }[]; onChange: (id: T) => void }) {
  return <div className="ultimate-choice-grid">{options.map((option) => <button type="button" key={option.id} className={`ultimate-choice ${value === option.id ? "is-selected" : ""}`} style={{ "--ultimate-color": option.color } as CSSProperties} onClick={() => onChange(option.id)}><img src={option.icon} alt="" /><span><b>{option.name}</b><small>{option.desc}</small></span></button>)}</div>;
}

export function UltimateCreatorPanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [name, setName] = useState(g.p.ultimate?.name ?? "");
  const [school, setSchool] = useState<UltimateSchool>(g.p.ultimate?.school ?? "arcane");
  const [form, setForm] = useState<UltimateForm>(g.p.ultimate?.form ?? "nova");
  const [modifier, setModifier] = useState<UltimateModifier>(g.p.ultimate?.modifier ?? "pierce");
  const [target, setTarget] = useState<UltimateTarget>(g.p.ultimate?.target ?? "area");
  const [element, setElement] = useState<UltimateElement>(g.p.ultimate?.element ?? "astral");
  const [trigger, setTrigger] = useState<UltimateTrigger>(g.p.ultimate?.trigger ?? "impact");
  const [augment, setAugment] = useState<UltimateAugment>(g.p.ultimate?.augment ?? "overcharge");
  const [core, setCore] = useState<UltimateCore>(g.p.ultimate?.core ?? "crystal");
  const [essence, setEssence] = useState(g.p.ultimate?.essence ?? "void_essence");
  const [msg, setMsg] = useState("");
  const cost = useMemo(() => calculateUltimateCost(g, { school, form, modifier, target, element, trigger, augment, core, essence }), [g, school, form, modifier, target, element, trigger, augment, core, essence]);
  const selectedEssence = ULTIMATE_ESSENCES.find((x) => x.id === essence) ?? ULTIMATE_ESSENCES[0]!;
  const precision = Math.min(100, 28 + cost.specificity * 5 + selectedEssence.specificity * 4 + Math.min(18, Math.floor(g.p.level / 2)) + Math.min(12, Math.floor((g.p.ultimateMastery ?? 0) / 3)));
  const craft = () => { const result = craftUltimate(g, { name, school, form, modifier, target, element, trigger, augment, core, essence }); setMsg(result.message); if (result.ok) setName(result.ultimate?.name ?? name); };
  return <Modal title="Ultimate Creator · Forja do impossível" onClose={onClose} wide overlayClassName="ultimate-modal-overlay">
    <div className="ultimate-hero"><div><div className="ultimate-kicker">RITUAL DE NÚCLEO · REQUER NÍVEL 8 · {g.p.ultimateMastery ?? 0} MAESTRIA</div><h2>Crie uma habilidade que ninguém mais possui.</h2><p>Agora são nove eixos de composição. Especificidade aumenta poder, mas núcleos raros reduzem estabilidade e exigem reagentes próprios.</p></div><img src="/assets/ultimate/icon-crown.png" alt="Núcleo de maestria" /></div>
    <Section title="Nome da assinatura" aside="até 32 caracteres"><input className="ultimate-name-input" value={name} maxLength={32} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Eclipse da Última Aurora" /></Section>
    <Section title="1 · Escola de poder"><Choice value={school} options={ULTIMATE_SCHOOLS} onChange={setSchool} /></Section>
    <Section title="2 · Forma da conjuração"><Choice value={form} options={ULTIMATE_FORMS} onChange={setForm} /></Section>
    <Section title="3 · Modificador raro"><Choice value={modifier} options={ULTIMATE_MODIFIERS} onChange={setModifier} /></Section>
    <Section title="4 · Alvo e escala"><Choice value={target} options={ULTIMATE_TARGETS} onChange={setTarget} /></Section>
    <Section title="5 · Elemento"><Choice value={element} options={ULTIMATE_ELEMENTS} onChange={setElement} /></Section>
    <Section title="6 · Gatilho de domínio"><Choice value={trigger} options={ULTIMATE_TRIGGERS} onChange={setTrigger} /></Section>
    <Section title="7 · Augmento avançado"><Choice value={augment} options={ULTIMATE_AUGMENTS} onChange={setAugment} /></Section>
    <Section title="8 · Núcleo do ritual"><Choice value={core} options={ULTIMATE_CORES} onChange={setCore} /></Section>
    <Section title="9 · Essência do núcleo"><div className="ultimate-essence-grid">{ULTIMATE_ESSENCES.map((item) => <button type="button" key={item.id} className={`ultimate-essence ${essence === item.id ? "is-selected" : ""}`} onClick={() => setEssence(item.id)}><img src="/assets/ultimate/icon-catalyst.png" alt="" /><span><b>{item.name}</b><small>Você tem {g.count(item.id)} · requer {cost.essenceQty}</small></span></button>)}</div></Section>
    <div className="ultimate-forge-readout"><div className="ultimate-quality"><span>Qualidade prevista · estabilidade {cost.stability}%</span><strong style={{ width: `${precision}%` }} /><b>{precision >= 91 ? "Mítico" : precision >= 76 ? "Lendário" : precision >= 60 ? "Épico" : "Raro"} · {precision}%</b><small>Reagente: {cost.reagentName} · {g.count(cost.reagentId)}/{cost.reagentQty}</small></div><div className="ultimate-costs"><span>🜂 {cost.gold} ouro</span><span>✦ {cost.mana} mana</span><span>◆ {cost.essenceQty} essência</span><span>◇ {cost.materialQty} cristal</span><span>☉ {cost.reagentQty} reagente</span></div></div>
    {msg && <div className="modal-hint ultimate-message" role="status">{msg}</div>}
    {g.p.ultimate && <div className="ultimate-current"><img src="/assets/ultimate/icon-crown.png" alt="" /><div><b>{g.p.ultimate.name}</b><small>{g.p.ultimate.tier} · {g.p.ultimate.quality}% · estabilidade {g.p.ultimate.stability}% · dano {g.p.ultimate.damage} · recarga {g.p.ultimate.cooldown}s</small><small>Blueprints arquivados: {g.p.ultimateBlueprints?.length ?? 0} · maestria: {g.p.ultimateMastery ?? 0}</small></div><Button variant="secondary" onClick={() => { const error = g.castUltimate(); setMsg(error ?? "Ultimate conjurada!"); }}>Conjurar</Button></div>}
    <Button className="ultimate-forge-button" disabled={g.p.level < 8 || !name.trim()} onClick={craft}>Forjar assinatura · consumir recursos</Button>
  </Modal>;
}
