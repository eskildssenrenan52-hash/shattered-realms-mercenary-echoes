

## Expansão narrativa e Companhia de Mercenários

- [x] Criar cinco mercenários com identidade, função, elemento, raridade, capítulos pessoais e contratos narrativos que recontextualizam reinos existentes sem interromper a campanha principal com exposição artificial.
- [x] Permitir contratar e manter até dois mercenários simultaneamente; cada aliado luta automaticamente, possui HP, defesa, nível, vínculo, habilidade, experiência e barra de vida própria no mundo.
- [x] Fazer aliados serem alvos reais de inimigos; ao atingir 15% de HP eles recuam, liberam o slot e entram em recuperação lenta até recuperar toda a vida, com estado salvo e retorno seguro.
- [x] Implementar gacha interno com ouro ou Selos de Contrato obtidos em chefes, cinco raridades, pity na décima tentativa, roster sem duplicatas e sem dinheiro real, energia limitada ou monetização externa.
- [x] Adicionar sinergias de dupla, capítulos manuais, progressão de vínculo, recompensa de chefes e história emergente por contratos, ferimentos e retornos a Potos.
- [x] Gerar cinco designs de mercenários com IA no mesmo direcionamento pixel-art das skins do jogador; manter PNGs-mestres e versões WebP 512×512 para runtime.
- [ ] Validar visualmente todos os cinco retratos no navegador.
- [x] Executar o build offline, compilar o APK debug final e verificar que o manifesto não solicita INTERNET.

## Expansão de regiões ocultas e exploração

- [x] Acrescentar quatro Reinos Ocultos com identidades próprias — Cidade das Lanternas Imóveis, Bosque dos Relógios Enraizados, Catedral de Sal Cantante e Forja dos Cometas Adormecidos — com lore, terreno, paleta, inimigos e relíquias específicos.
- [x] Acrescentar 25 cadeias determinísticas de segredos por novo Reino (100 novas cadeias; 450 no total), sem alterar os IDs e a progressão dos 350 segredos já existentes.
- [x] Acrescentar quatro construções exploráveis a Potos, preservando entrada, interiores e compatibilidade com saves antigos.
- [x] Executar testes, verificação TypeScript, build web, embalagem Android offline e compilar o APK debug após aceite autorizado da licença do SDK.

## Continuação: 100× segredos, cidades e masmorras

- [x] Atender “com 100 x mais segredos pelo mapa” preservando as 450 cadeias originais: totalizar 45.000 segredos entre as 650 cadeias (incluídas 200 nas oito regiões novas) e 44.350 descobertas determinísticas, locais e persistentes, indexadas por região para evitar custo global por quadro.
- [x] Atender “muitos mais biomas secretos com designs únicos”: acrescentar oito Reinos Ocultos com paletas, fauna, itens, lore e arquitetura próprios.
- [x] Atender “muitas novas cidades, construções”: integrar oito cidades acessíveis em setores de fronteira existentes, com 24 edifícios exploráveis, residentes, paletas próprias e 24 missões opcionais em cadeias de três etapas.
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
- [x] **Continuidade:** conservar português, pixel-art, saves e modo offline; suíte Vitest final: 189/189; TypeScript e `git diff --check` sem erros; revisão independente sem bloqueadores; APK debug offline compilado e manifesto sem INTERNET; commit `4b8c4cd` publicado em `origin/main`.
