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
- A Companhia de Mercenários permite contratar até dois aliados simultâneos. Cada um tem vida, defesa, nível, vínculo, habilidade, capítulos pessoais e comportamento próprio; ao chegar a 15% de HP, recua e só retorna após uma recuperação demorada.
- O Contrato Gacha usa somente ouro e Selos de Contrato ganhos em chefes. Há vinte personagens, cinco raridades, pity na décima tentativa, roster persistente, sinergias de dupla e capítulos que avançam pelo convívio; não existe compra com dinheiro real, energia limitada ou pressão de monetização.
- A nova camada narrativa evita exposição forçada: as histórias entram por contratos, retornos a Potos, decisões de companhia, consequências de recuo e diálogos curtos que recontextualizam reinos já visitados.
- O Cântico Oculto conserva as 450 cadeias e acrescenta 200: agora há 650 cadeias determinísticas, 26 Reinos Ocultos mais o Coração e 44.350 caches de exploração; total combinado: 45.000 segredos. Os 450 IDs antigos permanecem estáveis.
- Oito Reinos Ocultos inéditos trazem paletas, terrenos, fauna, relíquias, histórias e dungeons desenhados para cada identidade. As masmorras variam entre labirintos estreitos, arenas de combate, cofres de tesouro e salas espelhadas.
- Oito cidades de fronteira acrescentam 24 construções acessíveis, distritos com paletas próprias, moradores inéditos e 24 missões secundárias em cadeias de três etapas. O Atlas permite viajar diretamente aos novos destinos.
- Potos conserva suas quatro construções antigas e todos os IDs de progresso/save existentes; as novas cidades e descobertas usam chaves separadas.

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

O APK de depuração aparece em `android/app/build/outputs/apk/debug/app-debug.apk`. O artefato debug é assinado com a chave de desenvolvimento do Android; para distribuição pública, configure a assinatura de release conforme o guia Android.
