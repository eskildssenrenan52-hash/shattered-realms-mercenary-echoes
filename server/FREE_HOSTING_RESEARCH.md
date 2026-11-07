# Hospedagem WSS gratuita — decisão e limites (7 nov 2026)

## Opção escolhida para protótipo público

Cloudflare Workers Free com SQLite-backed Durable Objects, um objeto por sala, Worker HTTP roteando `/ws` e Durable Object com WebSocket Hibernation API. Isso permite hibernar um objeto de sala ocioso sem desconectar sockets; o roster precisa ser reconstruível do SQLite e dos attachments serializados no WebSocket. Usar `setWebSocketAutoResponse` para heartbeat de aplicação e evitar `setInterval`/timers que mantêm o objeto ativo. Fontes oficiais: [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) e [preços de Durable Objects](https://developers.cloudflare.com/durable-objects/platform/pricing/).

## Cotas Free verificadas

- Workers Free: 100.000 requests/dia por conta, resetados às 00:00 UTC; 10 ms CPU por invocação; exceder a cota de requests resulta em erro 1027. Fonte: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) e [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
- Durable Objects Free (SQLite): 100.000 requests/dia e 13.000 GB-s/dia; 5 milhões de linhas lidas/dia; 100.000 linhas escritas/dia; 5 GB de armazenamento por conta. Exceder limites da cota Free faz operações daquele tipo falharem em vez de faturar automaticamente. Fonte: [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/).
- Mensagens WebSocket recebidas em DO são medidas em proporção 20:1 para cobrança de requests; abrir cada socket ainda requer um request. Mensagens de saída e pings de protocolo WebSocket não geram request billed. A API de hibernação reduz GB-s durante inatividade, não reduz as mensagens recebidas. Fonte: [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) e [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/).
- Em uma sala com cinco jogadores, 4 poses/s por jogador durante 24 h representam aproximadamente 86.400 requests/dia equivalentes após 20:1, antes de contar novas conexões e outros requests; 5 poses/s representam aproximadamente 108.000/dia. Por isso o cliente deve enviar 4 Hz como máximo no modo Cloudflare Free, ignorar poses sem alteração, interpolar movimento e reportar claramente limites/quota.
- Runtime updates, pressão de recursos e falhas ainda podem interromper conexões. O cliente precisa de reconexão com backoff e recuperação da sessão; hospedagem gratuita não equivale a SLA ou garantia de disponibilidade.

## Alternativa descartada para always-on

Render Free aceita WebSockets mas encerra serviços gratuitos após 15 minutos sem tráfego de entrada e leva cerca de um minuto para voltar; a própria documentação diz que planos Free não são para produção. Isso pode degradar partidas. Fonte: [Render Free services](https://render.com/docs/free).

## Pendências de conta/deploy

A implementação desta alternativa usa `wrangler`, binding DO SQLite, migration e workflow CI, mas requer que o dono conecte uma conta Cloudflare Free para criar o Worker e publicar em `workers.dev`. Nenhum login, recurso ou deployment foi feito durante a pesquisa. O endpoint WSS só será registrado no cliente após smoke tests públicos com dois dispositivos; o modo P2P continua como fallback.
