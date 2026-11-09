import { useMemo, useState, type CSSProperties } from "react";
import { Modal, Section } from "@/components/GameModal";
import { Button } from "@/components/ui/button";
import type { Game } from "@/odyssey/engine";
import { calculateUltimateCost, craftUltimate, ULTIMATE_ESSENCES, ULTIMATE_FORMS, ULTIMATE_MODIFIERS, ULTIMATE_SCHOOLS, ULTIMATE_TARGETS, type UltimateForm, type UltimateModifier, type UltimateSchool, type UltimateTarget } from "@/odyssey/ultimate-creator";

function Choice<T extends string>({ value, options, onChange }: { value: T; options: readonly { id: T; name: string; desc: string; color: string; icon: string }[]; onChange: (id: T) => void }) {
  return <div className="ultimate-choice-grid">{options.map((option) => <button type="button" key={option.id} className={`ultimate-choice ${value === option.id ? "is-selected" : ""}`} style={{ "--ultimate-color": option.color } as CSSProperties} onClick={() => onChange(option.id)}><img src={option.icon} alt="" /><span><b>{option.name}</b><small>{option.desc}</small></span></button>)}</div>;
}

export function UltimateCreatorPanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [name, setName] = useState(g.p.ultimate?.name ?? "");
  const [school, setSchool] = useState<UltimateSchool>(g.p.ultimate?.school ?? "arcane");
  const [form, setForm] = useState<UltimateForm>(g.p.ultimate?.form ?? "nova");
  const [modifier, setModifier] = useState<UltimateModifier>(g.p.ultimate?.modifier ?? "pierce");
  const [target, setTarget] = useState<UltimateTarget>(g.p.ultimate?.target ?? "area");
  const [essence, setEssence] = useState(g.p.ultimate?.essence ?? "void_essence");
  const [msg, setMsg] = useState("");
  const cost = useMemo(() => calculateUltimateCost(g, { school, form, modifier, target, essence }), [g, school, form, modifier, target, essence]);
  const selectedEssence = ULTIMATE_ESSENCES.find((x) => x.id === essence) ?? ULTIMATE_ESSENCES[0]!;
  const precision = Math.min(100, 34 + cost.specificity * 8 + selectedEssence.specificity * 5 + Math.min(15, Math.floor(g.p.level / 2)));
  const craft = () => { const result = craftUltimate(g, { name, school, form, modifier, target, essence }); setMsg(result.message); if (result.ok) setName(result.ultimate?.name ?? name); };
  return <Modal title="Ultimate Creator · Forja do impossível" onClose={onClose} wide overlayClassName="ultimate-modal-overlay">
    <div className="ultimate-hero"><div><div className="ultimate-kicker">RITUAL DE NÚCLEO · REQUER NÍVEL 8</div><h2>Crie uma habilidade que ninguém mais possui.</h2><p>Quanto mais específica a combinação, maior a qualidade. O ritual consome recursos reais e não pode ser desfeito.</p></div><img src="/assets/ultimate/icon-crown.png" alt="Núcleo de maestria" /></div>
    <Section title="Nome da assinatura" aside="até 32 caracteres"><input className="ultimate-name-input" value={name} maxLength={32} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Eclipse da Última Aurora" /></Section>
    <Section title="1 · Escola de poder"><Choice value={school} options={ULTIMATE_SCHOOLS} onChange={setSchool} /></Section>
    <Section title="2 · Forma da conjuração"><Choice value={form} options={ULTIMATE_FORMS} onChange={setForm} /></Section>
    <Section title="3 · Modificador raro"><Choice value={modifier} options={ULTIMATE_MODIFIERS} onChange={setModifier} /></Section>
    <Section title="4 · Alvo e escala"><Choice value={target} options={ULTIMATE_TARGETS} onChange={setTarget} /></Section>
    <Section title="5 · Essência do núcleo"><div className="ultimate-essence-grid">{ULTIMATE_ESSENCES.map((item) => <button type="button" key={item.id} className={`ultimate-essence ${essence === item.id ? "is-selected" : ""}`} onClick={() => setEssence(item.id)}><img src="/assets/ultimate/icon-catalyst.png" alt="" /><span><b>{item.name}</b><small>Você tem {g.count(item.id)} · requer {cost.essenceQty}</small></span></button>)}</div></Section>
    <div className="ultimate-forge-readout"><div className="ultimate-quality"><span>Previsão de qualidade</span><strong style={{ width: `${precision}%` }} /><b>{precision >= 91 ? "Mítico" : precision >= 76 ? "Lendário" : precision >= 60 ? "Épico" : "Raro"} · {precision}%</b></div><div className="ultimate-costs"><span>🜂 {cost.gold} ouro</span><span>✦ {cost.mana} mana</span><span>◆ {cost.essenceQty} essência</span><span>◇ {cost.materialQty} cristal</span></div></div>
    {msg && <div className="modal-hint ultimate-message" role="status">{msg}</div>}
    {g.p.ultimate && <div className="ultimate-current"><img src="/assets/ultimate/icon-crown.png" alt="" /><div><b>{g.p.ultimate.name}</b><small>{g.p.ultimate.tier} · {g.p.ultimate.quality}% · dano {g.p.ultimate.damage} · recarga {g.p.ultimate.cooldown}s</small></div><Button variant="secondary" onClick={() => { const error = g.castUltimate(); setMsg(error ?? "Ultimate conjurada!"); }}>Conjurar</Button></div>}
    <Button className="ultimate-forge-button" disabled={g.p.level < 8 || !name.trim()} onClick={craft}>Forjar assinatura · consumir recursos</Button>
  </Modal>;
}
