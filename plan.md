# Plano — Shattered Realms: Echoes Beyond

## Direção

Continuar o RPG 2D Canvas/React trazido do GitHub, sem trocar seu motor nem romper saves existentes. O jogo já possui a narrativa, reinos e sistemas-base; esta etapa transforma o conteúdo ainda desconectado em jogabilidade verificável, melhora a leitura do mundo no Atlas e amplia o universo com cidades, reinos, histórias e sistemas interligados.

## Implementação

1. **Recuperação e base.** Manter a arquitetura atual em `src/odyssey`, o estado em browser storage e as chaves de progresso já usadas. Corrigir erros de integração e ampliar os testes que protegem a campanha, Saga, mapa, saves e zonas.
2. **Mapa dos Atos em Potos.** Adicionar um marco interativo junto ao Oráculo, com UI própria dos cinco atos. Brumavale, Nimbária, Érebo, Lunáris e Coroa ficam visíveis no mapa, selados até a conclusão do respectivo ato, e podem ser revisitados depois.
3. **Zonas de ato jogáveis.** Estender o runtime existente de Saga com cidades sem chefe, moradores e segredos/baús; arenas de sobrevivência com ondas, intervalo e chefe final; e corridas contra o tempo com relógio, penalidade de retorno e recompensa. A progressão continua usando IDs persistentes da Saga.
4. **Atlas e exploração.** Transformar o Atlas de Mana numa visão em camadas: continente, ilhas navegáveis, biomas secretos, reinos dos atos, portais de Saga e estado de descoberta. Preservar a viagem instantânea já existente.
5. **Arte.** Criar e integrar arte pixel-art original gerada por IA para Relicário, Origâmia, Leviatã e os cinco reinos dos atos, como marcos e fundos de zonas, sem texto desenhado e sem substituir a interface acessível.
6. **Conteúdo e história.** Expandir a narrativa em módulos determinísticos: relatos urbanos, diários, ecos, histórias de moradores, missões ramificadas e epílogos. A meta é incluir mais de 120 fragmentos narrativos jogáveis, não apenas texto decorativo.
7. **Novos reinos e cidades.** Criar novos reinos com cidades, progressão de zonas, chefes, escolhas e recompensas, reaproveitando com segurança o gerador de Saga.

## Escopo desta continuação

1. Preservar as 450 cadeias e seus IDs; ampliar o total de segredos do mapa para 45.000, com geração determinística por região e ativação espacial sob demanda para manter memória, saves e desempenho móvel sob controle.
2. Acrescentar oito Reinos Ocultos com identidades, paletas, faunas, relíquias e arquitetura exclusivas; manter a associação de círculos, os portais, o Coração e as chaves de saves antigos.
3. Integrar oito cidades de fronteira, com distritos de paleta própria, 24 prédios acessíveis, moradores inéditos, histórias opcionais e 24 missões encadeadas, em setores já existentes sem redimensionar nem reordenar o mapa.
4. Criar quatro perfis de masmorra com geração estrutural distinta e determinística, mantendo separados o Abismo, a Cidadela e o conteúdo legado.
5. Mostrar a tela de título no APK offline antes de carregar/continuar a partida; todo o HTML, JS, CSS, áudio, imagens e fontes continuam dentro do APK, sem dependência de rede.
6. Validar compatibilidade de saves, alcance das cidades, distribuição dos segredos, conectividade e determinismo das dungeons, build web, pacote offline e APK debug; revisar, publicar e verificar o commit no GitHub.

## Escopo atual — expansão de mundo e sistemas (novembro de 2026)

1. **Continente ampliado.** Dobrar aproximadamente a área de terra visitável acrescentando um continente procedural independente, acessível por portal perto de Potos, com 24 pontos de descoberta e rotas conectadas. Manter o mapa publicado no seu retângulo original de 3200×2400 tiles: aumentar `W/H` ou escalar aquele buffer mudaria índices, custo de memória e coordenadas dos saves.
2. **Arquipélago ampliado.** Expandir o mar de 6000 para 8400 de largura/altura (≈1,96× a área navegável) e acrescentar oito ilhas jogáveis, com nomes, biomas, faunas, recursos, chefes, rotas e recompensas próprias. Os oito IDs/posições originais e progressos de barcos/ilhas permanecem estáveis; as novas margens exigem a Carraca.
3. **Escadarias de bioma.** Disponibilizar uma entrada caminhável por bioma nas superfícies do continente original e de Farlands; cada série tem dez andares encadeados, escadas de subida/descida, tema e minérios locais, checkpoint persistente e chefe guardião próprio no décimo andar. Manter o Abismo de 100 andares, a Cidadela, reinos ocultos e saves preexistentes separados.
4. **Retorno diário.** Criar na tela inicial um calendário de sete dias de recompensas, sequência visível, animação e ação de resgate idempotente, disponível offline e persistida no aparelho. Como o jogo não tem contas nem servidor, este recurso será bônus local por instalação/save, não autenticação online; usa dias UTC e não promete antifraude contra mudança do relógio do dispositivo.
5. **Missões avançadas.** Acrescentar 24 novas cadeias de quatro etapas (96 no total), com metas de caça, coleta, conversa, chefes e avanço no Abismo/minas, pré-requisitos ramificados e recompensas; conectar os eventos ao Livro de Missões e ao save sem reiniciar missões antigas.
6. **Companhia evoluída.** Preservar os 20 IDs e retratos existentes e aprofundar o uso tático dos mercenários: equipamento próprio (arma, armadura, anel e amuleto), três caminhos de talentos, marcos de vínculo/nível, habilidades e missões de expedição. Novos campos são opcionais e recebem defaults ao migrar saves antigos.
7. **Forja e mineração.** Acrescentar oito minérios de bioma/subsolo, veios e caches nas minas, materiais refinados e 24 receitas de equipamento; conectar os itens ao catálogo, custos da forja e loadouts dos mercenários, preservando IDs antigos e receitas já aprendidas.
8. **Biomas vivos.** Aumentar em cerca de 3× a densidade de microdetalhes compostos em cache nos tiles de todos os biomas e acrescentar camadas ambientais animadas pixeladas, determinísticas e adaptativas à qualidade do aparelho, sem criar objetos, canvases ou partículas ilimitadas a cada quadro.
9. **Continuidade de entrega.** Conservar português, arte pixel-art, modo offline, controles móveis, save único e comportamento atual; executar as verificações do projeto, revisar os caminhos críticos independentemente, publicar no mesmo GitHub e recompilar o APK offline com tela inicial.
10. **Residência e interação das cidades.** Instanciar moradores exteriores a partir dos residentes de 24 casas; posicioná-los em tiles caminháveis; proteger soleiras contra minas e estradas; rerotear a Cidadela ao redor de Lira; priorizar portas e saída dos interiores, depois NPCs, antes de portais/segredos, com prompt correspondente.

## Onze sistemas ambiciosos adicionais

1. **Cartografia viva de Vésper:** mapas que mudam conforme escolhas, segredos e ilhas exploradas.
2. **Reconstrução de Potos:** moradores retornam, lojas e atalhos surgem conforme os reinos são libertos.
3. **Laços de Eco:** companheiros narrativos com habilidades combináveis e cenas de lealdade.
4. **Conselho dos Reinos:** decisões entre facções que reconfiguram missões, preços e epílogos.
5. **Expedições oníricas:** masmorras curtas e mutáveis acessadas por memórias coletadas.
6. **Rituais de constelação:** puzzles de céu, mar e som para desbloquear biomas secretos.
7. **Caravanas e rotas comerciais:** pedidos de cidades e melhorias visíveis no mundo.
8. **Museu das Canções Perdidas:** coleção de relíquias com cenas, desafios e versões alternativas de eventos.
9. **Tempestades de Fratura:** eventos mundiais opt-in que transformam regiões e liberam chefes raros.
10. **Novo Ciclo “Ecos Além”:** pós-campanha escalável com escolhas persistentes, modificadores e finais de reinos.
11. **Caçador de Ecos — sistema Nêmesis:** campanha opcional de 12 duelos pós-Ato V em arenas procedurais; o rival registra apenas acertos diretos de arma, reduz somente essa categoria no duelo seguinte e evolui de forma, atributos e recompensas até o confronto final.

## Design

- **Movimento:** pixel art de aventura 16-bit com fantasia melancólica e luzes de mana.
- **Princípios:** legibilidade acima do ruído; cada zona comunica sua regra; escolhas produzem consequências visíveis; conteúdo adicional nunca invalida progresso antigo.
- **Cores:** cada reino recebe uma assinatura cromática, e a interface mantém o ouro/mana como fio condutor.
- **Interação:** marcos físicos no mundo abrem painéis breves; diálogos, mapas e relógios complementam o canvas sem bloquear os controles sem necessidade.
- **Animação:** brilho pulsante, partículas leves e telegráficos claros, respeitando o governor de qualidade existente; efeitos extras de bioma usam fases determinísticas, pixels alinhados e orçamento adaptativo para celular.
- **Tipografia:** preservar a hierarquia e as fontes da interface; texto de história permanece renderizado ao vivo para acessibilidade.
- **Painéis de sistema:** a tela diária e os contratos usam cartões legíveis, hierarquia de raridade e progresso visível, mantendo o acabamento pixel-art, acessibilidade, navegação tátil e suporte ao modo offline.

## Estrutura

- `src/odyssey/atos-reinos.ts`: dados de reinos, zonas, narrativas e escolhas.
- `src/odyssey/saga.ts` e `saga-play.ts`: regras de progresso, entrada e runtime de zonas.
- `src/odyssey/atos-play.ts`: mapa dos atos, modos especiais, marcos, arte e progresso aditivo.
- `src/odyssey/expansion.ts`: novos reinos, cidades, crônicas e sistemas da expansão.
- `src/odyssey/world.ts`, `landmass.ts`, `archipelago.ts` e `sailing.ts`: extensões aditivas do continente e do mar, entradas de POI e novos dados de ilhas; coordenadas e IDs existentes são base imutável.
- `src/odyssey/farlands.ts` e `farlands-play.ts`: novo continente procedural, portal, destinos de exploração e persistência por IDs sem redimensionar o mapa legado.
- `src/odyssey/frontier-town-npcs.ts`, `exploration.ts`, `biome-mine-sites.ts` e `demon-citadel.ts`: moradores caminháveis das cidades; corredores de entrada reservados; estrada da Cidadela desviada para não atravessar casas.
- `src/odyssey/depths.ts`, `dungeon.ts` e `depthplay.ts`: escadarias de dez andares por bioma, nós de minério, boss final temático e transições de retorno, mantendo o Abismo de 100 andares separado.
- `src/odyssey/daily-login.ts` e componentes React: calendário local de retorno diário e sua apresentação na tela inicial.
- `src/odyssey/nemesis.ts`, `echoes-state.ts`, `echoes-play.ts` e `EchoesBeyondPanel.tsx`: arenas do Caçador, estilo observado, adaptação persistente, progressão de doze duelos e interface da caçada.
- `src/odyssey/data.ts`, `engine.ts`, `mercenaries.ts`, `story.ts` e `sidequests.ts`: contratos, objetivos, minérios, receitas, progressão e save compatível.
- `src/components/MercenariesPanel.tsx` e `src/routes/odyssey.tsx`: gestão dos equipamentos/talentos da companhia, quadro de contratos, oficina e resgate diário.
- `src/odyssey/biome-tiles.ts`, `biome-anim.ts`, `scenery.ts` e módulos de testes: camadas visuais em cache, animação governada pela qualidade e cobertura de determinismo/performance.
- `src/routes/odyssey.tsx`: painéis do Atlas, Crônica e descobertas.
- `src/assets/art/` e `public/realms/`: arte gerada e integrada aos marcos do mundo.


## Salas multiplayer gratuitas — novembro de 2026

Usar PeerJS com o PeerServer Cloud público gratuito para sinalização e canais WebRTC; a configuração padrão inclui servidores públicos STUN/TURN de fallback com credenciais demo da biblioteca, sem servidor pago, conta ou armazenamento remoto do jogo. O TURN pode retransmitir tráfego criptografado e não oferece SLA/capacidade garantida. Sala efêmera identificada por código curto aleatório; o host mantém no máximo quatro conexões (cinco jogadores ao todo). O host valida versão de protocolo, mensagens, capacidade e frequência de poses; cada jogador move seu avatar localmente e envia pose compacta, que os outros interpolam no presente. A interface oferece criar/copiar código, entrar, roster e saída limpa. O runtime mantém campanha, inventário, missões, inimigos e recompensas individuais; somente presença/pose/área e animação básica de ataque são compartilhadas. PeerJS oferece configuração padrão pública STUN/TURN; conectividade continua dependente de NAT, políticas de rede e disponibilidade dos serviços públicos. A sala exibe falhas e nunca simula presença; não há SLA nem plano pago ativado. O host deve permanecer aberto e a sala não sobrevive à saída dele. O bundle Android inclui PeerJS e telas localmente; `INTERNET` só habilita a função online aprovada, e o modo solo/recursos continuam utilizáveis offline. Referências: [PeerJS Cloud e fluxo P2P](https://peerjs.com/), [FAQ do PeerJS: conectividade e limite prático](https://peerjs.com/client/faq), [MDN: ICE, STUN e TURN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols).

Arquivos: `src/odyssey/multiplayer-room.ts` controla códigos, sessão PeerJS, protocolo, validação e snapshots; `src/odyssey/engine.ts` expõe pose, filtra áreas e desenha/interpola avatares remotos no mesmo Canvas; `src/routes/odyssey.tsx` integra criar/entrar, código, roster, HUD e saída; `android/app/src/main/AndroidManifest.xml` declara INTERNET para a opção online aprovada. Testes de protocolo e regressões de camada/casas ficam em módulos `.test.ts` ao lado do código.
