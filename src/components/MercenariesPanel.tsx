import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal, Section, Meter } from "@/components/GameModal";
import {
  MERCENARIES,
  MERC_BY_ID,
  MERC_RARITY,
  MERCENARY_FORMATIONS,
  MERCENARY_GOLD_COST,
  MERCENARY_PITY_LIMIT,
  MERCENARY_SEAL_COST,
  MERCENARY_STANCES,
  TALENT_PATHS,
  EXPEDITIONS,
  assignMercenary,
  dismissMercenary,
  equipMercenary,
  mercenaryFilter,
  mercenaryRequirement,
  mercenaryStory,
  mercenaryUnlocked,
  recommendMercenaryDuo,
  resolveMercenaryExpedition,
  rollMercenary,
  startMercenaryExpedition,
  trainMercenary,
  type MercRarity,
} from "@/odyssey/mercenaries";
import { ITEMS } from "@/odyssey/data";
import type { Game } from "@/odyssey/engine";

function Portrait({ id, size = 76 }: { id: string; size?: number }) {
  const d = MERC_BY_ID[id];
  return (
    <img
      src={d?.portrait}
      alt={`Retrato de ${d?.name ?? "mercenário"}`}
      className="game-frame object-cover"
      style={{ width: size, height: size, imageRendering: "auto", filter: mercenaryFilter(id) }}
    />
  );
}
function rarityLabel(r: MercRarity) {
  return <span style={{ color: MERC_RARITY[r].color }}>{MERC_RARITY[r].label}</span>;
}

export function MercenariesPanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [, refresh] = useState(0);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("todos");
  const [rarity, setRarity] = useState("todos");
  const [catalog, setCatalog] = useState("todos");
  const update = (text: string) => {
    setMessage(text);
    refresh((x) => x + 1);
    g.save();
  };
  const roll = (currency: "gold" | "seal") => {
    const d = rollMercenary(g, currency);
    update(
      d
        ? `${d.name}: ${d.title}. ${d.contract}`
        : "Nenhum contrato elegível agora — nenhuma moeda foi consumida.",
    );
  };
  const active = g.mercenaries.active;
  const visible = MERCENARIES.filter((def) => {
    const q = query.trim().toLocaleLowerCase();
    const m = g.mercenaries.roster.find((x) => x.id === def.id);
    const searchable =
      `${def.name} ${def.title} ${def.element} ${def.lore} ${def.role}`.toLocaleLowerCase();
    const catalogMatch =
      catalog === "todos" || (catalog === "recrutados" ? !!m : !m && mercenaryUnlocked(g, def));
    const roleMatch = role === "todos" || def.role === role;
    const rarityMatch = rarity === "todos" || def.rarity === rarity;
    return (!q || searchable.includes(q)) && catalogMatch && roleMatch && rarityMatch;
  });
  const setFormation = (formation: (typeof MERCENARY_FORMATIONS)[number]["id"]) => {
    g.mercenaries.formation = formation;
    update(`Formação: ${MERCENARY_FORMATIONS.find((x) => x.id === formation)?.name}.`);
  };
  const setStance = (stance: (typeof MERCENARY_STANCES)[number]["id"]) => {
    g.mercenaries.stance = stance;
    update(`Postura: ${MERCENARY_STANCES.find((x) => x.id === stance)?.name}.`);
  };
  return (
    <Modal title="Companhia · Contratos e Juramentos" onClose={onClose} wide>
      <div className="modal-hint">
        Até dois mercenários acompanham você por casas, portas, masmorras e teletransportes. Eles
        têm HP próprio, podem ser atingidos e recuam ao chegar a 15% de vida; a recuperação continua
        com o painel fechado.
      </div>
      <div className="modal-cols">
        <Section title="Agência de contratos" aside={`${g.mercenaries.contractSeals} selos`}>
          <div className="game-panel p-2 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span>
                Pity {g.mercenaries.pity}/{MERCENARY_PITY_LIMIT}
              </span>
              <span>{g.mercenaries.totalRolls} contratos</span>
            </div>
            <p className="font-body text-base opacity-80">
              Contratos são progressão do jogo: sem dinheiro real, compras externas ou energia. O
              pity garante Raro ou superior na {MERCENARY_PITY_LIMIT}ª tentativa consecutiva.
            </p>
            <div className="flex flex-wrap gap-1">
              <Button
                variant="game"
                className="game-btn"
                onClick={() => roll("gold")}
                disabled={g.p.gold < MERCENARY_GOLD_COST}
              >
                Contratar · {MERCENARY_GOLD_COST} ouro
              </Button>
              <Button
                variant="game"
                className="game-btn"
                onClick={() => roll("seal")}
                disabled={g.mercenaries.contractSeals < MERCENARY_SEAL_COST}
              >
                Usar · {MERCENARY_SEAL_COST} selos
              </Button>
            </div>
            {message && <div className="text-[11px] text-primary">{message}</div>}
          </div>
          <div className="modal-section-title mt-3">
            <span>Comportamento da dupla</span>
            <small>{active.filter(Boolean).length}/2</small>
          </div>
          <div className="game-panel p-2 space-y-2">
            <label className="text-[10px] block">
              Formação
              <select
                aria-label="Formação"
                className="w-full bg-background p-1"
                value={g.mercenaries.formation}
                onChange={(e) =>
                  setFormation(e.target.value as (typeof MERCENARY_FORMATIONS)[number]["id"])
                }
              >
                {MERCENARY_FORMATIONS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name} · {x.desc}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[10px] block">
              Postura
              <select
                aria-label="Postura"
                className="w-full bg-background p-1"
                value={g.mercenaries.stance}
                onChange={(e) =>
                  setStance(e.target.value as (typeof MERCENARY_STANCES)[number]["id"])
                }
              >
                {MERCENARY_STANCES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name} · {x.desc}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="game"
              size="sm"
              onClick={() =>
                update(
                  recommendMercenaryDuo(g)
                    ? "Dupla recomendada entrou em campo."
                    : "Não há dois companheiros disponíveis para recomendar.",
                )
              }
            >
              Recomendar dupla
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {active.map((id, slot) => {
              const def = id ? MERC_BY_ID[id] : undefined;
              const m = id ? g.mercenaries.roster.find((x) => x.id === id) : undefined;
              return (
                <div key={slot} className="game-panel p-2 min-h-28">
                  {id && def ? (
                    <>
                      <div className="flex gap-2">
                        <Portrait id={id} size={48} />
                        <div>
                          <b>{def.name}</b>
                          <div className="text-[10px]">
                            {def.role} · {rarityLabel(def.rarity)}
                          </div>
                          <Meter value={m?.hp ?? 0} max={def.maxHp + (m?.level ?? 1) * 8} />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          update(
                            dismissMercenary(g, slot as 0 | 1)
                              ? "Mercenário enviado à reserva."
                              : "Slot já estava vazio.",
                          )
                        }
                      >
                        Retirar
                      </Button>
                    </>
                  ) : (
                    <div className="opacity-60 text-[11px]">
                      Slot vazio
                      <br />
                      Escolha alguém do catálogo abaixo.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
        <Section
          title="Catálogo e histórias"
          aside={`${g.mercenaries.roster.length}/${MERCENARIES.length}`}
        >
          <div className="game-panel p-2 space-y-2 mb-2">
            <label className="text-[10px] block">
              Buscar
              <input
                aria-label="Buscar mercenário"
                className="w-full bg-background p-1"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome, elemento, função…"
              />
            </label>
            <div className="grid grid-cols-3 gap-1">
              <select
                aria-label="Filtrar função"
                className="bg-background p-1 text-[10px]"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="todos">Todas funções</option>
                {["guardiao", "duelista", "mago", "curandeira", "lenda"].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar raridade"
                className="bg-background p-1 text-[10px]"
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
              >
                <option value="todos">Todas raridades</option>
                {Object.keys(MERC_RARITY).map((x) => (
                  <option key={x} value={x}>
                    {MERC_RARITY[x as MercRarity].label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar catálogo"
                className="bg-background p-1 text-[10px]"
                value={catalog}
                onChange={(e) => setCatalog(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="recrutados">Recrutados</option>
                <option value="disponiveis">Desbloqueados</option>
              </select>
            </div>
          </div>
          <div className="row-list max-h-[55vh] overflow-auto">
            {visible.map((def) => {
              const m = g.mercenaries.roster.find((x) => x.id === def.id);
              const busy = active.includes(def.id);
              const recovery = m && (m.state === "recuando" || m.state === "recuperando");
              const unlocked = mercenaryUnlocked(g, def);
              return (
                <div key={def.id} className={`game-panel p-2 ${m ? "" : "opacity-70"}`}>
                  <div className="flex gap-2">
                    <Portrait id={def.id} size={64} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <b>{def.name}</b>
                        <span>{rarityLabel(def.rarity)}</span>
                      </div>
                      <div className="text-[10px] opacity-70">
                        {def.title} · {def.role} · {def.element}
                      </div>
                      <p className="font-body text-sm mt-1">
                        {m ? mercenaryStory(def.id, m.storyBeat) : def.lore}
                      </p>
                      {m ? (
                        <>
                          <div className="text-[10px]">
                            Nv {m.level} · vínculo {Math.floor(m.bond)}/100 · vitórias {m.victories}
                          </div>
                          <div className="text-[10px] opacity-70">
                            {recovery ? `Recuperando · ${Math.ceil(m.recovery)}s` : "Vida atual"}
                          </div>
                          <Meter value={m.hp} max={def.maxHp + (m.level - 1) * 8} />
                        </>
                      ) : (
                        <div className="text-[10px] text-muted-foreground">
                          {unlocked
                            ? "Desbloqueado · pode aparecer em um contrato."
                            : `Bloqueado · ${mercenaryRequirement(def)}`}
                        </div>
                      )}
                    </div>
                  </div>
                  {m && (
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-1">
                        {(["weapon", "armor", "ring", "amulet"] as const).map((slot) => (
                          <label key={slot} className="text-[10px]">
                            {slot}
                            <select
                              className="w-full bg-background"
                              value={m.equipment?.[slot] || ""}
                              onChange={(e) => {
                                equipMercenary(g, def.id, slot, e.target.value || null);
                                update("Loadout atualizado.");
                              }}
                            >
                              <option value="">Vazio</option>
                              {Object.values(ITEMS)
                                .filter((i) => i.type === slot && g.count(i.id) > 0)
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name}
                                  </option>
                                ))}
                            </select>
                          </label>
                        ))}
                      </div>
                      <div className="text-[10px]">
                        Talentos (custo base 100 ouro; requisito: nível ≥ rank+1)
                      </div>
                      {TALENT_PATHS.map((t, i) => (
                        <div key={t.id} className="flex items-center justify-between text-[10px]">
                          <span>
                            {t.name} {m.talents?.[i] || 0}/5 · {t.desc}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              g.p.gold < t.cost(m.talents?.[i] || 0) ||
                              m.level < (m.talents?.[i] || 0) + 1
                            }
                            onClick={() =>
                              update(
                                trainMercenary(g, def.id, i as 0 | 1 | 2)
                                  ? `${t.name} treinado.`
                                  : "Requisitos/custo não atendidos.",
                              )
                            }
                          >
                            Treinar · {t.cost(m.talents?.[i] || 0)}g
                          </Button>
                        </div>
                      ))}
                      {m.state === "reserva" && (
                        <div className="flex flex-wrap gap-1">
                          {EXPEDITIONS.map((x) => (
                            <Button
                              key={x.id}
                              size="sm"
                              variant="outline"
                              disabled={!!m.expeditionId}
                              onClick={() =>
                                update(
                                  startMercenaryExpedition(g, def.id, x.id)
                                    ? `Expedição iniciada: ${x.name}.`
                                    : "Mercenário indisponível.",
                                )
                              }
                            >
                              {x.name} · {x.duration}s
                            </Button>
                          ))}
                        </div>
                      )}
                      {(g.mercenaries.expeditions || [])
                        .filter((e) => e.mercenaryId === def.id)
                        .map((e) => (
                          <div key={e.id} className="text-[10px]">
                            Expedição:{" "}
                            {e.status === "running" ? (
                              `${Math.ceil(e.remaining)}s`
                            ) : e.status === "complete" ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  update(
                                    resolveMercenaryExpedition(g, e.id)
                                      ? "Recompensa coletada."
                                      : "Inventário cheio: recompensa preservada.",
                                  )
                                }
                              >
                                Coletar
                              </Button>
                            ) : (
                              "Coletada"
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                  {m && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {!busy && !recovery && (
                        <>
                          <Button
                            variant="game"
                            size="sm"
                            onClick={() =>
                              update(
                                assignMercenary(g, def.id, 0)
                                  ? `${def.name} entrou no primeiro slot.`
                                  : "Mercenário indisponível.",
                              )
                            }
                          >
                            Slot 1
                          </Button>
                          <Button
                            variant="game"
                            size="sm"
                            onClick={() =>
                              update(
                                assignMercenary(g, def.id, 1)
                                  ? `${def.name} entrou no segundo slot.`
                                  : "Mercenário indisponível.",
                              )
                            }
                          >
                            Slot 2
                          </Button>
                        </>
                      )}
                      {m.storyBeat < 4 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            m.storyBeat++;
                            m.bond = Math.min(100, m.bond + 8);
                            update(`${def.name}: ${mercenaryStory(def.id, m.storyBeat)}`);
                          }}
                        >
                          Ouvir capítulo
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      </div>
      <div className="modal-hint">
        Sinergias: Guardião protege a linha de frente; Curandeira restaura vida em ondas longas;
        Lenda fortalece o grupo saudável. Duplas diferentes registram um vínculo narrativo e
        desbloqueiam capítulos ao lutar juntas.
      </div>
    </Modal>
  );
}
