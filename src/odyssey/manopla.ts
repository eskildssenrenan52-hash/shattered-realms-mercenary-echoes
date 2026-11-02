// As Travessias da Manopla — três reinos arrancados do mundo pelo Silêncio.
// Ao vencer o Ato I, o Colosso de Cristal deixa cair a Manopla de Vésper, a mão da
// Primeira Cartógrafa. Com ela, a Fenda Costurada em Potos abre caminho para lugares
// que o mundo esqueceu. Dado puro: os reinos entram em SAGA_REALMS com `gate: 'manopla'`,
// então reutilizam zonas, chefes, provações e saves da Saga sem nenhum estado novo.
import type { Biome, EnemyKind } from './data';
import type { SagaBoss, SagaFx, SagaRealm, SagaZone, SideStep, SideStory } from './saga';
import { T } from './world';

export { MANOPLA_ITEM, MANOPLA_QUEST, MANOPLA_BEAT } from './manopla-lore';

const z = (name: string, lore: string, biome: Biome, tiles: [number, number, number], enemies: EnemyKind[], fx: SagaFx, color: string, light: number, tint: [number, number, number, number], boss: SagaBoss, fx2?: SagaFx): SagaZone =>
  ({ name, lore, biome, floor: tiles[0], wall: tiles[1], deco: tiles[2], enemies, fx, fx2, color, light, tint, boss });
const b = (name: string, kind: EnemyKind, tint: string, scale: number, intro: string, ...victory: string[]): SagaBoss => ({ name, kind, tint, scale, intro, victory });

export const MANOPLA_REALMS: SagaRealm[] = [
  /* ═════════════ I — O RELICÁRIO DAS HORAS PARADAS ═════════════ */
  {
    id: 'relicario', gate: 'manopla', name: 'Relicário das Horas Paradas', subtitle: 'Travessia I — A Cidade do Último Minuto', level: 8, color: '#e8c070', portal: '#ffd27a',
    prologue: [
      'A Manopla de Vésper aperta seu punho sozinha. Os dedos de latão se fecham na borda da Fenda e puxam.',
      'O ar rasga como papel velho. Do outro lado, um som que você nunca ouviu: o tique-taque de um relógio que não anda.',
      'Voz na Manopla: — Este é Horália. Era a cidade dos relojoeiros, onde a Canção tinha compasso.',
      '— Quando o Silêncio chegou, ela foi a primeira a ouvir. Os relojoeiros pararam todos os relógios, para que o último minuto bom nunca acabasse.',
      '— Funcionou. Funcionou bem demais. Horália foi arrancada do tempo, e o mundo esqueceu que ela existiu.',
      '— Eu sou Vésper. Ou fui. Esta Manopla era a minha mão. Ande comigo, e eu conto o resto.',
    ],
    epilogue: [
      'O Pêndulo desaba. Pela primeira vez em cem anos, um ponteiro avança: tic.',
      'Pelas ruas, gente congelada no meio do passo termina o passo. Uma criança termina de rir.',
      'Vésper: — Agora você entende por que eles pararam o tempo. O minuto seguinte era o Silêncio chegando.',
      'Vésper: — Mas um minuto que não acaba não é vida. É só um quadro bonito na parede.',
      'Na torre, entre engrenagens, um caderno de aprendiz. Na capa, uma letra torta: "Vael, 9 anos — aprendiz de Vésper".',
      'Vésper fica muito tempo em silêncio. — Ele era meu aluno. O menino que perguntava por que as músicas acabam.',
      'A Manopla esquenta. Uma nova costura brilha na Fenda: Origâmia, o atlas que eu deixei aberto.',
    ],
    reward: { item: 'manopla_relicario', name: 'Ponteiro Vivo', desc: 'O primeiro ponteiro de Horália a andar em cem anos. Bate junto com o seu coração.', slot: 'amulet' },
    zones: [
      z('Praça dos Ponteiros Mortos', 'Cem relógios na praça, todos marcando 11:59. Pombas presas no ar, no meio do voo.', 'ruins', [T.COBBLE, T.WALL, T.PILLAR], ['skeleton', 'golem', 'bat'], 'gears', '#e8c070', 0.3, [230, 190, 110, 0.2],
        b('Guarda-Noturno Tic, o Imóvel', 'golem', '#c8a050', 2.6, 'Tic ergue a lanterna, que não pisca há cem anos: — Toque de recolher. Ninguém anda depois das 11:59. Ninguém.', 'Tic dá um passo — o primeiro em um século — e desaba de alívio.', 'Na lanterna, um bilhete: "Se alguém vier, abra o Aqueduto. A Relojoeira está lá embaixo."'), 'sparkles'),
      z('Aqueduto das Engrenagens Afogadas', 'A água parou no meio da queda. Dentro de cada gota, uma engrenagem minúscula espera o tempo voltar.', 'cave', [T.FLOOR, T.CWALL, T.WATER], ['rat', 'beetle', 'slime'], 'bubbles', '#c0d890', 0.5, [150, 190, 120, 0.24],
        b('Rainha-Rato Corda-Frouxa', 'rat', '#b09060', 2.8, 'Uma rata de corda, do tamanho de uma carroça, range os dentes de latão: — A chave de corda é minha! O tempo que sobrar, eu como!', 'A chave nas costas dela gira ao contrário até parar.', 'Ela guardava, entre os dentes, a última chave da Biblioteca dos Minutos.'), 'gears'),
      z('Biblioteca dos Minutos Perdidos', 'Prateleiras de ampulhetas. Em cada uma, um minuto que alguém desperdiçou e se arrependeu.', 'marble', [T.PANEL, T.WALL, T.FURNITURE], ['wraith', 'wisp', 'mimic'], 'ghosts', '#d0c0ff', 0.55, [180, 160, 230, 0.26],
        b('Arquivista Sem-Ontem, Meridia', 'wraith', '#b0a0e0', 3, 'Meridia folheia um livro em branco: — Eu cataloguei todos os minutos de Horália. Menos o meu. Eu esqueci o meu ontem.', 'Meridia encontra, entre as páginas, uma ampulheta com o próprio nome. Ela sorri e vira pó dourado.', 'Ela deixa uma frase escrita no ar: "O menino de Vésper vinha aqui chorar. Dizia que toda música acaba."'), 'sparkles'),
      z('Torre do Relógio-Mãe', 'A torre que dá corda em todos os relógios do mundo. No alto, um pêndulo do tamanho de uma catedral, parado no meio do balanço.', 'thunder', [T.FLOOR, T.CWALL, T.CRYSTAL], ['gargoyle', 'golem', 'shade'], 'gears', '#ffd27a', 0.25, [255, 210, 120, 0.22],
        b('O Pêndulo Imóvel, Coração de Horália', 'golem', '#e0b040', 3.6, 'O Pêndulo fala com a voz de mil relojoeiros: — Se eu balançar, o Silêncio chega. Fique. Fique para sempre às 11:59.', 'O Pêndulo balança uma vez. O sino da torre toca meio-dia — e nada desaba.', 'O Silêncio não estava esperando ali. Ele foi embora há muito tempo. Só o medo ficou.'), 'stars'),
    ],
  },
  /* ═════════════ II — ORIGÂMIA, O ATLAS DOBRADO ═════════════ */
  {
    id: 'origamia', gate: 'manopla', name: 'Origâmia, o Atlas Dobrado', subtitle: 'Travessia II — O Mapa Que Se Fechou', level: 16, color: '#f4ecd8', portal: '#ff6a5a',
    prologue: [
      'A Fenda se desdobra como uma carta. Você pisa num chão que estala: papel. Tudo aqui é papel.',
      'Vésper: — Este é o meu atlas. Eu desenhava a Canção em mapas, e os lugares desenhados ganhavam vida aqui dentro.',
      '— Quando Vael cresceu, ele aprendeu a desenhar comigo. Depois aprendeu a apagar.',
      '— Cada lugar que ele queria esquecer, ele arrancava daqui e dobrava até sumir. Horália foi o primeiro.',
      '— Origâmia se fechou para proteger o que restou. Os bichos de papel não sabem mais quem é amigo.',
      'Um grou de papel pousa no seu ombro, olha para a Manopla e foge, assustado.',
    ],
    epilogue: [
      'A Cópia de Papel se desfaz em mil tiras. Cada tira é uma linha de um mapa que Vael rasgou.',
      'O atlas se abre de novo. Montanhas de papel se erguem, rios de tinta voltam a correr.',
      'Vésper: — Ele copiou a si mesmo em papel para guardar o atlas. Até a cópia tinha medo de ser lembrada.',
      'Vésper: — Agora eu lembro de tudo. Vael não odiava a Canção. Ele ouviu a nota mais triste dela e quis que ninguém mais ouvisse.',
      'No centro do atlas, desenhado em vermelho, um animal imenso: uma baleia nadando entre estrelas.',
      'Vésper: — O Leviatã Cantor. A primeira voz da Canção. Foi lá que meu aluno se perdeu. E foi lá que eu perdi a mão.',
    ],
    reward: { item: 'manopla_origamia', name: 'Pena da Primeira Cartógrafa', desc: 'Desenha caminhos onde antes não havia nada. A tinta nunca seca.', slot: 'ring' },
    zones: [
      z('Planícies de Papel Dobrado', 'Grama de papel picotado, colinas vincadas, um céu pintado à mão que às vezes borra com a chuva.', 'meadow', [T.MEADOW, T.BUSH, T.FLOWER], ['crow', 'pixie', 'boar'], 'feathers', '#f4ecd8', 0.15, [245, 235, 215, 0.2],
        b('Grou-Mil-Dobras, Senbazuru', 'crow', '#f0e8e0', 3, 'Mil grous de papel se dobram num só: — Quem carrega a mão de Vésper? Ela nos deixou. Ela nos deixou dobrados!', 'Senbazuru se desdobra até virar uma folha lisa. Escrito nela: "desculpa".', 'Os grous menores pousam ao seu redor, curiosos. A Manopla treme, comovida.'), 'petals'),
      z('Rio de Tinta Nanquim', 'Um rio negro que escreve sozinho nas margens. Quem cai nele vira uma palavra.', 'swamp', [T.MOSS, T.ROCK, T.WATER], ['serpent', 'frog', 'shade'], 'rain', '#7080a0', 0.5, [60, 70, 110, 0.3],
        b('Lula-Tinteiro Sumi', 'serpent', '#303850', 3.1, 'Sumi espirra tinta e escreve seu nome no ar: — Vou riscar você, como ele me ensinou a riscar.', 'Sumi solta a última gota de tinta: uma lágrima preta, perfeita.', 'A tinta do rio forma uma frase: "Vael me criou para apagar. Eu só queria escrever."'), 'bubbles'),
      z('Cidade das Legendas Apagadas', 'Casas sem nome, ruas sem placa. Tudo que tinha legenda foi raspado com borracha.', 'ruins', [T.COBBLE, T.WALL, T.RUINS], ['goblin', 'skeleton', 'mimic'], 'sand', '#d8c8b0', 0.4, [200, 180, 150, 0.24],
        b('Borracha-Rei Delethos', 'golem', '#e0a0a0', 3.3, 'Delethos rola pelas ruas, raspando tudo: — Nomes doem. Lugares com nome deixam saudade. Eu tiro a saudade.', 'Delethos se gasta até sobrar só um farelo rosado.', 'Nas paredes, os nomes voltam a aparecer, um por um. Uma das casas se chama "Casa de Vésper e Vael".'), 'sparkles'),
      z('Floresta de Bússolas', 'Árvores de papel com bússolas no lugar de frutos. Todas apontam para um lugar diferente.', 'bamboo', [T.MOSS, T.TREE, T.BUSH], ['spider', 'wolf', 'sprite'], 'leaves', '#a0d090', 0.35, [140, 200, 130, 0.22],
        b('Cervo Rosa-dos-Ventos', 'wolf', '#c0e0a0', 3.2, 'Os chifres do cervo são uma rosa-dos-ventos de oito pontas: — Todo caminho que eu aponto leva para longe dele. Volte.', 'O cervo abaixa os chifres. Todas as bússolas da floresta apontam juntas para o mesmo lugar.', 'Para o fundo do atlas. Para a Dobra Final.'), 'fireflies'),
      z('A Dobra Final', 'O vinco onde Vael fechou o atlas. Aqui o papel é tão dobrado que vira cristal.', 'prism', [T.FLOOR, T.WALL, T.CRYSTAL], ['wraith', 'gargoyle', 'sprite'], 'sparkles', '#ff6a5a', 0.3, [255, 120, 110, 0.2],
        b('Vael Dobrado, a Cópia de Papel', 'shade', '#f0e0d8', 3.6, 'Um rapaz de papel, com os olhos de Vael, abre os braços: — Eu sou o que ele deixou aqui. Se você abrir o atlas, ele vai ter que lembrar. E lembrar dói.', 'A cópia se desfaz devagar: — Diz pra ele... que eu guardei a casa. Que ainda tem nome.', 'Vésper, baixinho: — Eu vou dizer, meu menino. Eu vou.'), 'void'),
    ],
  },
  /* ═════════════ III — O VENTRE DO LEVIATÃ CANTOR ═════════════ */
  {
    id: 'leviata', gate: 'manopla', name: 'Ventre do Leviatã Cantor', subtitle: 'Travessia III — A Primeira Voz', level: 26, color: '#80e0ff', portal: '#9ef6ff',
    prologue: [
      'A Fenda se abre para o nada. Não há chão. Há estrelas por baixo, por cima, por todos os lados.',
      'E no meio delas, imenso como uma cordilheira, o esqueleto de uma baleia nadando devagar.',
      'Vésper: — O Leviatã Cantor. Antes da Árvore, antes de Potos, ele cantou a primeira nota. O mundo inteiro nasceu do eco dela.',
      '— Vael veio aqui, já homem, e ouviu a nota mais funda do Leviatã: a nota do adeus, a que toda canção carrega no fim.',
      '— Ele decidiu que, se a Canção sempre termina em adeus, era melhor que ela nunca tocasse. E forjou uma mordaça para o Leviatã.',
      '— Eu tentei impedir. Enfiei a mão na garganta do Leviatã para arrancar a mordaça. A mão ficou. O resto de mim, não.',
      '— Entre, herói. A minha mão quer voltar para casa.',
    ],
    epilogue: [
      'A Mordaça se parte. Por um instante, nada. Depois, das costelas até a cauda, o Leviatã respira.',
      'E canta. Uma nota tão grave que as estrelas tremem. Muito longe, em Potos, a Árvore de Mana responde.',
      'A Manopla se solta do seu braço e flutua até a garganta do Leviatã. Lá, finalmente, ela encontra o resto de Vésper: uma luz pequena, cansada, sorrindo.',
      'Vésper: — Obrigada. Agora escute: a nota do adeus não é o fim da Canção. É o que faz ela valer a pena.',
      'Vésper: — Quando você encontrar Vael nas Fendas de Obsidiana, não lute só com a espada. Cante isso para ele.',
      'A Manopla volta para a sua mão, mais leve. Agora ela é sua. As Fendas continuam costuradas, para quem quiser voltar.',
    ],
    reward: { item: 'manopla_leviata', name: 'Manopla Desperta de Vésper', desc: 'A mão da Primeira Cartógrafa, enfim livre. Fecha o punho no ritmo da Canção.', slot: 'armor' },
    zones: [
      z('Mar de Estrelas Mortas', 'Você caminha sobre constelações apagadas. Cada passo acende uma estrela que alguém esqueceu de desejar.', 'aurora', [T.FLOOR, T.ROCK, T.CRYSTAL], ['wisp', 'jelly', 'crow'], 'stars', '#9ef6ff', 0.15, [120, 200, 255, 0.2],
        b('Rêmora Celeste Ylla', 'jelly', '#90e0ff', 3, 'Ylla gruda no casco de estrelas do Leviatã: — Ele é meu! Enquanto ele dorme, eu como a luz dele!', 'Ylla se solta, e as estrelas ao redor brilham mais forte.', 'Ao longe, o esqueleto do Leviatã abre a boca, como quem espera.'), 'clouds'),
      z('Arcos das Costelas', 'Costelas brancas do tamanho de catedrais. Entre elas, teias feitas de ossinhos de peixe.', 'obsidian', [T.ASH, T.PILLAR, T.RUINS], ['skeleton', 'spider', 'bat'], 'ash', '#e8e0d0', 0.5, [220, 210, 190, 0.26],
        b('Tecelã-de-Ossos Marrow', 'spider', '#e0d8c8', 3.2, 'Marrow tece com fios de medula: — Vael me pagou para costurar o peito do Leviatã. Nada entra, nada sai, nenhum som escapa.', 'Os fios de Marrow se rompem um por um, como cordas de harpa.', 'Pela primeira vez, um som escapa das costelas: um suspiro do tamanho de um vento.'), 'ghosts'),
      z('Estômago dos Naufrágios', 'O Leviatã engoliu mil navios que tentaram ouvi-lo de perto. Os marujos ainda moram aqui.', 'mangrove', [T.SAND, T.CWALL, T.WATER], ['crab', 'slime', 'serpent'], 'spores', '#a0d0a0', 0.55, [110, 170, 120, 0.28],
        b('Almirante Engolido Corvell', 'skeleton', '#80b0a0', 3.3, 'Corvell bate a espada no casco: — Ninguém sai! Lá fora a Canção acabou! Aqui dentro, pelo menos, ainda tem eco!', 'Corvell guarda a espada: — Então ainda tem música lá fora? ... Então leve os meus homens com você.', 'Os marinheiros fantasmas cantam uma cantiga de porto. Desafinada. Linda.'), 'bubbles'),
      z('Coração Fossilizado', 'Um coração de pedra do tamanho de uma montanha. A cada mil anos, ele bate uma vez. Está quase na hora.', 'crimson', [T.CAVE, T.CWALL, T.LAVA], ['imp', 'salamander', 'golem'], 'embers', '#ff7060', 0.5, [255, 90, 80, 0.28],
        b('O Batimento Que Sobrou', 'golem', '#d04040', 3.5, 'Uma batida de coração ganhou corpo, braços e raiva: — Ele não precisa de mim! Ele parou de cantar, então eu parei de bater!', 'O Batimento volta para dentro do coração de pedra. Tum.', 'O chão inteiro treme. O Leviatã, em algum lugar acima, abre um olho.'), 'ash'),
      z('Garganta do Último Canto', 'O túnel por onde passou a primeira nota do mundo. No fundo, presa nas cordas vocais, uma mordaça de ferro preto.', 'moonwood', [T.CAVE, T.CWALL, T.CRYSTAL], ['wraith', 'shade', 'serpent'], 'void', '#9ef6ff', 0.25, [150, 220, 255, 0.24],
        b('A Primeira Mordaça', 'wraith', '#404060', 3.8, 'A Mordaça fala com a voz de Vael: — Toda canção acaba em adeus. Eu só poupei o mundo do último verso.', 'A Mordaça racha, e por dentro só tem uma frase gravada: "Eu não queria ouvir minha mãe se despedir."', 'Vésper: — Era isso. A mãe dele cantava no porto, quando o navio dela não voltou. Ele tinha nove anos.'), 'stars'),
    ],
  },
];

/* ───────────── Histórias paralelas das Travessias ───────────── */
const P = (skin: string, hair: string, body: string, legs: string, accent?: string) => (accent ? { skin, hair, body, legs, accent } : { skin, hair, body, legs });
const talk = (zone: number, text: string, hint: string): SideStep => ({ kind: 'talk', zone, text, hint });
const kill = (zone: number, n: number, text: string, hint: string): SideStep => ({ kind: 'kill', zone, n, text, hint });
const boss = (zone: number, text: string, hint: string): SideStep => ({ kind: 'boss', zone, text, hint });
const choice = (zone: number, text: string, a: string, bb: string): SideStep => ({ kind: 'choice', zone, text, hint: 'Uma decisão espera por você.', options: [a, bb] });

export const MANOPLA_SIDES: SideStory[] = [
  { id: 'menina1159', realm: 'relicario', name: 'A Menina das 11:59', npc: { name: 'Lina Ponteiro', title: 'Filha do Relojoeiro', pal: P('#f0d0b0', '#a05030', '#d0a040', '#604020') },
    steps: [talk(0, 'Você se mexe! Ninguém se mexe aqui! Meu pai foi consertar o Relógio-Mãe às 11:58 e nunca desceu. Me ajuda a achar ele?', 'Fale com Lina na Praça dos Ponteiros Mortos.'),
      kill(1, 14, 'As ratas de corda roubaram as ferramentas do papai. Sem elas, ninguém sobe a torre.', 'Derrote 14 criaturas no Relicário.'),
      boss(2, 'Meridia sabe onde cada minuto foi parar. Até o do papai.', 'Derrote a Arquivista Meridia.'),
      choice(3, 'Achei! Papai está preso dentro do pêndulo, segurando o tempo com as mãos. Se o tempo voltar, ele envelhece cem anos de uma vez. O que fazemos?', 'Soltar o tempo e se despedir', 'Deixar o pai dela segurando mais um pouco')],
    ending: ['O pai de Lina solta o pêndulo, abraça a filha e sorri, velhinho e feliz. Ele diz que valeu cada segundo.', 'Lina sobe na torre todos os dias para conversar com o pai. Um dia, ela diz, ele vai estar pronto.'], reward: { gold: 1200, xp: 4000, item: 'hi_potion', qty: 5 } },
  { id: 'grouvoo', realm: 'origamia', name: 'O Grou Que Não Sabia Voar', npc: { name: 'Dobrinha', title: 'Grou de Papel Amassado', pal: P('#f8f0e0', '#e04040', '#f0e8d8', '#c0b0a0') },
    steps: [talk(0, 'Eu fui dobrado errado. Uma asa ficou maior que a outra. Vésper ia me desdobrar e fazer de novo, mas ela sumiu.', 'Fale com Dobrinha nas Planícies de Papel.'),
      kill(1, 16, 'Preciso de tinta nova para redesenhar minha asa. As criaturas do rio estão bebendo toda!', 'Derrote 16 criaturas em Origâmia.'),
      talk(2, 'A casa de Vésper fica aqui na Cidade das Legendas. Lá tem o caderno de dobras dela.', 'Encontre Dobrinha na Cidade das Legendas Apagadas.'),
      choice(2, 'O caderno diz que posso ser redobrado perfeito. Mas aí eu não seria mais eu. Será que vale?', 'Ser redobrado e voar', 'Ficar torto do jeito que é')],
    ending: ['Dobrinha voa reto, alto, perfeito. Antes de sumir nas nuvens de papel, ele dá uma volta torta, de propósito.', 'Dobrinha nunca voa. Mas aprende a planar de lado, e os outros grous começam a imitar.'], reward: { gold: 3000, xp: 12000, item: 'elixir', qty: 3 } },
  { id: 'cantiga', realm: 'leviata', name: 'A Cantiga do Porto', npc: { name: 'Marujo Benedito', title: 'Tripulante Engolido', pal: P('#d0b090', '#e0e0e0', '#305070', '#203040', '#c0a060') },
    steps: [talk(2, 'Sou o último que lembra a letra inteira da cantiga do porto. Uma moça cantava no cais, há muito tempo. Tinha um menino segurando a saia dela.', 'Fale com Benedito no Estômago dos Naufrágios.'),
      boss(2, 'O Almirante proíbe cantar. Diz que dá saudade. Convença ele... do jeito que der.', 'Derrote o Almirante Engolido Corvell.'),
      kill(3, 20, 'A letra se espalhou pelo coração do Leviatã. As criaturas comeram os versos!', 'Derrote 20 criaturas no Ventre do Leviatã.'),
      choice(4, 'Tenho a cantiga inteira. Era a mãe de Vael quem cantava. Você leva a letra para enfrentar Vael, ou deixa ela aqui, para o Leviatã cantar?', 'Levar a cantiga para Vael', 'Dar a cantiga ao Leviatã')],
    ending: ['Você guarda a cantiga. Ela pesa no peito, como uma promessa de que Vael vai ouvi-la de novo.', 'O Leviatã aprende a cantiga e canta para as estrelas. Em algum lugar, Vael acorda chorando e não sabe por quê.'], reward: { gold: 9000, xp: 40000, item: 'elixir', qty: 5 } },
];

/* ───────────── Campeões e relíquias (provações de zona) ───────────── */
export const MANOPLA_CHAMPS: Record<string, string[]> = {
  relicario: ['Sentinela das 11:59', 'Rato-de-Corda Dentuço', 'Bibliotecário Que Esqueceu de Ler', 'Gárgula do Mostrador'],
  origamia: ['Lobo de Cartolina', 'Garça de Nanquim', 'Apagador de Placas', 'Batedor Sem Norte', 'Dobra Viva'],
  leviata: ['Arraia das Constelações', 'Costela Errante', 'Contramestre Engolido', 'Brasa do Coração', 'Eco da Mordaça'],
};
type Relic = [string, (z: string) => string];
export const MANOPLA_RELICS: Record<string, Relic[]> = {
  relicario: [
    ['Engrenagem Morna', (z) => `Uma engrenagem caída em ${z}. Ainda gira, um dente por século.`],
    ['Bilhete das 11:58', (z) => `"Volto em um minuto", escrito por alguém em ${z}. O minuto nunca terminou.`],
    ['Ampulheta Rachada', (z) => `A areia desta ampulheta de ${z} cai para cima.`],
    ['Chave de Corda', (z) => `Uma chave de latão de ${z}. Serve em qualquer coisa que tenha esquecido de andar.`],
    ['Caderno de Aprendiz', (z) => `Uma página arrancada em ${z}: "Mestra Vésper, por que toda música acaba?"`],
  ],
  origamia: [
    ['Grou Amassado', (z) => `Um grou de papel escondido em ${z}. Na asa, alguém escreveu um desejo e depois riscou.`],
    ['Gota de Nanquim', (z) => `Uma gota de tinta de ${z} que se recusa a virar palavra.`],
    ['Placa Raspada', (z) => `Uma placa de ${z}. Debaixo da raspagem, ainda dá para ler um nome: "Rua da Saudade".`],
    ['Bússola Teimosa', (z) => `Esta bússola de ${z} aponta sempre para Potos.`],
    ['Esboço de Vésper', (z) => `Um desenho de Vésper encontrado em ${z}: uma mulher e um menino olhando o mar.`],
  ],
  leviata: [
    ['Estrela Apagada', (z) => `Uma estrela fria de ${z}. Se você fizer um pedido, ela acende de leve.`],
    ['Ossículo Cantor', (z) => `Um ossinho do Leviatã encontrado em ${z}. Assobia quando venta.`],
    ['Boné de Marujo', (z) => `Um boné de ${z}, bordado com o nome de um navio que nunca voltou ao porto.`],
    ['Lasca de Coração', (z) => `Uma lasca do coração de pedra, achada em ${z}. Bate uma vez por dia.`],
    ['Verso Perdido', (z) => `Um verso da cantiga do porto, gravado numa pedra de ${z}: "...e se eu não voltar, cante por mim."`],
  ],
};

