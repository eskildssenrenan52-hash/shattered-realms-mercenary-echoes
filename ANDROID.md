# APK Android offline

O APK é uma casca Android nativa que inclui a distribuição estática completa do jogo em `android/app/src/main/assets/game/`. A activity abre `https://appassets.androidplatform.net/assets/game/index.html` por meio do `WebViewAssetLoader`; essa origem é servida somente a partir dos assets empacotados no próprio APK. Não há site hospedado, login, permissão de Internet ou aplicativo de terceiros necessário para iniciar e jogar. O Android fornece o WebView do sistema.

Ao abrir o app, aparece a tela de título do jogo, com as opções Nova jornada e Continuar quando existe um save local. O progresso fica no armazenamento local privado do app; desinstalar o APK apaga esses saves.

## Requisitos de build

- Bun e dependências fixadas em `bun.lock` (`bun install --frozen-lockfile`).
- JDK completo 17 ou superior, com `javac` e `jlink` (um JRE sozinho não basta).
- Android SDK Platform 35 e Build Tools 35.
- Compatibilidade do APK: Android 5.0/API 21 ou superior; a versão 0.2.0 usa `ContextCompat` para não chamar APIs de cor indisponíveis em Android antigo.
- Gradle compatível com o Android Gradle Plugin do projeto (o build deste repositório usa Gradle 8.9).
- Configure `JAVA_HOME` e `ANDROID_HOME`/`ANDROID_SDK_ROOT`.

A configuração inicial pode baixar dependências de build; isso não cria dependência de rede no jogo instalado.

## Gerar o APK debug

Na raiz do repositório, execute `./build-apk.sh` (Linux/macOS com Bash) ou `build-apk.bat` (Windows com Bun, Bash e Gradle). O wrapper executa `scripts/package-android-offline.sh`, que cria um bundle Vite cliente independente de SSR, copia a tela de jogo, CSS, JavaScript e assets locais para `android/app/src/main/assets/game/`, e compila o app nativo.

Alternativamente:

```bash
bun install --frozen-lockfile
bun run apk
```

Saída: `android/app/build/outputs/apk/debug/app-debug.apk`. Esse APK é assinado com a chave debug para testes; distribuição de loja requer assinatura release própria.

## Verificação

Execute `bun run test` e `bun x tsc --noEmit` para validar lógica e tipos. `bash scripts/package-android-offline.sh` também confere a entrada estática e o atlas FX de 80 animações × 5 quadros. Abra o APK em um Android/emulador com rede desligada para a validação final no dispositivo.


## Build e download pelo GitHub Actions

O workflow manual `.github/workflows/android-apk.yml` configura Node, JDK, Android SDK 35 e Gradle 8.9, executa Vitest, testes do servidor, TypeScript, empacota os assets offline e compila o APK. Depois que o workflow estiver no GitHub, abra **Actions → Android APK (offline) → Run workflow**. Com `publish_release` desativado, o APK fica como artefato do run por 30 dias; ativando-o, a execução publica um prerelease público com o APK anexado.

Este APK usa a chave debug e serve para teste/instalação direta; não use essa chave na Play Store. O modo solo inclui os assets no pacote e não exige Manus, site, login nem app companion. O Android usa o WebView do sistema. Sem uma URL dedicada, o multiplayer usa o servidor público automático PeerJS/WebRTC: não requer conta, instalação, servidor próprio ou intervenção, mas o anfitrião precisa permanecer conectado e a qualidade depende de NAT/STUN/TURN.

Para habilitar o servidor dedicado, informe `multiplayer_ws_url` com a URL completa `wss://servidor.example/ws` ao executar o workflow. Se deixar o campo vazio, o APK usa automaticamente o servidor público PeerJS/WebRTC e não se conecta ao serviço Node/WebSocket deste repositório.

## APK de teste publicado

A build compatível está no [GitHub Release android-apk-8](https://github.com/eskildssenrenan52-hash/shattered-realms-mercenary-echoes/releases/tag/android-apk-8): [baixar `app-debug.apk`](https://github.com/eskildssenrenan52-hash/shattered-realms-mercenary-echoes/releases/download/android-apk-8/app-debug.apk) (70.048.681 bytes). SHA-256: `39ea8ba062057dc372b22df347996882760c8d6ed9d8278d9e2b283eace170e9`. GitHub Actions passou testes, typecheck, bundle offline e `assembleDebug`; o APK foi baixado e validado como pacote Android/ZIP. Esta versão usa SDK mínimo API 21, `ContextCompat` e os designs únicos completos dos catálogos expandidos. A assinatura é debug, não distribuição de loja.

## Worker Cloudflare gratuito opcional

O código de `server/cloudflare/` está pronto para deploy em Workers + Durable Objects SQLite e mantém o protocolo WSS do jogo. Ele foi validado localmente, mas não existe uma URL pública nesta entrega porque a conta Cloudflare acessível não expôs nenhum account/namespace. Depois de conectar uma conta gratuita com a permissão necessária, execute o fluxo descrito em [`server/cloudflare/README.md`](server/cloudflare/README.md), confirme `GET /healthz` e use a URL completa `wss://<worker>/ws` no input `multiplayer_ws_url` do workflow. Sem esse input, o APK segue independente e usa o transporte P2P legado; o modo solo não depende do servidor.
