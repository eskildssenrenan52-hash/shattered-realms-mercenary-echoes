import { useEffect, useState } from "react";
import { Modal, Meter, Section } from "@/components/GameModal";
import { Button } from "@/components/ui/button";
import { ECHOES_BEYOND_REALMS, AMBITIOUS_SYSTEMS } from "@/odyssey/echoes-beyond";
import { SAGA_REALMS, sagaBossId } from "@/odyssey/saga";
import { FACTIONS } from "@/odyssey/epic";
import { epic } from "@/odyssey/epic-play";
import type { Game } from "@/odyssey/engine";
import {
  COUNCIL_AGENDAS,
  CARAVAN_ORDERS,
  CONSTELLATION_RITES,
  CONSTELLATION_SYMBOLS,
  acceptCaravanOrder,
  awakenEchoBond,
  beyondCycleProgress,
  canOpenEchoSystems,
  canTravelToHeartRealm,
  cartographyProgress,
  caravanProgress,
  castCouncilVote,
  chartVesperRoute,
  chooseBeyondRealmEnding,
  claimCaravanOrder,
  echoBondProgress,
  enterHeartByConstellation,
  isInPotos,
  museumScene,
  setMuseumVariant,
  setStormRealm,
  startBeyondCycle,
  startDreamExpedition,
  startFractureStorm,
  submitConstellation,
  syncMuseumRelics,
  toggleFractureOptIn,
  travelVesperRoute,
} from "@/odyssey/echoes-play";

type Props = { g: Game; onClose: () => void };

export function EchoesBeyondPanel({ g, onClose }: Props) {
  const [active, setActive] = useState<string>(AMBITIOUS_SYSTEMS[0][0]);
  const [ritualInput, setRitualInput] = useState<number[]>([]);
  const [, refresh] = useState(0);
  const update = (action: () => unknown) => {
    action();
    refresh((n) => n + 1);
  };
  useEffect(() => {
    syncMuseumRelics(g);
    refresh((n) => n + 1);
  }, [g]);
  const unlocked = canOpenEchoSystems(g);
  const name = AMBITIOUS_SYSTEMS.find(([id]) => id === active)?.[1] ?? "Ecos Além";

  return (
    <Modal title="Ecos Além · sistemas vivos" onClose={onClose}>
      <div className="game-panel mb-3 p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <b className="text-primary">A expansão continua depois da última Canção</b>
          <span className="text-xs opacity-70">Ciclo {g.echoSystems.beyond.cycle + 1}</span>
        </div>
        <p className="mt-1 font-body text-base opacity-80">
          Escolha uma trilha para consultar seu progresso, tomar decisões e iniciar atividades.
          Descobertas e consequências ficam no save da jornada.{" "}
          {unlocked
            ? "Os cinco reinos pós-Ato V estão abertos."
            : "Algumas ações aguardam a conclusão do Ato V e dos reinos Ecos Além."}
        </p>
      </div>
      <div
        className="grid grid-cols-2 gap-1 sm:grid-cols-3"
        role="tablist"
        aria-label="Sistemas de Ecos Além"
      >
        {AMBITIOUS_SYSTEMS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={active === id}
            className={`game-panel p-2 text-left text-xs ${active === id ? "border-primary text-primary" : "opacity-75"}`}
            onClick={() => {
              setActive(id);
              setRitualInput([]);
            }}
          >
            <span className="block font-bold">{label}</span>
          </button>
        ))}
      </div>
      <Section title={name} aside="progresso salvo">
        {active === "cartografia-viva" &&
          (() => {
            const pr = cartographyProgress(g);
            const visited = SAGA_REALMS.filter((realm) =>
              realm.zones.some((_, i) => g.discoveries.has(`saga:${realm.id}:${i}`)),
            );
            return (
              <div className="space-y-3">
                <p className="font-body text-base opacity-80">
                  Vésper transforma explorações, escolhas paralelas e ilhas visitadas em rotas
                  úteis. Primeiro visite uma zona; depois trace seu retorno para viajar até um
                  trecho já explorado, sem pular os lacres da campanha.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="game-panel p-2">
                    Reinos visitados{" "}
                    <b>
                      {pr.realms}/{SAGA_REALMS.length}
                    </b>
                  </div>
                  <div className="game-panel p-2">
                    Rotas traçadas <b>{pr.charted}</b>
                  </div>
                  <div className="game-panel p-2">
                    Ilhas descobertas <b>{pr.islands}</b>
                  </div>
                  <div className="game-panel p-2">
                    Escolhas registradas <b>{pr.choices}</b>
                  </div>
                </div>
                <div className="row-list">
                  {visited.length ? (
                    visited.map((realm) => {
                      const charted = g.echoSystems.cartography.routes.includes(realm.id);
                      return (
                        <div key={realm.id} className="place-row flex flex-wrap items-center gap-2">
                          <span className="min-w-40 flex-1">{realm.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={charted}
                            onClick={() => update(() => chartVesperRoute(g, realm.id))}
                          >
                            {charted ? "✓ Rota salva" : "Traçar rota"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={!charted}
                            onClick={() => update(() => travelVesperRoute(g, realm.id))}
                          >
                            Viajar
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="modal-empty">
                      Visite uma zona da Saga para que Vésper tenha algo novo a mapear.
                    </div>
                  )}
                </div>
                {g.echoSystems.constellations.completed && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={!canTravelToHeartRealm(g)}
                    onClick={() => update(() => enterHeartByConstellation(g))}
                  >
                    {canTravelToHeartRealm(g)
                      ? "Seguir a rota estelar ao Coração Oculto"
                      : "Rota ao Coração Oculto · honre as 12 relíquias"}
                  </Button>
                )}
              </div>
            );
          })()}

        {active === "potos-reconstruida" && (
          <div className="space-y-3">
            <p className="font-body text-base opacity-80">
              Cada cidade-reino libertada envia moradores de volta ao Mapa dos Atos em Potos. A
              recuperação é visível no mundo: novos personagens aparecem perto do mapa, o primeiro
              retorno abre uma mercadora, e cada etapa melhora os preços locais.
            </p>
            <div className="flex items-center justify-between gap-2">
              <span>Reinos libertados</span>
              <b>
                {g.echoSystems.restoration.freedRealms.length}/{ECHOES_BEYOND_REALMS.length}
              </b>
            </div>
            <Meter
              value={g.echoSystems.restoration.freedRealms.length}
              max={ECHOES_BEYOND_REALMS.length}
            />
            <div className="row-list">
              {ECHOES_BEYOND_REALMS.map((realm) => {
                const freed = g.echoSystems.restoration.freedRealms.includes(realm.id);
                return (
                  <div key={realm.id} className="place-row">
                    <span>
                      {freed ? "✓ " : "◇ "}
                      {realm.name}
                    </span>
                    <small>
                      {freed
                        ? "Moradores retornaram · rota aberta"
                        : "Conclua o chefe final para libertar a cidade"}
                    </small>
                  </div>
                );
              })}
            </div>
            <div className="game-panel p-2 text-xs">
              Etapa de Potos: <b>{g.echoSystems.restoration.level}/3</b> · desconto adicional do
              mercado: <b>{Math.round(g.echoSystems.restoration.level * 2.5)}%</b> · mercadora de
              rotas:{" "}
              <b>
                {g.echoSystems.restoration.freedRealms.length
                  ? "presente em Potos"
                  : "aguardando o primeiro retorno"}
              </b>
            </div>
            <div className="text-xs opacity-70">
              {isInPotos(g)
                ? "Você está em Potos; procure os novos moradores ao redor do Mapa dos Atos."
                : "Volte a Potos para encontrar os moradores e a nova loja."}
            </div>
          </div>
        )}

        {active === "lacos-eco" &&
          (() => {
            const bond = echoBondProgress(g);
            return (
              <div className="space-y-3">
                <p className="font-body text-base opacity-80">
                  A lealdade cresce quando companheiros diferentes viajam na equipe. Reúna ao menos
                  dois pets de elementos distintos e mantenha vínculo médio de 20. O Laço
                  desbloqueado combina o esforço da equipe: melhora o dano e a proteção do
                  companheiro ativo e registra uma cena de lealdade.
                </p>
                <div className="game-panel p-3 text-sm">
                  Equipe atual:{" "}
                  <b>{bond.names.length ? bond.names.join(" · ") : "nenhum companheiro"}</b>
                  <br />
                  Pets na equipe: <b>{bond.count}</b> · vínculo médio: <b>{bond.bond}/100</b> ·
                  elementos distintos: <b>{bond.diverse ? "sim" : "ainda não"}</b>
                </div>
                <Meter value={Math.min(100, bond.bond)} max={100} />
                {g.echoSystems.bonds.unlocked ? (
                  <div className="game-panel border-primary p-3 text-sm">
                    <b className="text-primary">Cena de lealdade registrada</b>
                    <p className="mt-1 font-body text-base">
                      Dois ritmos diferentes encontram espaço na mesma canção. A partir de agora,
                      companheiros em equipe compartilham parte de suas habilidades de ataque e
                      guarda.
                    </p>
                    <span className="text-xs opacity-70">
                      Laço salvo nesta jornada · abra Pets para reorganizar a equipe.
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => update(() => awakenEchoBond(g))}
                  >
                    Tentar despertar o Laço de Eco
                  </Button>
                )}
              </div>
            );
          })()}

        {active === "conselho" && (
          <div className="space-y-3">
            <p className="font-body text-base opacity-80">
              O Conselho decide o destino dos recursos que voltam a Potos. Cada voto altera
              reputações das facções e soma pontos a um dos finais da Grande Crônica. Reputação com
              a Liga da Maré muda o preço de compra e venda no mercado.
            </p>
            <div className="grid grid-cols-2 gap-1">
              {FACTIONS.map((faction) => (
                <div className="game-panel p-2 text-xs" key={faction.id}>
                  <b style={{ color: faction.color }}>{faction.name}</b>
                  <div>Reputação: {epic(g).rep[faction.id]}</div>
                </div>
              ))}
            </div>
            <div className="game-panel p-2 text-xs">
              Multiplicador atual da loja: <b>{Math.round(g.priceMult() * 100)}%</b> do preço-base.
              As escolhas da Grande Crônica e os votos afetam este valor.
            </div>
            {COUNCIL_AGENDAS.map((agenda) => {
              const vote = g.echoSystems.council.votes.find((item) =>
                item.startsWith(`${agenda.id}:`),
              );
              return (
                <div key={agenda.id} className="game-panel space-y-2 p-2">
                  <b>{agenda.title}</b>
                  {vote ? (
                    <div className="text-xs text-primary">
                      Voto registrado:{" "}
                      {agenda.options.find((option) => `${agenda.id}:${option.id}` === vote)?.label}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {agenda.options.map((option) => (
                        <Button
                          key={option.id}
                          variant="outline"
                          size="sm"
                          onClick={() => update(() => castCouncilVote(g, agenda.id, option.id))}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {active === "sonhos" && (
          <div className="space-y-3">
            <p className="font-body text-base opacity-80">
              Chefes de Ecos Além deixam Memórias de Eco. Gaste uma para entrar num piso procedural
              curto: explore, abra o baú, vença as sombras e o guardião de sonho, então use a escada
              para voltar com ouro, XP, fragmento e outra memória.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="game-panel p-2">
                Memórias disponíveis <b>{g.echoSystems.dreams.memories}</b>
              </div>
              <div className="game-panel p-2">
                Expedições concluídas <b>{g.echoSystems.dreams.completed}</b>
              </div>
              <div className="game-panel p-2">
                Entradas iniciadas <b>{g.echoSystems.dreams.runs}</b>
              </div>
              <div className="game-panel p-2">
                Melhor profundidade <b>{g.echoSystems.dreams.best}/1</b>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              disabled={!g.echoSystems.dreams.memories || !!g.depth || !!g.island || !!g.sea}
              onClick={() => update(() => startDreamExpedition(g))}
            >
              Entrar numa Expedição Onírica (1 memória)
            </Button>
            <div className="text-xs opacity-70">
              Memórias são concedidas uma vez por chefe de Ecos Além. Se precisar de uma, avance
              pela Saga e volte a Potos.
            </div>
          </div>
        )}

        {active === "constelacoes" &&
          (() => {
            const stage = g.echoSystems.constellations.stage;
            const rite = CONSTELLATION_RITES[stage];
            return (
              <div className="space-y-3">
                <p className="font-body text-base opacity-80">
                  Três rituais unem céu, mar e som. Leia a pista, monte a sequência tocando os
                  símbolos na ordem indicada e confirme. Os erros são registrados, mas não consomem
                  itens. Completar os três abre uma rota estelar alternativa — o Coração Oculto
                  continua exigindo as doze relíquias.
                </p>
                <div className="game-panel p-3">
                  <div className="text-xs opacity-70">
                    Rituais concluídos · {Math.min(stage, CONSTELLATION_RITES.length)}/
                    {CONSTELLATION_RITES.length}
                  </div>
                  <Meter
                    value={Math.min(stage, CONSTELLATION_RITES.length)}
                    max={CONSTELLATION_RITES.length}
                  />
                  {rite ? (
                    <>
                      <b className="mt-2 block text-primary">{rite.title}</b>
                      <p className="font-body text-base">Pista: {rite.clue}</p>
                    </>
                  ) : (
                    <b className="mt-2 block text-primary">
                      A rota das estrelas está gravada no Atlas.
                    </b>
                  )}
                </div>
                {rite && (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {CONSTELLATION_SYMBOLS.map((symbol, i) => (
                        <Button
                          key={symbol}
                          variant="outline"
                          disabled={ritualInput.length >= 3}
                          onClick={() => setRitualInput((current) => [...current, i])}
                        >
                          {symbol}
                        </Button>
                      ))}
                    </div>
                    <div className="game-panel p-2 text-xs">
                      Sua sequência:{" "}
                      {ritualInput.length
                        ? ritualInput.map((i) => CONSTELLATION_SYMBOLS[i]).join(" → ")
                        : "—"}
                      {ritualInput.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => setRitualInput([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      disabled={ritualInput.length !== 3}
                      onClick={() =>
                        update(() => {
                          const ok = submitConstellation(g, ritualInput);
                          if (ok) setRitualInput([]);
                        })
                      }
                    >
                      Confirmar sequência
                    </Button>
                    <div className="text-xs opacity-70">
                      Tentativas incorretas registradas: {g.echoSystems.constellations.failures}
                    </div>
                  </>
                )}
                {g.echoSystems.constellations.completed && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={!canTravelToHeartRealm(g)}
                    onClick={() => update(() => enterHeartByConstellation(g))}
                  >
                    {canTravelToHeartRealm(g)
                      ? "Viajar ao Coração Oculto pela rota estelar"
                      : "Rota estelar pronta · reúna as 12 relíquias do Atlas"}
                  </Button>
                )}
              </div>
            );
          })()}

        {active === "caravanas" &&
          (() => {
            const progress = caravanProgress(g);
            const order = progress.active
              ? CARAVAN_ORDERS.find((item) => item.id === progress.active?.id)
              : progress.next;
            return (
              <div className="space-y-3">
                <p className="font-body text-base opacity-80">
                  Aceite uma encomenda em Potos, prepare tábuas e ouro, visite a cidade indicada e
                  volte ao mercado para concluir a entrega. Cada caravana paga a viagem e abre uma
                  rota de retorno no Atlas.
                </p>
                <div className="game-panel p-3 text-sm">
                  Entregas concluídas:{" "}
                  <b>
                    {g.echoSystems.caravans.completed.length}/{CARAVAN_ORDERS.length}
                  </b>{" "}
                  · rotas comerciais abertas: <b>{g.echoSystems.caravans.routes.length}</b>
                </div>
                {order ? (
                  <div className="game-panel space-y-2 p-3">
                    <b>{order.title}</b>
                    <div className="text-xs">
                      Destino:{" "}
                      {ECHOES_BEYOND_REALMS.find((realm) => realm.id === order.realm)?.name} ·
                      investimento: {order.costGold} ouro + {order.costPlank} tábuas · recompensa:{" "}
                      {order.rewardGold} ouro + item
                    </div>
                    {progress.active ? (
                      <>
                        <div className="text-xs">
                          Progresso:{" "}
                          {progress.visited
                            ? "✓ destino visitado"
                            : "visite o reino pelo Mapa dos Atos"}{" "}
                          ·{" "}
                          {progress.atPotos
                            ? "você está em Potos"
                            : "retorne a Potos para entregar"}
                        </div>
                        <Button
                          variant="secondary"
                          disabled={!progress.visited || !progress.atPotos}
                          onClick={() => update(() => claimCaravanOrder(g))}
                        >
                          Concluir entrega
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled={!progress.atPotos}
                        onClick={() => update(() => acceptCaravanOrder(g))}
                      >
                        Aceitar caravana
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-primary">
                    As três rotas iniciais foram restabelecidas. Use o Atlas para revisitá-las.
                  </div>
                )}
                <div className="text-xs opacity-70">
                  O destino fica disponível pela conversa do Mapa dos Atos em Potos. A encomenda
                  continua salva se você sair do jogo.
                </div>
              </div>
            );
          })()}

        {active === "museu" && (
          <div className="space-y-3">
            <p className="font-body text-base opacity-80">
              Relíquias de recompensa dos cinco reinos são registradas quando recebidas, mesmo se
              forem equipadas depois. Cada peça guarda uma cena. Escolha como expor a lembrança:
              inteira ou em uma versão gentil; sua curadoria fica registrada no Museu e altera o
              texto exibido para aquela memória.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span>Relíquias catalogadas</span>
              <b>
                {g.echoSystems.museum.relics.length}/{ECHOES_BEYOND_REALMS.length}
              </b>
            </div>
            <Meter value={g.echoSystems.museum.relics.length} max={ECHOES_BEYOND_REALMS.length} />
            <div className="row-list">
              {ECHOES_BEYOND_REALMS.map((realm) => {
                const relic = realm.reward.item,
                  owned = g.echoSystems.museum.relics.includes(relic),
                  variant = g.echoSystems.museum.variants[relic];
                return (
                  <div key={relic} className="place-row flex flex-wrap items-center gap-2">
                    <div className="min-w-40 flex-1">
                      <b>
                        {owned ? "♪ " : "◇ "}
                        {realm.reward.name}
                      </b>
                      <small>
                        {realm.name} ·{" "}
                        {owned
                          ? variant
                            ? `memória: ${variant === "remember" ? "integral" : "gentil"}`
                            : "cena aguardando leitura"
                          : "relíquia ainda não encontrada"}
                      </small>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!owned}
                      onClick={() => update(() => museumScene(g, relic))}
                    >
                      Ouvir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!owned}
                      onClick={() => update(() => setMuseumVariant(g, relic, "remember"))}
                    >
                      Integral
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!owned}
                      onClick={() => update(() => setMuseumVariant(g, relic, "release"))}
                    >
                      Gentil
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {active === "tempestades" && (
          <div className="space-y-3">
            <p className="font-body text-base opacity-80">
              Tempestades são eventos opt-in: aceitar avisos não inicia combate. Quando quiser,
              escolha um reino e abra uma instância curta com chão fraturado, inimigos reforçados,
              cache e Arauto raro. Sair antes da vitória encerra o evento sem penalidade; vencer
              estabiliza a região e concede uma recompensa.
            </p>
            <label className="game-panel flex items-start gap-2 p-3 text-sm">
              <input
                type="checkbox"
                checked={g.echoSystems.storms.optIn}
                onChange={() => update(() => toggleFractureOptIn(g))}
              />
              <span>
                <b>Receber avisos de Fratura</b>
                <small>A entrada no evento sempre exige um novo toque de confirmação.</small>
              </span>
            </label>
            <label className="block text-xs">
              Região da próxima Tempestade
              <select
                className="game-panel mt-1 w-full p-2"
                value={g.echoSystems.storms.selectedRealm}
                onChange={(event) => update(() => setStormRealm(g, event.target.value))}
              >
                {ECHOES_BEYOND_REALMS.map((realm) => (
                  <option key={realm.id} value={realm.id}>
                    {realm.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="game-panel p-2 text-xs">
              Arautos derrotados: <b>{g.echoSystems.storms.completions}</b> · última ruptura:{" "}
              <b>{g.echoSystems.storms.lastBossId ?? "nenhuma"}</b>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              disabled={!g.echoSystems.storms.optIn || !!g.depth || !!g.island || !!g.sea}
              onClick={() => update(() => startFractureStorm(g))}
            >
              Confirmar e entrar na Tempestade
            </Button>
          </div>
        )}

        {active === "ciclo-alem" &&
          (() => {
            const progress = beyondCycleProgress(g);
            return (
              <div className="space-y-3">
                <p className="font-body text-base opacity-80">
                  Depois de libertar os cinco reinos, escolha para cada cidade se a memória será
                  preservada ou transformada. Essas decisões ficam no histórico e modificam HP,
                  ataque e recompensas dos chefes no ciclo seguinte. O Novo Ciclo não apaga nível,
                  itens, casa, campanha principal ou IDs dos demais sistemas.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="game-panel p-2">
                    Chefes finais vencidos{" "}
                    <b>
                      {progress.completed}/{progress.required}
                    </b>
                  </div>
                  <div className="game-panel p-2">
                    Desfechos escolhidos{" "}
                    <b>
                      {progress.choices}/{progress.required}
                    </b>
                  </div>
                  <div className="game-panel p-2">
                    Ciclos concluídos <b>{g.echoSystems.beyond.history.length}</b>
                  </div>
                  <div className="game-panel p-2">
                    Ciclo atual <b>{progress.cycle + 1}</b>
                  </div>
                </div>
                <Meter value={progress.completed} max={progress.required} />
                <div className="row-list">
                  {ECHOES_BEYOND_REALMS.map((realm) => {
                    const defeated = g.bossesDone.has(sagaBossId(realm, realm.zones.length - 1)),
                      choice = g.echoSystems.beyond.choices[realm.id];
                    return (
                      <div key={realm.id} className="place-row flex flex-wrap items-center gap-2">
                        <div className="min-w-40 flex-1">
                          <b>
                            {defeated ? "✓ " : "◇ "}
                            {realm.name}
                          </b>
                          <small>
                            {choice
                              ? `Desfecho guardado: ${choice === "preserve" ? "preservar" : "transformar"}`
                              : defeated
                                ? "Escolha um desfecho para habilitar o próximo Ciclo"
                                : "Derrote o chefe final do reino primeiro"}
                          </small>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!defeated}
                          onClick={() =>
                            update(() => chooseBeyondRealmEnding(g, realm.id, "preserve"))
                          }
                        >
                          Preservar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!defeated}
                          onClick={() =>
                            update(() => chooseBeyondRealmEnding(g, realm.id, "transform"))
                          }
                        >
                          Transformar
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={!progress.ready || !isInPotos(g)}
                  onClick={() => update(() => startBeyondCycle(g))}
                >
                  {progress.ready
                    ? "Iniciar Novo Ciclo em Potos"
                    : "Conclua os 5 reinos e escolha seus desfechos"}
                </Button>
                <div className="text-xs opacity-70">
                  {isInPotos(g)
                    ? "Potos está pronta para recomeçar."
                    : "Volte a Potos para iniciar o próximo Ciclo."}
                </div>
              </div>
            );
          })()}
      </Section>
      <div className="modal-hint">
        Dica: explore uma cidade-reino, volte a Potos e confira novamente as rotas, os moradores e a
        loja.
      </div>
    </Modal>
  );
}
