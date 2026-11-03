# Shattered Realms: Echoes Beyond

RPG de ação 2D em Canvas com campanha, Saga, arquipélago, combate procedural, dungeons e versão Android offline. A rota web do jogo é `/odyssey`; o APK abre diretamente uma partida local. O manual completo em português está em [GUIA_DO_JOGADOR.md](GUIA_DO_JOGADOR.md), e o tutorial interativo pode ser reaberto dentro do jogo.

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

As instruções completas estão em [ANDROID.md](ANDROID.md). O empacotador inclui HTML, JavaScript, fontes, imagens, áudio, efeitos e os cem pisos gerados no aplicativo. O jogo não precisa acessar um site nem de permissão de Internet; a Activity inicia a rota local do jogo automaticamente. Como é um WebView empacotado, ele usa o WebView de sistema que já acompanha o Android.

No Linux, com Android SDK, build-tools, Gradle e JDK 21 configurados:

```sh
pnpm run apk:package
# Para também compilar o APK de depuração com o SDK e Gradle configurados:
pnpm run apk
```

O APK de depuração aparece em `android/app/build/outputs/apk/debug/app-debug.apk`. O artefato debug é assinado com a chave de desenvolvimento do Android; para distribuição pública, configure a assinatura de release conforme o guia Android.
