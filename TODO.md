

## Expansão narrativa e Companhia de Mercenários

- [x] Criar cinco mercenários com identidade, função, elemento, raridade, capítulos pessoais e contratos narrativos que recontextualizam reinos existentes sem interromper a campanha principal com exposição artificial.
- [x] Permitir contratar e manter até dois mercenários simultaneamente; cada aliado luta automaticamente, possui HP, defesa, nível, vínculo, habilidade, experiência e barra de vida própria no mundo.
- [x] Fazer aliados serem alvos reais de inimigos; ao atingir 15% de HP eles recuam, liberam o slot e entram em recuperação lenta até recuperar toda a vida, com estado salvo e retorno seguro.
- [x] Implementar gacha interno com ouro ou Selos de Contrato obtidos em chefes, cinco raridades, pity na décima tentativa, roster sem duplicatas e sem dinheiro real, energia limitada ou monetização externa.
- [x] Adicionar sinergias de dupla, capítulos manuais, progressão de vínculo, recompensa de chefes e história emergente por contratos, ferimentos e retornos a Potos.
- [x] Gerar cinco designs de mercenários com IA no mesmo direcionamento pixel-art das skins do jogador; manter PNGs-mestres e versões WebP 512×512 para runtime.
- [ ] Validar visualmente todos os cinco retratos no navegador.
- [x] Executar o build offline, compilar o APK debug final e conferir o launcher pixel-art; INTERNET é declarada para o multiplayer online opcional e o modo solo usa recursos locais.

## Expansão de regiões ocultas e exploração

- [x] Acrescentar quatro Reinos Ocultos com identidades próprias — Cidade das Lanternas Imóveis, Bosque dos Relógios Enraizados, Catedral de Sal Cantante e Forja dos Cometas Adormecidos — com lore, terreno, paleta, inimigos e relíquias específicos.
- [x] Acrescentar 25 cadeias determinísticas de segredos por novo Reino (100 novas cadeias; 450 no total), sem alterar os IDs e a progressão dos 350 segredos já existentes.
- [x] Acrescentar quatro construções exploráveis a Potos, preservando entrada, interiores e compatibilidade com saves antigos.
- [x] Executar testes, verificação TypeScript, build web, embalagem Android offline e compilar o APK debug após aceite autorizado da licença do SDK.

## Continuação: 100× segredos, cidades e masmorras

- [x] Atender “com 100 x mais segredos pelo mapa” preservando as 450 cadeias originais: totalizar 45.000 segredos entre as 650 cadeias (incluídas 200 nas oito regiões novas) e 44.350 descobertas determinísticas, locais e persistentes, indexadas por região para evitar custo global por quadro.
- [x] Atender “muitos mais biomas secretos com designs únicos”: acrescentar oito Reinos Ocultos com paletas, fauna, itens, lore e arquitetura próprios.
- [x] Atender “muitas novas cidades, construções”: integrar oito cidades acessíveis em setores de fronteira existentes, com 24 edifícios exploráveis, residentes, paletas próprias e 24 missões opcionais em cadeias de três etapas.
- [x] **NPCs e casas operacionais:** manter moradores conversáveis em tiles caminháveis nas oito cidades; preservar portas/corredores após todos os carvers; impedir que minas ou a estrada da Cidadela atravessem soleiras; priorizar portas, saída de interiores e conversa de NPCs sobre portais/segredos, com prompt alinhado.
- [x] Atender “mais tipos de masmorras, dungeons, e muito mais”: acrescentar quatro perfis estruturais de dungeon, desafios e recompensas determinísticos.
- [x] Atender “faça de tudo pro jogo ficar perfeito”: preservar IDs/saves, validar exploração, acessibilidade de locais, determinismo, build e regressões.
- [x] Atender “crie um apk do jogo rodando offline sem dependência nenhuma, com tela inicial e tudo”: garantir a tela de título no Android; incluir os recursos no pacote local; conferir permissões e recompilar o APK.

## Expansão atual — continente, ilhas e sistemas

- [x] **Mundo em dobro e novos lugares:** dobrar aproximadamente a área visitável com um continente procedural independente ligado por portal e 24 pontos de descoberta; preservar coordenadas, mapa, seeds, biomas e IDs legados.
- [x] **Arquipélago em dobro:** expandir o mar de 6000 para 8400 tiles por eixo (≈1,96× área) e adicionar oito ilhas jogáveis com biomas, recursos, quests, chefes e recompensas próprios; conservar os IDs e o progresso das oito ilhas originais.
- [x] **Subsolo por bioma:** colocar entrada caminhável nos 30 biomas de ambas as superfícies; oferecer dez andares temáticos, progressão sequencial, checkpoints locais, minério, baús e chefe/saída selada no décimo andar; manter Abismo, Cidadela, reinos ocultos e saves anteriores compatíveis.
- [x] **Recompensa diária profissional:** exibir na tela inicial calendário de sete dias, sequência e próximo resgate; premiar ouro/XP/itens uma vez por dia, offline e persistente no aparelho/save, usando dia UTC.
- [x] **Missões mais amplas e complexas:** adicionar 24 cadeias (96 etapas) com metas de caça, coleta, conversa, chefes, Abismo e minas; integrar eventos, pré-requisitos, ramificações, Livro de Missões e recompensas sem reiniciar as cadeias legadas.
- [x] **Mercenários aprofundados:** preservar o roster e os IDs; disponibilizar quatro slots de equipamento, três caminhos de talentos por aliado, vínculo/afinidade e sinergias, progressão de combate e expedições persistentes.
- [x] **Minérios e forja ampliados:** acrescentar oito minérios por bioma/andar, veios e caches nas minas, materiais refinados e 24 projetos de equipamento; integrar custos, receitas e loadouts do herói/mercenários sem alterar receitas existentes.
- [x] **Biomas mais detalhados e animados:** triplicar a densidade das camadas de microdetalhes e adicionar animações ambientais pixel-art aos 30 biomas, com cache e controle adaptativo de carga.
- [x] **Continuidade:** conservar português, pixel-art, saves e modo offline; expansão publicada em `origin/main`; APK debug offline compilado; INTERNET reservado às salas multiplayer opcionais.

## Continuação — tutorial e Caçador de Ecos

- [x] **Tutorial sem reaparecimento:** guardar os IDs imutáveis dos spawns comuns abatidos por piso; não reativá-los por temporizador ou ao reiniciar o andar; manter o respawn normal fora do tutorial e a regra do chefe final; cobrir também inimigos que mudaram de posição.
- [x] **Nêmesis adaptativo:** campanha opcional pós-Ato V com 12 arenas procedurais, chefes e recompensas; acompanhar acertos diretos de arma, resistir apenas à categoria aprendida no duelo anterior e expor progresso/início no painel; migrar saves legados com defaults.
- [x] **Validação da correção:** suíte Vitest serial completa 210/210 (42 arquivos) e regressões focais de casas/NPCs/Cidadela 6/6; TypeScript e build web aprovados; ESLint dos módulos novos e regras semânticas dos arquivos alterados aprovados (regra Prettier legado excluída); APK offline de 71,1 MB, assinado em debug e verificado, com 1.618 entradas locais.

## Multijogador online sem custo

- [x] **Salas de até cinco jogadores:** criar uma sala online e exibir código de convite; entrar de outro cliente; limitar a cinco pessoas no total; mostrar roster e avatares/estados; sair sem quebrar a campanha solo/offline; usar PeerJS Cloud e fallback STUN/TURN público sem serviço pago; explicar saída do host, limites de NAT/serviço e progresso individual. Criar/entrar/encerrar foram exercitados em dois clientes reais (2/5); limite cinco, protocolo, poses e códigos têm cobertura automatizada; declarar INTERNET apenas para a conexão opcional. Campanha solo usa assets WebView locais e permanece offline.


## Pedido de 7 de novembro de 2026 — mundo, companhia, servidor e APK

- [x] **Usabilidade e opções:** atender “faça ser muito mais simples e fácil, com muitas novas opções”; o painel tem busca/filtros e requisitos visíveis, recomendação de dupla, formação (linha/cunha/próximo) e postura (agressiva/equilibrada/defensiva), mantendo os controles existentes.
- [x] **Construções pelo mundo:** atender “adicione muitas construções novas não só na cidade mas pelo mundo todo, no mínimo 1000 novas”; adicionar 1.000 instâncias exploráveis distribuídas por setores Frontier/biomas, incluindo casas, dungeons, laboratórios e outros tipos. Atender “cada uma com um design, estética, interior, quantidade de andares, objetivo, tudo diferente” com IDs/assinaturas e combinações determinísticas de fachada/paleta, planta, 1–12 andares, finalidade e objetivo; preservar prédios legados e saves. Cobertura determinística e de entrada/andares/recompensas aprovada.
- [x] **Mercenários e skins:** atender “deixe o sistema de mercenário 100x melhor funcionando que nem pets tanto em movimentação, etc” com acompanhamento/formações, reposicionamento, aproximação de alvos/retorno e opções táticas; atender “faça ser muito mais difícil conseguir um mercenário” com contratos de 850 ouro ou 3 selos, pity a cada 18 e gates de nível/progresso; “crie dezenas de mercenários e skins do player novas pro jogo”, totalizando 44 mercenários e 24 novas skins sem alterar IDs/índices anteriores.
- [x] **Servidor multiplayer — código e integração:** atender “faça o servidor dele online funcionar de verdade” com serviço Node/WebSocket independente, health check, convites com token, salas/limites, validação, heartbeat, TTL, transição de anfitrião, integração WSS web/Android e testes reais locais; sincroniza presença/poses, enquanto campanha, combate e saves permanecem locais.
- [ ] **Servidor multiplayer — hospedagem pública:** falta instalar/hospedar a instância em serviço persistente com endereço público TLS/WSS, configurar `ORIGIN_ALLOWLIST` e `VITE_MULTIPLAYER_WS_URL`, conectar dois clientes externos e verificar disponibilidade. O pedido “garanta que o servidor multiplayer funcione com perfeição” não será afirmado sem esses testes de produção; este Sandbox não é um host persistente.
- [x] **APK independente — bundle:** atender “crie um apk online do jogo mas sem nenhuma dependência do manus ou nenhum app, sem marca d agua”; o bundle solo local inclui HTML/JS/CSS/fontes/imagens/áudio sem runtime/conta do Manus nem app companion e foi empacotado com 70 MB. O Android usa o WebView do próprio sistema; multiplayer é opcional e usa endpoint WSS externo configurável.
- [x] **APK independente — publicação:** workflow GitHub Actions executado com sucesso (`42396056037`); prerelease público `android-apk-3` contém `app-debug.apk` (69.825.590 bytes), baixado e verificado como APK/ZIP íntegro. SHA-256: `7cd2f2c5b96ef904966ee4a4b0e8d1782461a83b33f1826726f28e0e493daea4`. Build sem WSS dedicado porque não havia host/URL; modo solo offline e P2P legado continuam disponíveis.
- [x] **Push para GitHub:** “depois faça o push pro github”; código, correções de CI e documentação foram enviados com commits normais a `origin/main`, sem reescrever histórico nem incluir chaves. O HEAD remoto foi consultado e conferido depois do push final.


## Expansão solicitada em 7 de novembro de 2026 — mundo, catálogos e WSS gratuito

- [x] **Mundo 2× maior:** duplicada a área explorável do continente para 6.400×2.400 tiles, preservando a região 3.200×2.400 e suas assinaturas; novos setores são determinísticos, conectados e adequados a geração por setor.
- [x] **Mundo mais orgânico e vivo:** margens novas irregulares, transições visuais determinísticas entre biomas e overlays limitados à viewport foram adicionados sem alterar colisão/IDs; animações ambientais existentes continuam governadas por qualidade.
- [x] **Construções — refinamento do sistema existente:** mais de 1.000 instâncias mantidas com 20 famílias arquitetônicas, 20 layouts internos, fachadas/paletas, 1–12 andares, objetivos e recompensas; prédios legados não foram renumerados. “20×” foi tratado como profundidade de variedade, não como promessa de 20.000 prédios.
- [x] **Catálogo de mercenários:** adicionados exatamente 200 aos 44 anteriores, total 244, com IDs/gates estáveis, estatísticas e identidades paramétricas; os sprites usam a folha base local com filtros, sem alegar 200 PNGs individuais.
- [x] **Skins do jogador:** adicionadas exatamente 200 após as 39 antigas, total 239; índices persistidos permanecem estáveis e a tela usa busca, filtro e paginação de 18 itens.
- [x] **Servidor online gratuito — implementação:** preparado Worker Cloudflare + Durable Object SQLite com WebSocket Hibernation, protocolo compatível, limites gratuitos, allowlist, TTL e health check. Os testes locais do Worker (4/4) e Node (5/5) passaram.
- [ ] **Servidor online gratuito — publicação:** ainda falta uma conta Cloudflare com Workers/Durable Objects acessível, endereço público TLS/WSS e teste externo com dois clientes. A API disponível retornou zero contas; não há URL pública para afirmar como online.
- [x] **Validação e publicação do código:** TypeScript, build e suíte completa passaram (45 arquivos/234 testes); o APK/release anterior permanece disponível. O push desta nova expansão ainda será feito após a revisão final do diff.
