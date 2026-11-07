

## Ligar o cliente web ou Android ao servidor

O bundle do cliente seleciona o transporte dedicado quando recebe a variável pública `VITE_MULTIPLAYER_WS_URL` com o endereço completo terminando em `/ws`, por exemplo `wss://multiplayer.example.com/ws`. Ela não é segredo. Em um build web, defina a variável antes de `pnpm run build`; no APK offline, informe `multiplayer_ws_url` em **Actions → Android APK (offline) → Run workflow**. Deixe o campo vazio apenas quando quiser usar o transporte PeerJS/WebRTC legado. Em produção HTTPS, o cliente rejeita `ws://` e exige `wss://`.

A UI mostra o código curto, mas **Copiar convite** inclui o código e o token de sala; jogadores devem colar esse convite completo ao entrar. O servidor também entrega o token a membros já autenticados para que a sala continue convidando depois de uma troca de anfitrião. Não publique o token em páginas abertas ou logs públicos. Em produção, inclua na allowlist a origem HTTPS do site e, para o APK, `https://appassets.androidplatform.net`.
