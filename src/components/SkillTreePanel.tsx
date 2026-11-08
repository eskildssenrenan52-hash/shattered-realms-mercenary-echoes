import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal, Section } from "@/components/GameModal";
import { SKILL_NODES, canBuySkill, panelUnlockLevel, skillAvailable, skillCost, skillRank, type SkillId } from "@/odyssey/progression";
import type { Game } from "@/odyssey/engine";

const BRANCHES = [
  ["vanguarda", "Vanguarda", "Resistência e dano de arma"],
  ["arcano", "Arcano", "Mana e proteção mística"],
  ["exploracao", "Exploração", "Mobilidade e recompensas"],
] as const;

export function SkillTreePanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [, refresh] = useState(0);
  const ranks = g.skillRanks();
  const buy = (id: SkillId) => { if (g.buySkill(id)) refresh((v) => v + 1); };
  return <Modal title={`Árvore de Habilidades · ${g.p.skillPoints ?? 0} pontos`} onClose={onClose} wide>
    <div className="modal-hint">Cada nível concede 1 ponto de habilidade. Nós exigem nível e, em alguns casos, o rank do nó anterior. Os ramos são permanentes nesta jornada.</div>
    <div className="skill-tree-grid">
      {BRANCHES.map(([branch, name, desc]) => <Section key={branch} title={name} aside={desc}>
        <div className="skill-branch">{SKILL_NODES.filter((node) => node.branch === branch).map((node) => {
          const rank = skillRank(ranks, node.id), available = skillAvailable(g.p.level, ranks, node), canBuy = canBuySkill(g.p.level, g.p.skillPoints ?? 0, ranks, node.id);
          return <div key={node.id} className={`skill-node ${rank ? "is-learned" : ""} ${!available ? "is-locked" : ""}`}>
            <div className="flex items-start justify-between gap-2"><div><b>{node.name}</b><small>Rank {rank}/{node.maxRank} · Nível {node.minLevel}</small></div><span className="skill-rank">{rank}</span></div>
            <p>{node.desc}</p>
            {node.requires && <small>Requer {SKILL_NODES.find((item) => item.id === node.requires)?.name}</small>}
            <Button variant="game" size="sm" disabled={!canBuy} onClick={() => buy(node.id)}>{rank >= node.maxRank ? "Completa" : available ? `Aprender · ${skillCost(node, ranks)} pt` : `Bloqueada · Nv ${node.minLevel}`}</Button>
          </div>;
        })}</div>
      </Section>)}
    </div>
    <div className="modal-hint">Próximo sistema: os painéis de combate e companhia liberam em níveis progressivos; Mochila, Aparência e Atributos continuam disponíveis desde o início.</div>
  </Modal>;
}

export const SKILL_TREE_UNLOCK_LEVEL = panelUnlockLevel("char");
