# Cloudflare room service

Este diretório é um serviço separado do servidor Node em `server/room-server.mjs` e não altera o frontend. O Worker expõe `GET /healthz` e `GET /ws`. O cliente atual abre exatamente `/ws` e só envia `create` ou `join` depois do upgrade; por isso o serviço usa um Durable Object coordenador estável chamado `lobby`. WebSockets não podem ser transferidos entre Durable Objects depois que o upgrade termina. O coordenador mantém os sockets hibernáveis e todas as salas em SQLite, e reconstrói o mapa de conexões com `ctx.getWebSockets()` e attachments no constructor.

Essa é uma limitação deliberada de escala: todas as salas deste serviço compartilham uma única instância lógica `lobby` e ficam serializadas pelo mesmo Durable Object. Não há um DO independente por sala sem mudar o protocolo para incluir o código na URL antes do upgrade ou adicionar um preflight. O schema mantém uma linha por sala e jogadores, enquanto poses ficam somente nos attachments/in-memory e nunca são escritas no SQLite a 20 Hz.

## Desenvolvimento local

```sh
cd server/cloudflare
pnpm install --lockfile=false
pnpm run dev
```

O Wrangler usa SQLite local para o Durable Object. Verifique `http://localhost:8787/healthz` e conecte o cliente a `ws://localhost:8787/ws` apenas em desenvolvimento. Em um build HTTPS, use `wss://.../ws`.

Os testes focados não dependem de uma conta Cloudflare:

```sh
pnpm test
```

Também é possível executar o teste diretamente do repositório com `pnpm exec vitest run --config server/cloudflare/vitest.config.mjs`.

## Deploy e migração

Não executei deploy. Depois de revisar a conta e o nome do Worker, rode:

```sh
cd server/cloudflare
pnpm run deploy
```

A primeira migração `v1` usa `new_sqlite_classes: ["RoomCoordinator"]`; o `wrangler deploy` aplica a criação do namespace SQLite. Para qualquer alteração posterior de classes ou backend, acrescente uma entrada com `tag` novo. Não use `wrangler d1 migrations`: o banco é o SQLite privado do Durable Object.

## Vars, allowlist e segredos

Edite `ORIGIN_ALLOWLIST` em `wrangler.jsonc` ou configure-a por ambiente como uma lista separada por vírgulas, por exemplo `https://game.example,https://appassets.androidplatform.net`. Origem ausente continua permitida para clientes nativos; quando a allowlist está configurada, uma origem presente deve coincidir exatamente, ou ser `*`. `ROOM_TTL_MS` permanece em 30 minutos por padrão e `FREE_POSE_MAX_HZ` documenta o limite de quatro poses por segundo. O token da sala é aleatório, tem 32 bytes em base64url e não é uma variável de configuração. O serviço não exige segredo externo; se uma instalação acrescentar autenticação, use `wrangler secret put NAME`, nunca `vars` ou o código-fonte.

## Verificação pós-publicação

1. `curl -i https://<worker>/healthz` deve retornar `200`, `protocol: shattered-realms-room-v1` e o status do soft guard.
2. Configure o cliente para `wss://<worker>/ws`, crie uma sala e confirme que `created` contém código de oito caracteres, token de 43 caracteres e roster.
3. Compartilhe o convite completo `ABCD-2345.<token>`; um segundo cliente deve receber `joined` e `snapshot`.
4. Confirme no DevTools que uma origem não listada recebe `403` no upgrade e que a origem HTTPS listada consegue abrir `wss`.

O Worker não usa timers ou intervalos. Ping/pong usa `setWebSocketAutoResponse`, o TTL usa o alarm do Durable Object, frames de entrada/saída são limitados a 16 KiB e poses iguais não produzem snapshot. O soft guard informa a janela de requisições do Worker no `/healthz`, bloqueia novas conexões acima de 100.000 requisições observadas e mantém o limite gratuito de quatro poses por segundo por conexão. A referência de planejamento é 20 mensagens WebSocket de entrada por requisição, 100.000 requisições Worker/DO e 13.000 GB-s DO por dia no Free; isso não substitui monitoramento da conta Cloudflare.
