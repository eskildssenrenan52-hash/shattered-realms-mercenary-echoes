// O Livro das Travessias — história obrigatória que surge sozinha ao pisar em cada bioma pela
// primeira vez e a cada marco de nível. Dado puro; story.ts junta tudo em BEATS.
import type { Biome } from './data';

export interface LoreBeat { id: string; trigger: string; title: string; lines: string[] }

const BIOME_LORE: Record<Biome, { title: string; lines: string[] }> = {
  plains: { title: 'Planícies de Potos — Onde Tudo Recomeça', lines: [
    'O vento das Planícies tem cheiro de pão e de chuva que ainda não caiu.',
    'Cem anos atrás, aqui havia mil fazendas. Hoje restam doze, e todas acendem a lareira ao mesmo tempo, toda noite.',
    '— É pra Árvore saber que a gente ainda está aqui — explica uma menina, sem tirar os olhos de você.',
    'No chão, entre as flores, uma flecha dourada antiga, enterrada pela metade. Ninguém lembra de quem era.',
    'Você sente, pela primeira vez, que talvez já tenha andado por este campo. Em outra vida. Em outro Ciclo.'] },
  forest: { title: 'Floresta Ancestral — Os Que Não Dormem', lines: [
    'As árvores aqui são tão velhas que chamam a Árvore de Mana de “a menina”.',
    'Os espíritos da floresta não falam: eles se lembram em voz alta. Cada folha que cai é uma frase.',
    '— Um menino cinzento passou por aqui — sussurram as copas. — Ele chorava sem som.',
    '— Nós o abrigamos por três invernos. E no quarto, ele nos ensinou a esquecer o frio.',
    'Desde então, a floresta nunca mais sentiu frio. Nem calor. Nem nada. É isso que você veio consertar.'] },
  desert: { title: 'Deserto das Areias Místicas — O Mar Que Secou', lines: [
    'Antes de ser deserto, isto era um oceano. A areia ainda faz o barulho das ondas quando o vento sopra.',
    'Os nômades de Kalim enterram seus mortos de pé, olhando para onde o mar ficava.',
    '— Um dia a água volta — diz a matriarca da caravana. — A Canção prometeu. A Canção nunca mente.',
    'Ela olha para o seu arco dourado e se cala por muito tempo.',
    '— A última pessoa que carregou um arco assim prometeu a mesma coisa. Isso foi há trezentos anos.'] },
  cave: { title: 'Cavernas de Cristal — O Coração Que Pulsa', lines: [
    'Os cristais de Mana crescem um milímetro por século. Estes têm a altura de catedrais.',
    'Cada cristal guarda um som que o mundo esqueceu. Encoste o ouvido: há risadas presas aqui dentro.',
    'Os mineiros de Potos não quebram cristal nenhum. Dizem que é como quebrar a memória de alguém.',
    'Num dos mais fundos, você vê um reflexo que não é o seu: um jovem de manto cinza, de costas, esperando.',
    'Quando você pisca, ele some. Mas a pedra continua fria no lugar onde ele estava.'] },
  mountain: { title: 'Picos Sagrados — O Teto do Mundo', lines: [
    'Aqui em cima, o ar é tão fino que as palavras chegam antes de serem ditas.',
    'Os monges do Santuário Nevado juraram silêncio há cem anos. Não por devoção: por luto.',
    'Um deles quebra o voto ao ver você: — Os sinos. Os sinos tocaram sozinhos quando você nasceu.',
    '— Tocaram assim só uma vez antes. No dia em que Vael subiu a montanha e não voltou.',
    'Ele aponta para o pico mais alto, coberto de nuvens. — O que você procura começa lá. E termina muito longe.'] },
  autumn: { title: 'Bosque de Âmbar — O Outono Eterno', lines: [
    'Neste bosque é sempre outono. As folhas caem há cem anos e nunca terminam de cair.',
    'Os moradores chamam isso de “a Despedida Longa”. A Canção ficou presa no momento antes do adeus.',
    'Uma velha varre o mesmo caminho todo dia. — Meu marido saiu por aqui. Disse que voltava antes do inverno.',
    '— O inverno nunca veio. Então ele ainda pode voltar, não pode?',
    'Você não tem coragem de responder. A folha que cai no seu ombro é morna, como uma mão.'] },
  swamp: { title: 'Pântano dos Vagalumes — As Luzes Que Procuram', lines: [
    'Mil vagalumes acendem e apagam no ritmo de um coração que não é de ninguém.',
    'A lenda diz que cada vagalume é uma nota perdida da Canção, procurando o caminho de casa.',
    'Um barqueiro sem rosto oferece passagem. O pagamento é uma lembrança. Qualquer uma.',
    'Você entrega a mais leve que tem: o gosto de uma fruta que nunca comeu.',
    'Ele sorri. — Curioso. Você lembra de coisas que ainda não viveu. Isso é raro. Isso é perigoso.'] },
  coast: { title: 'Costa de Candor — O Porto das Promessas', lines: [
    'Os barcos de Candor têm olhos pintados na proa, para nunca esquecerem o caminho de volta.',
    'O farol da costa está apagado há um século. O faroleiro ainda sobe a escada todas as noites.',
    '— Se eu parar de subir — diz ele —, quem é que vai lembrar que aqui havia luz?',
    'No cais, uma estátua de dois meninos olhando o mar. Um deles teve o rosto raspado da pedra.',
    'A placa embaixo diz apenas: “Gorm e ———. Irmãos de Canção.”'] },
  jungle: { title: 'Selva de Argaes — Onde o Verde Grita', lines: [
    'A selva cresce tão rápido que engole as trilhas enquanto você anda nelas.',
    'Os Argaes, povo das copas, nunca descem ao chão. Dizem que o chão daqui tem fome de nomes.',
    'Uma caçadora desce por uma liana só pra ver você de perto. — Arco dourado. Então a profecia é real.',
    '— Diz que quem carrega o arco vai perder tudo, menos a vontade de continuar. — Ela dá de ombros.',
    '— Não é uma profecia muito animadora. Mas é a única que a gente tem.'] },
  volcanic: { title: 'Caldeira de Kaore — A Forja do Mundo', lines: [
    'A Caldeira é onde a Canção aprendeu a ser fogo. Aqui, até a pedra respira.',
    'Os ferreiros de Kaore forjaram o primeiro arco dourado com uma brasa caída da Árvore.',
    '— Forjamos dois — confessa o mais velho. — Um dourado, para quem ouve. Um cinzento, para quem ouve demais.',
    '— O cinzento sumiu junto com o menino. Desde então, nossa forja nunca mais esquentou direito.',
    'A lava ao longe brilha num ritmo lento, como alguém tentando cantar debaixo d’água.'] },
  mushroom: { title: 'Bosque dos Cogumelos — O Sonho Que Respira', lines: [
    'Os cogumelos daqui sonham. E, quando sonham juntos, o bosque inteiro muda de lugar.',
    'Ontem havia um rio aqui. Hoje há uma escada que sobe até o nada.',
    'Um sábio-esporo, do tamanho de uma casa, abre um olho para você. — Ah. O herói do sonho de Gorm.',
    '— Nós sonhamos com você há muito tempo. Em todos os sonhos, você chega. Em quase todos, você vence.',
    '— Nos outros... — ele fecha o olho de novo. — Melhor não falar dos outros.'] },
  meadow: { title: 'Pradaria de Aethyra — O Campo dos Céus', lines: [
    'Na Pradaria, o céu fica tão perto que as nuvens enroscam nos chifres dos bois.',
    'Os pastores de Aethyra contam as estrelas toda noite. Há cem anos, falta sempre uma.',
    '— Era a estrela de Vael — diz um pastor menino. — Minha bisavó viu ela se apagar.',
    '— Ela disse que não caiu. Só… decidiu parar de brilhar. Como quem fecha os olhos pra não ver.',
    'Você olha para cima. No lugar vazio, por um segundo, algo cintila. Fraco. Teimoso.'] },
  ruins: { title: 'Ruínas de Artis — A Cidade Que Cantava', lines: [
    'Artis foi a maior cidade da Canção. Cada rua era uma nota; a cidade inteira, uma sinfonia.',
    'Quando o Silêncio chegou, Artis foi a primeira a cair. Ninguém morreu. Todos apenas pararam.',
    'As estátuas aqui não são estátuas. São pessoas que esqueceram como se mexer.',
    'Uma delas, uma criança de pedra, tem a mão estendida. Na palma, uma folha de trigo seca.',
    'Você coloca uma folha nova na mão dela. Por um instante, juraria ter ouvido um assobio.'] },
  sunflower: { title: 'Campinas do Girassol — A Terra Que Olha o Sol', lines: [
    'Os girassóis daqui não seguem o sol. Seguem você.',
    'Os lavradores dizem que os campos ficaram tortos desde o Silêncio: todos virados para Potos.',
    '— Estão esperando alguém — diz Dona Marta, enxugando as mãos no avental. — Todo mundo aqui está.',
    'Ao longe, um espantalho enorme ergue a cabeça de palha. Ele também está esperando. Mas não você.'] },
  sakura: { title: 'Vale das Cerejeiras — A Primavera Presa', lines: [
    'As cerejeiras florescem e perdem as pétalas no mesmo instante, num ciclo que nunca termina.',
    'É o último momento feliz da mãe de Vael, preso no tempo como um inseto no âmbar.',
    'O ar é doce e triste ao mesmo tempo. Seus olhos ardem sem motivo.',
    'Uma pétala pousa no seu arco e não cai. Ela também escolheu você.'] },
  moonwood: { title: 'Floresta da Lua Prateada — O Luto de Prata', lines: [
    'Aqui a noite nunca acaba. A lua não se mexe: está parada sobre um único túmulo.',
    'As árvores têm casca de prata e seiva que brilha. Os lobos uivam baixinho, em respeito.',
    'Uma corça branca atravessa a trilha, para, e olha para você como quem reconhece um velho amigo.',
    'Quando ela some, as pegadas que ela deixou são de um menino descalço.'] },
  prism: { title: 'Campos de Cristal Prismático — A Luz Partida', lines: [
    'Cada cristal destes campos quebra a luz em dezessete cores. Uma para cada Eco.',
    'Mas olhe com atenção: uma das cores está sempre faltando. A décima oitava. A que ninguém nomeou.',
    'Os andarilhos do prisma andam vendados. — Ver todas as cores ao mesmo tempo enlouquece — explicam.',
    'Você tira a mão dos olhos. Vê dezoito cores. E não enlouquece. Os andarilhos se ajoelham.'] },
  coral: { title: 'Recife de Coral — A Cidade Debaixo da Maré', lines: [
    'Na maré baixa, aparecem torres de coral que foram, um dia, as casas de um povo do mar.',
    'Eles ainda moram lá embaixo. Às vezes sobem para respirar e perguntar se a Canção já voltou.',
    'Uma menina-sereia pergunta seu nome. Você diz. Ela ri: — Esse nome já veio aqui antes. Três vezes.',
    '— Na última, você me prometeu uma concha que canta. Ainda estou esperando.'] },
  bamboo: { title: 'Bosque de Bambu — O Sopro dos Votos', lines: [
    'O bambu daqui é oco por dentro e cheio de promessas. Quem jura algo, sopra dentro de um caule.',
    'Há milhões de juras guardadas aqui. O bosque inteiro murmura quando venta.',
    'Num caule rachado, gravado a faca: “Eu juro que nunca vou deixar o Vael sozinho. — G.”',
    'A rachadura é antiga. O voto, pelo jeito, não foi cumprido. Ou foi, de um jeito que dói.'] },
  thunder: { title: 'Planalto do Trovão — A Voz Que Grita', lines: [
    'Os raios aqui caem para cima. O céu está tentando devolver algo que a terra perdeu.',
    'Cada trovão é uma nota da Canção gritada alto demais, distorcida pela dor.',
    'Os guerreiros da tempestade tatuam relâmpagos no peito. — Para lembrar que barulho também é vida.',
    'Um deles encosta a testa na sua. — O Silêncio está perto. Você sente? A tempestade está com medo.'] },
  obsidian: { title: 'Ermos de Obsidiana — O Fim do Som', lines: [
    'Aqui não há vento. Não há eco. Seus passos não fazem barulho. Seu coração também não.',
    'O vidro negro do chão reflete um céu que não existe: cinza, imóvel, sem nenhuma estrela.',
    'Esta é a terra que Vael fez primeiro. O lugar onde ele aprendeu a calar o mundo.',
    'Você grita seu próprio nome, só para ter certeza de que ainda tem um. Nada volta. Mas você continua andando.'] },
  lavender: { title: 'Campos de Lavanda — O Perfume da Saudade', lines: [
    'Os campos roxos se estendem até o horizonte, e o cheiro faz qualquer um lembrar de casa.',
    'Mesmo quem nunca teve uma. Principalmente quem nunca teve uma.',
    'As irmãs do convento destilam lavanda para os que choram demais. A fila dá a volta no vale.',
    'Uma das irmãs coloca um ramo no seu bolso. — Para quando a jornada pesar. E ela vai pesar.'] },
  mangrove: { title: 'Manguezal das Raízes — Entre Duas Águas', lines: [
    'O manguezal vive entre o rio e o mar, sem ser nenhum dos dois. Como quem está entre lembrar e esquecer.',
    'As raízes se entrelaçam como dedos, formando pontes que mudam de lugar à noite.',
    'Os pescadores daqui não pescam peixe. Pescam lembranças que o rio arrasta.',
    'Um deles puxa a rede e encontra uma: dois meninos rindo debaixo de uma árvore enorme. Ele a joga de volta.',
    '— Essa não é minha — diz. — Mas acho que é sua.'] },
  aurora: { title: 'Tundra da Aurora — O Céu Que Dança', lines: [
    'A aurora daqui é a Canção escrita no céu, em letras de luz que ninguém mais sabe ler.',
    'Os anciões da tundra decifram uma linha por geração. Faltam quatro para terminar o poema.',
    'Você lê três delas em voz alta sem saber como. Os anciões choram de alegria e de medo.',
    'A quarta linha, você não consegue ler. Ela está escrita em silêncio.'] },
  amber: { title: 'Deserto de Âmbar — O Tempo Congelado', lines: [
    'O âmbar desse deserto guarda insetos, folhas e, às vezes, um minuto inteiro de tempo.',
    'Quem quebra uma pedra de âmbar vive aquele minuto de novo. Os mercadores vendem minutos felizes.',
    'Você compra um, sem saber de quem é. Vê uma mulher cantando para dois meninos dormirem.',
    'Quando a cena acaba, há lágrimas no seu rosto, e uma certeza: ela era a mãe de Vael.'] },
  spores: { title: 'Charco dos Esporos — A Mente Coletiva', lines: [
    'Os esporos daqui pensam juntos. Quando você respira, por um instante, pensa junto com eles.',
    'Eles lembram de tudo o que todo mundo já esqueceu. É um peso que nenhuma mente sozinha aguentaria.',
    '— Vael pediu para entrar no nosso pensamento — sussurram mil vozes na sua cabeça.',
    '— Nós dissemos não. Ele ouvia demais. Nós teríamos virado silêncio também.'] },
  lotus: { title: 'Lagoa de Lótus — O Espelho dos Céus', lines: [
    'A água da lagoa é tão parada que reflete céus de outras épocas.',
    'Os monges meditam olhando para baixo, buscando o céu do dia em que a Canção nasceu.',
    'Você olha também. E vê o seu próprio rosto, mais velho, com o arco quebrado e um sorriso cansado.',
    'Um monge toca seu ombro. — Não se assuste. A lagoa mostra possibilidades, não destinos.'] },
  marble: { title: 'Cidadela de Mármore — O Tribunal Branco', lines: [
    'Foi aqui, nestes salões brancos, que o Conselho da Canção julgou Vael.',
    'As cadeiras ainda estão no lugar. Doze juízes. Doze votos. Onze pelo selo, um contra.',
    'O voto contra está gravado no mármore com a letra de Gorm.',
    'Atrás do tribunal, uma porta lacrada com cera cinza. Do outro lado, alguém bate. Três vezes. Depois, nada.'] },
  crimson: { title: 'Desfiladeiro Carmesim — A Ferida Aberta', lines: [
    'A rocha aqui é vermelha como uma ferida que nunca fechou.',
    'Foi neste desfiladeiro que Gorm e Vael lutaram, cem anos atrás. A Canção sangrou aqui.',
    'Ainda há flechas cravadas nas paredes. Douradas de um lado. Cinzentas do outro.',
    'Você arranca uma flecha dourada da pedra. Ela se encaixa perfeitamente no seu arco, como se fosse sua.'] },
  oasis: { title: 'Oásis das Estrelas — O Último Desejo', lines: [
    'No meio do deserto, um lago que reflete estrelas mesmo de dia.',
    'Os viajantes deixam desejos escritos em pedrinhas no fundo d’água. Há milhões delas.',
    'Você mergulha a mão e tira uma ao acaso. A letra é infantil: “Quero que o Vael pare de chorar.”',
    'Você a devolve com cuidado. Algumas promessas ainda estão esperando alguém para cumpri-las.'] },
};

const LEVEL_LORE: [number, string, string[]][] = [
  [3, 'O Primeiro Calo', ['Seus dedos já não doem ao puxar a corda do arco.', 'Gorm observa de longe e assente, satisfeito.', '— O arco está aprendendo seu nome. Quando ele souber, vai cantar sozinho.']],
  [5, 'A Voz do Arco', ['Esta noite, o arco dourado zumbe baixinho enquanto você dorme.', 'Em sonho, você vê um campo de trigo, e duas crianças correndo.', 'Uma delas se vira e olha para você. Ela tem os seus olhos.', 'Você acorda com gosto de trigo na boca.']],
  [10, 'Rumores de Herói', ['Nas tavernas, já contam histórias sobre você. Metade é mentira. A outra metade, exagero.', 'Um bardo canta que você derrubou um dragão com uma única flecha. Você nunca viu um dragão.', '— Ainda — diz o bardo, piscando. — As melhores canções são as que ainda não aconteceram.']],
  [15, 'A Carta Sem Remetente', ['Debaixo da sua porta, um envelope cinza, sem selo, sem nome.', 'Dentro, uma única frase: “Você não precisa fazer isso. Ninguém deveria carregar tanta dor.”', 'O papel não tem cheiro. Não tem peso. Mas a letra treme, como quem escreveu chorando.']],
  [20, 'O Peso do Arco', ['O arco dourado ficou mais pesado. Não no braço: no peito.', 'Agora você ouve, de vez em quando, uma nota triste no vento. Alguém se despedindo, muito longe.', 'Gorm segura seu ombro. — Começou. Você está ouvindo o que ele ouvia.', '— Prometa que vai me contar quando ficar demais. Ele nunca me contou.']],
  [30, 'O Sonho dos Ciclos', ['Você sonha com outras versões de si mesmo. Dezenas. Centenas.', 'Todas carregam o arco. Todas chegaram até certo ponto. E pararam.', 'Uma delas fala com você: — Não pare onde nós paramos. Vá além do último Eco.', 'Quando você acorda, há uma pena dourada no travesseiro.']],
  [40, 'A Sombra que Acompanha', ['Há dias que alguém caminha ao seu lado sem fazer barulho.', 'Você não vê, mas sente: um passo leve, uma respiração cansada, uma presença que não ameaça.', 'Esta noite, ao redor da fogueira, você diz em voz alta: — Pode sentar, Vael.', 'O fogo tremula. E, por um instante, há duas sombras no chão.']],
  [50, 'Meio Caminho da Canção', ['Cinquenta vezes você caiu e levantou. O mundo percebeu.', 'Em todas as vilas que você salvou, as crianças brincam de herói com arcos de galho.', 'A Árvore de Mana, ao longe, abre uma flor nova. A primeira em cem anos.', 'Gorm não diz nada. Só chora, sorrindo, como quem esperava há muito tempo.']],
  [75, 'O Ouvido Inteiro', ['Agora você ouve tudo. Cada riso, cada despedida, cada nota do mundo, ao mesmo tempo.', 'É lindo. É insuportável. É exatamente o que Vael sentia.', 'Mas há uma diferença: você não está sozinho. Cada pessoa que você ajudou canta junto.', 'E a dor, dividida, vira só mais uma nota da Canção.']],
  [100, 'A Lenda Viva', ['Cem níveis. Você já não é o forasteiro que chegou a Potos numa manhã qualquer.', 'Os Vigias contam sua história para os netos. Os bardos já nem precisam exagerar.', 'O arco dourado brilha por conta própria agora, como um pequeno sol.', 'E, em algum lugar entre os Ciclos, uma voz que você conhece sussurra: — Obrigado.']],
];

export const LORE_BEATS: LoreBeat[] = [
  ...(Object.entries(BIOME_LORE) as [Biome, { title: string; lines: string[] }][]).map(([b, d]) => ({ id: `terra_${b}`, trigger: `biome:${b}`, title: d.title, lines: d.lines })),
  ...LEVEL_LORE.map(([lv, title, lines]) => ({ id: `nivel_${lv}`, trigger: `level:${lv}`, title: `Nível ${lv} — ${title}`, lines })),
];
export const LORE_LEVELS = LEVEL_LORE.map(([lv]) => lv);
