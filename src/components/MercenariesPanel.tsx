import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal, Section, Meter } from "@/components/GameModal";
import { MERCENARIES, MERC_BY_ID, MERC_RARITY, assignMercenary, dismissMercenary, mercenaryStory, rollMercenary, type MercRarity } from "@/odyssey/mercenaries";
import type { Game } from "@/odyssey/engine";

function Portrait({ id, size = 76 }: { id: string; size?: number }) {
  const d = MERC_BY_ID[id];
  return <img src={d?.portrait} alt={`Retrato de ${d?.name}`} className="game-frame object-cover" style={{ width: size, height: size, imageRendering: "auto" }} />;
}
function rarityLabel(r: MercRarity) { return <span style={{ color: MERC_RARITY[r].color }}>{MERC_RARITY[r].label}</span>; }

export function MercenariesPanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [, refresh] = useState(0);
  const [message, setMessage] = useState("");
  const update = (text: string) => { setMessage(text); refresh((x) => x + 1); g.save(); };
  const roll = (currency: "gold" | "seal") => { const d = rollMercenary(g, currency); update(d ? `${d.name}: ${d.title}. ${d.contract}` : currency === "gold" ? "O contrato exige 140 ouro." : "Você não tem selos de contrato suficientes."); };
  const active = g.mercenaries.active;
  return <Modal title="Companhia · Contratos e Juramentos" onClose={onClose} wide>
    <div className="modal-hint">Até dois mercenários podem lutar ao seu lado. Eles têm HP próprio, podem ser atingidos e recuam ao chegar a 15% de vida. A recuperação é lenta e continua mesmo quando você fecha este painel.</div>
    <div className="modal-cols">
      <Section title="Agência de contratos" aside={`${g.mercenaries.contractSeals} selos`}>
        <div className="game-panel p-2 space-y-2">
          <div className="flex justify-between text-[11px]"><span>Gacha interno · pity {g.mercenaries.pity}/10</span><span>{g.mercenaries.totalRolls} contratos</span></div>
          <p className="font-body text-base opacity-80">Os selos vêm de chefes. Ouro paga contratos comuns. A décima tentativa garante uma raridade Raro ou superior; não há dinheiro real, compras externas ou energia limitada.</p>
          <div className="flex flex-wrap gap-1"><Button variant="game" className="game-btn" onClick={() => roll("gold")} disabled={g.p.gold < 140}>Contratar · 140 ouro</Button><Button variant="game" className="game-btn" onClick={() => roll("seal")} disabled={g.mercenaries.contractSeals < 1}>Usar 1 selo</Button></div>
          {message && <div className="text-[11px] text-primary">{message}</div>}
        </div>
        <div className="modal-section-title mt-3"><span>Dupla em campo</span><small>{active.filter(Boolean).length}/2</small></div>
        <div className="grid grid-cols-2 gap-2">{active.map((id, slot) => <div key={slot} className="game-panel p-2 min-h-28">{id ? <><div className="flex gap-2"><Portrait id={id} size={48} /><div><b>{MERC_BY_ID[id]!.name}</b><div className="text-[10px]">{MERC_BY_ID[id]!.role} · {rarityLabel(MERC_BY_ID[id]!.rarity)}</div><Meter value={g.mercenaries.roster.find((m) => m.id === id)?.hp ?? 0} max={MERC_BY_ID[id]!.maxHp + (g.mercenaries.roster.find((m) => m.id === id)?.level ?? 1) * 8} /></div></div><Button variant="outline" size="sm" className="mt-2" onClick={() => { dismissMercenary(g, slot as 0 | 1); update("Mercenário enviado à reserva."); }}>Retirar</Button></> : <div className="opacity-60 text-[11px]">Slot vazio<br />Escolha alguém do roster abaixo.</div>}</div>)}</div>
      </Section>
      <Section title="Roster e histórias" aside={`${g.mercenaries.roster.length}/${MERCENARIES.length}`}>
        <div className="row-list max-h-[55vh] overflow-auto">{MERCENARIES.map((def) => { const m = g.mercenaries.roster.find((x) => x.id === def.id); const busy = active.includes(def.id); const recovery = m && (m.state === "recuando" || m.state === "recuperando"); return <div key={def.id} className={`game-panel p-2 ${m ? "" : "opacity-70"}`}><div className="flex gap-2"><Portrait id={def.id} size={64} /><div className="flex-1"><div className="flex justify-between"><b>{def.name}</b><span>{rarityLabel(def.rarity)}</span></div><div className="text-[10px] opacity-70">{def.title} · {def.role} · {def.element}</div><p className="font-body text-sm mt-1">{m ? mercenaryStory(def.id, m.storyBeat) : def.lore}</p>{m ? <><div className="text-[10px]">Nv {m.level} · vínculo {Math.floor(m.bond)}/100 · vitórias {m.victories}</div><div className="text-[10px] opacity-70">{recovery ? `Recuperando · ${Math.ceil(m.recovery)}s` : "Vida atual"}</div><Meter value={m.hp} max={def.maxHp + (m.level - 1) * 8} /></> : <div className="text-[10px] text-muted-foreground">Ainda não contratado · o gacha pode revelar este contrato.</div>}</div></div>{m && <div className="flex flex-wrap gap-1 mt-2">{!busy && !recovery && <><Button variant="game" size="sm" onClick={() => { assignMercenary(g, def.id, 0); update(`${def.name} entrou no primeiro slot.`); }}>Slot 1</Button><Button variant="game" size="sm" onClick={() => { assignMercenary(g, def.id, 1); update(`${def.name} entrou no segundo slot.`); }}>Slot 2</Button></>}{m.storyBeat < 4 && <Button variant="outline" size="sm" onClick={() => { m.storyBeat++; m.bond = Math.min(100, m.bond + 8); update(`${def.name}: ${mercenaryStory(def.id, m.storyBeat)}`); }}>Ouvir capítulo</Button>}</div>}</div>; })}</div>
      </Section>
    </div>
    <div className="modal-hint">Sinergias: Guardião protege a linha de frente; Curandeira restaura vida em ondas longas; Lenda fortalece o grupo saudável. Duplas diferentes registram um vínculo narrativo e desbloqueiam capítulos ao lutar juntas.</div>
  </Modal>;
}
