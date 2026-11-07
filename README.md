# Shattered Realms: Echoes Beyond

RPG de ação 2D em Canvas com campanha, Saga, arquipélago, combate procedural, dungeons e versão Android offline. A rota web do jogo é `/odyssey`; o APK abre a tela de título local, onde é possível iniciar uma jornada ou continuar um save. O manual completo em português está em [GUIA_DO_JOGADOR.md](GUIA_DO_JOGADOR.md), e o tutorial interativo pode ser reaberto dentro do jogo.

## Conteúdo recente

- Todos os chefes, inclusive os líderes do arquipélago, recebem 5× o HP-base exatamente uma vez e têm cinco fases progressivas. Apenas contato e investida corpo a corpo causam dano triplicado; projéteis e telegráficos preservam o dano-base.
- A Cidadela de Gehenna é um desafio pós-campanha com entrada física no extremo remoto do mundo. Ela se abre depois de derrotar Azrakel na Saga.
- A Cidadela tem 100 andares procedurais, dez alas temáticas, guardiões nos andares 10–90 e o Rei Demônio no trono do 100º. Há checkpoints a cada cinco andares e o melhor piso fica salvo separadamente do Abismo.
- Guardiões deixam Brasas de Gehenna, usadas para forjar o Gume do Trono. Azrakel entrega a Coroa Desperta e aciona um epílogo cinematográfico.
- A expansão usa artes pixel-art originais geradas por IA para o portão, sentinelas, relíquia, Azrakel e salão do trono.
- Ecos Além inclui dez sistemas jogáveis: Cartografia viva, Reconstrução de Potos, Laços de Eco, Conselho dos Reinos, Expedições Oníricas, Rituais de constelação, Caravanas, Museu das Canções Perdidas, Tempestades de Fratura opt-in e Novo Ciclo.
- Saves antigos recebem defaults compatíveis; escolhas, rotas, memórias, museu, votações e desfechos pós-campanha são salvos sem substituir os IDs antigos da campanha.
- O Guia completo dentro do jogo foi ampliado para 43 passos e explica controles, combate, progressão, Cidadela e os dez sistemas novos.
- A Companhia preserva os 44 mercenários do catálogo legado e acrescenta até 105 mercenários com folhas AI Kaetram concluídas; entradas da expansão sem arte finalizada não aparecem no catálogo. Mercenários e pets caminham com colisão e contornam obstáculos no seguimento.
- O dano de mercenários foi reduzido a um terço, incluindo o splash dos magos. Entrar ou sair de uma casa não dispara mais cutscenes de biomas artificiais dos interiores.
- Contratos agora custam 850 ouro ou 3 Selos ganhos em chefes, têm pity a cada 18 tentativas e parte do roster exige nível/progresso; não há monetização real. Até dois aliados podem lutar ao mesmo tempo.
- A nova camada narrativa evita exposição forçada: as histórias entram por contratos, retornos a Potos, decisões de companhia, consequências de recuo e diálogos curtos que recontextualizam reinos já visitados.
- O Cântico Oculto conserva as 450 cadeias e acrescenta 200: agora há 650 cadeias determinísticas, 26 Reinos Ocultos mais o Coração e 44.350 caches de exploração; total combinado: 45.000 segredos. Os 450 IDs antigos permanecem estáveis.
- Oito Reinos Ocultos inéditos trazem paletas, terrenos, fauna, relíquias, histórias e dungeons desenhados para cada identidade. As masmorras variam entre labirintos estreitos, arenas de combate, cofres de tesouro e salas espelhadas.
- Oito cidades de fronteira acrescentam 24 construções acessíveis, distritos com paletas próprias, moradores inéditos e 24 missões secundárias em cadeias de três etapas. O Atlas permite viajar diretamente aos novos destinos.
- Potos conserva suas quatro construções antigas e todos os IDs de progresso/save existentes; as novas cidades e descobertas usam chaves separadas.
- A expansão de arquitetura acrescenta 1.000 construções exploráveis determinísticas nos setores Frontier: casas, pousadas, laboratórios, observatórios, forjas, arquivos, minas, ruínas e dungeons. Cada instância recebe ID/assinatura, paleta, planta, objetivo/recompensa e 1–12 andares; interiores são gerados ao entrar e as fachadas são culladas pela câmera.

## Multiplayer online

`server/` contém um serviço Node/WebSocket independente (`pnpm run server`) com health check, convites com token, salas para até cinco jogadores, validação de poses, TTL, heartbeat e transição de anfitrião. A suíte `pnpm run test:server` abre clientes WebSocket reais em localhost. O jogo ainda sincroniza presença/poses: campanha, combate, economia e saves continuam locais. O modo padrão, sem nenhuma configuração ou conta, é o **servidor público automático**: PeerJS fornece sinalização e WebRTC conecta os jogadores diretamente; basta um jogador criar a sala e permanecer conectado. Ele é gratuito, mas depende de NAT, STUN/TURN e do serviço público, sem SLA. Para usar o transporte dedicado, configure `VITE_MULTIPLAYER_WS_URL=wss://seu-host/ws` num build e hospede o serviço com TLS/WSS. Sem URL, o cliente usa o servidor público automático.

O painel multiplayer também oferece reconexão com um toque sem redigitar o convite, indicador do transporte e papel (anfitrião/convidado), cópia rápida do código, contador de vagas, ocultação/exibição dos companheiros no canvas e mensagens de erro orientadas. A preferência visual é salva localmente; esconder jogadores não desconecta ninguém nem altera a sincronização.

## Desenvolvimento e validação

Node.js 22 e pnpm são recomendados; `pnpm-lock.yaml` permite instalar exatamente as dependências usadas na validação. O repositório também mantém `bun.lock`.

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Para executar a suíte e a verificação de tipos:

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm run build
```

## APK Android offline

As instruções completas estão em [ANDROID.md](ANDROID.md). O empacotador inclui o HTML, JavaScript, CSS, fontes, imagens e áudio necessários ao jogo no próprio APK; a campanha e os saves são locais e não dependem de servidor nem de permissão de Internet. O app abre primeiro a tela inicial do jogo e usa o WebView de sistema que acompanha o Android.

No Linux, com Android SDK, build-tools, Gradle e JDK 21 configurados:

```sh
pnpm run apk:package
# Para também compilar o APK de depuração com o SDK e Gradle configurados:
pnpm run apk
```

O workflow manual `.github/workflows/android-apk.yml` compila o APK em GitHub Actions e pode publicá-lo como prerelease público. O modo solo é embarcado e não depende de Manus, site ou app companion; o APK usa o WebView do Android. O transporte dedicado só será incluído se a execução receber um endpoint público `wss://.../ws`.

O APK de depuração aparece em `android/app/build/outputs/apk/debug/app-debug.apk`. O artefato debug é assinado com a chave de desenvolvimento do Android; para distribuição pública, configure a assinatura de release conforme o guia Android.


## APK Android publicado

O APK de depuração desta revisão é a versão 0.3.1 (versionCode 4) e ficará diretamente no repositório em `android/apk/shattered-realms-mercenary-echoes-0.3.1-debug.apk`. Ele inclui as artes Kaetram offline e as correções de dano, navegação, colisão e cenas; é assinado com chave debug e não é uma build de loja.

## Expansão de novembro de 2026

A expansão atual dobra a área continental para 6.400×2.400 tiles sem deslocar a região legada, acrescenta transições de bioma determinísticas e mantém a renderização ambiental limitada à viewport. O mundo distribui mais de 1.000 construções procedurais, com 20 famílias arquitetônicas, 20 plantas interiores, fachadas/paletas, 1–12 andares e objetivos/recompensas próprios; os IDs antigos permanecem estáveis.

O catálogo atualizado contém 149 mercenários (44 legados + 105 com arte AI concluída) e 49 skins de herói (39 legadas + 10 folhas AI Kaetram). Expansões sem arte pronta são omitidas; a ordem dos IDs legados continua preservada para compatibilidade dos saves. A tela de aparência inclui busca, filtro e paginação para celular.

`server/cloudflare/` contém uma implementação preparada para Cloudflare Workers + Durable Object SQLite, com WebSocket Hibernation, `/healthz`, `/ws`, salas de cinco jogadores, tokens, TTL, allowlist, soft guard de quota e protocolo compatível. Ela passou 4 testes focados, mas ainda não está online: esta sessão não tem uma conta Cloudflare/namespace acessível para fazer deploy. Para publicar, siga [`server/cloudflare/README.md`](server/cloudflare/README.md), obtenha uma URL `wss://.../ws` e gere o APK/web com `VITE_MULTIPLAYER_WS_URL`; sem isso, o jogo continua usando o modo P2P legado.
