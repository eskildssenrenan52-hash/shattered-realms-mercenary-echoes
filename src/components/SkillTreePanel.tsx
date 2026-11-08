import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal, Section, Meter } from "@/components/GameModal";
import { SKILL_NODES, canBuySkill, panelUnlockLevel, skillAvailable, skillCost, skillRank, type SkillBranch, type SkillId } from "@/odyssey/progression";
import type { Game } from "@/odyssey/engine";

const BRANCHES: { id: SkillBranch; name: string; desc: string; mark: string }[] = [
  { id: "vanguarda", name: "Vanguarda", desc: "Aço, impacto e presença", mark: "⚔" },
  { id: "arcano", name: "Arcano", desc: "Mana, magia e proteção", mark: "✦" },
  { id: "exploracao", name: "Exploração", desc: "Rotas, achados e espaço", mark: "◈" },
  { id: "disciplina", name: "Disciplina", desc: "Ritmo, recuperação e preparo", mark: "◉" },
  { id: "convergencia", name: "Convergência", desc: "Equipamento e sequência", mark: "⬡" },
  { id: "sobrevivencia", name: "Sobrevivência", desc: "O último limiar do Eco", mark: "✹" },
];

export function SkillTreePanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [, refresh] = useState(0);
  const [active, setActive] = useState<SkillBranch | "all">("all");
  const ranks = g.skillRanks();
  const learned = SKILL_NODES.reduce((sum, node) => sum + skillRank(ranks, node.id), 0);
  const max = SKILL_NODES.reduce((sum, node) => sum + node.maxRank, 0);
  const visible = useMemo(() => active === "all" ? SKILL_NODES : SKILL_NODES.filter((node) => node.branch === active), [active]);
  const buy = (id: SkillId) => { if (g.buySkill(id)) refresh((v) => v + 1); };
  return <Modal title={`Árvore de Habilidades · ${g.p.skillPoints ?? 0} pontos`} onClose={onClose} wide>
    <div className="skill-hero-card">
      <div><span className="skill-eyebrow">MAPA DE DOMÍNIO · NÍVEL {g.p.level}</span><h2>O Eco responde às suas escolhas</h2><p>Construa uma especialização ou combine escolas para criar uma build própria. Nenhum ponto é perdido: cada rank muda o combate ou a forma de explorar.</p></div>
      <div className="skill-progress-card"><strong>{learned}/{max}</strong><small>ranks aprendidos</small><Meter value={learned} max={max} tone="mana" /></div>
    </div>
    <div className="skill-branch-tabs" role="tablist"><button className={active === "all" ? "on" : ""} onClick={() => setActive("all")}>Todas</button>{BRANCHES.map((b) => <button key={b.id} className={active === b.id ? "on" : ""} onClick={() => setActive(b.id)}><b>{b.mark}</b>{b.name}</button>)}</div>
    <div className="skill-tree-grid skill-tree-refined">
      {BRANCHES.filter((b) => active === "all" || active === b.id).map((branch) => <Section key={branch.id} title={`${branch.mark} ${branch.name}`} aside={branch.desc} className={`skill-school school-${branch.id}`}>
        <div className="skill-branch-meta"><span>{SKILL_NODES.filter((n) => n.branch === branch.id).reduce((a, n) => a + skillRank(ranks, n.id), 0)} ranks ativos</span><span>{SKILL_NODES.filter((n) => n.branch === branch.id).length} nós</span></div>
        <div className="skill-branch">{visible.filter((node) => node.branch === branch.id).map((node, index) => {
          const rank = skillRank(ranks, node.id), available = skillAvailable(g.p.level, ranks, node), canBuy = canBuySkill(g.p.level, g.p.skillPoints ?? 0, ranks, node.id);
          return <div key={node.id} className={`skill-node skill-${node.tag} ${rank ? "is-learned" : ""} ${!available ? "is-locked" : ""}`}>
            {index > 0 && <span className="skill-link" aria-hidden />}
            <div className="skill-node-head"><div><span className="skill-tag">{node.tag === "capstone" ? "ÁPICE" : node.tag === "synergy" ? "SINERGIA" : "FUNDAMENTO"}</span><b>{node.name}</b><small>Rank {rank}/{node.maxRank} · libera no nível {node.minLevel}</small></div><span className="skill-rank">{rank}<i>/{node.maxRank}</i></span></div>
            <p>{node.desc}</p>
            {node.requires && <small className="skill-require">↳ Requer {SKILL_NODES.find((item) => item.id === node.requires)?.name}</small>}
            <Button variant="game" size="sm" disabled={!canBuy} onClick={() => buy(node.id)}>{rank >= node.maxRank ? "Domínio completo" : available ? `Aprender · ${skillCost(node, ranks)} pt` : `Bloqueada · Nv ${node.minLevel}`}</Button>
          </div>;
        })}</div>
      </Section>)}
    </div>
    <div className="skill-footer"><span>Próximo marco: cada nível concede 1 ponto.</span><span>Build persistente · save compatível · reembolso não disponível</span></div>
  </Modal>;
}
export const SKILL_TREE_UNLOCK_LEVEL = panelUnlockLevel("char");
