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

## Dez sistemas ambiciosos adicionais

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

## Design

- **Movimento:** pixel art de aventura 16-bit com fantasia melancólica e luzes de mana.
- **Princípios:** legibilidade acima do ruído; cada zona comunica sua regra; escolhas produzem consequências visíveis; conteúdo adicional nunca invalida progresso antigo.
- **Cores:** cada reino recebe uma assinatura cromática, e a interface mantém o ouro/mana como fio condutor.
- **Interação:** marcos físicos no mundo abrem painéis breves; diálogos, mapas e relógios complementam o canvas sem bloquear os controles sem necessidade.
- **Animação:** brilho pulsante, partículas leves e telegráficos claros, respeitando o governor de qualidade existente.
- **Tipografia:** preservar a hierarquia e as fontes da interface; texto de história permanece renderizado ao vivo para acessibilidade.

## Estrutura

- `src/odyssey/atos-reinos.ts`: dados de reinos, zonas, narrativas e escolhas.
- `src/odyssey/saga.ts` e `saga-play.ts`: regras de progresso, entrada e runtime de zonas.
- `src/odyssey/atos-play.ts`: mapa dos atos, modos especiais, marcos, arte e progresso aditivo.
- `src/odyssey/expansion.ts`: novos reinos, cidades, crônicas e sistemas da expansão.
- `src/routes/odyssey.tsx`: painéis do Atlas, Crônica e descobertas.
- `src/assets/art/` e `public/realms/`: arte gerada e integrada aos marcos do mundo.
