// Reinos dos Atos — cinco reinos espalhados pela história principal, cada um aberto
// no fim de um Ato. Misturam modos de jogo por zona: cidades com moradores e segredos,
// ondas de sobrevivência, corridas contra o tempo e caçadas com chefe. Inclui o Céu
// (Nimbária, a Coroa) e o Submundo (Érebo). Dado puro, salvo como os outros reinos da Saga.
import type { Biome, EnemyKind } from './data';
import type { SagaBoss, SagaFx, SagaRealm, SagaZone, SideStep, SideStory, TownNpc, ZoneMode } from './saga';
import { T } from './world';

type Pal = TownNpc['pal'];
const P = (skin: string, hair: string, body: string, legs: string, accent?: string): Pal => (accent ? { skin, hair, body, legs, accent } : { skin, hair, body, legs });
const npc = (name: string, title: string, pal: Pal, ...lines: string[]): TownNpc => ({ name, title, pal, lines });
const b = (name: string, kind: EnemyKind, tint: string, scale: number, intro: string, ...victory: string[]): SagaBoss => ({ name, kind, tint, scale, intro, victory });
interface ZOpts { mode?: ZoneMode; npcs?: TownNpc[]; secrets?: number; fx2?: SagaFx }
const z = (name: string, lore: string, biome: Biome, tiles: [number, number, number], enemies: EnemyKind[], fx: SagaFx, color: string, light: number, tint: [number, number, number, number], boss: SagaBoss, o: ZOpts = {}): SagaZone =>
  ({ name, lore, biome, floor: tiles[0], wall: tiles[1], deco: tiles[2], enemies, fx, fx2: o.fx2, color, light, tint, boss, mode: o.mode ?? 'hunt', npcs: o.npcs, secrets: o.secrets ?? 2 });

export const ATOS_REALMS: SagaRealm[] = [
  /* ═════════════ Ato I — BRUMAVALE, A CIDADE DOS SINOS ═════════════ */
  {
    id: 'brumavale', gate: 'atos', act: 1, name: 'Brumavale, a Cidade dos Sinos', subtitle: 'Reino do Ato I — A Névoa Que Badala', level: 6, color: '#b8c8d8', portal: '#d8e8ff',
    prologue: [
      'O Mapa dos Atos estremece. Uma estrada de névoa se desenrola até uma cidade no alto de um morro.',
      'Brumavale. Mil sinos pendurados nos telhados, e nenhum deles toca desde que o Silêncio passou.',
      'Dizem que o sineiro-mor desceu para os esgotos atrás de um som estranho e nunca mais voltou.',
      'Converse com os moradores. Toda cidade guarda segredos nos cantos que ninguém varre.',
    ],
    epilogue: [
      'O Grande Sino de Brumavale toca. A névoa se ergue como uma cortina de teatro.',
      'Gente sai das casas, chorando e rindo. Uma velha conta que esse som era o mesmo de quando ela era menina.',
      'No sino, gravada por dentro, uma assinatura antiga: "Afinado por V. e seu aprendiz".',
      'Vésper, Vael... até aqui, os dois deixaram marcas. A Canção tinha mais lugares do que você imaginava.',
    ],
    reward: { item: 'atos_brumavale', name: 'Badalo de Brumavale', desc: 'Um badalo de prata que ainda vibra. Afasta a névoa e o medo.', slot: 'amulet' },
    zones: [
      z('Praça dos Sinos Mudos', 'Telhados cheios de sinos parados. Moradores cochicham em cada esquina, com medo de falar alto.', 'ruins', [T.COBBLE, T.WALL, T.PILLAR], ['rat'], 'clouds', '#c8d8e8', 0.15, [190, 200, 220, 0.16],
        b('Prefeita Odila', 'skeleton', '#c0c0d0', 2, 'Odila olha para você.'), { mode: 'town', secrets: 4, npcs: [
          npc('Prefeita Odila Brumm', 'Guardiã das Chaves', P('#f0d0b8', '#a0a0b0', '#506080', '#303848', '#d0c060'),
            'Um forasteiro de Potos! Graças aos sinos que não tocam.',
            'Nosso sineiro-mor, Bartolo, desceu aos esgotos atrás de um zumbido. Faz três luas.',
            'Tome a chave da grade. Desça, encontre Bartolo... e o que quer que esteja comendo o nosso som.'),
          npc('Tecelã Ivone', 'Fia névoa em lã', P('#e8c8a8', '#603020', '#a05070', '#402030'),
            'Eu fio a névoa em novelos. Ela fica mais grossa toda noite.',
            'Dizem que há um baú escondido atrás da fonte seca. Eu nunca tive coragem de olhar.'),
          npc('Menino Tito', 'Caçador de Ecos', P('#f0d0b0', '#302010', '#40a060', '#305030'),
            'Eu guardo ecos em potes! Esse aqui é de um latido de 1987... digo, de muito tempo atrás.',
            'Psiu: conte os cantos das casas. Os mais escuros brilham um pouquinho se você olhar de perto.'),
          npc('Velho Abel', 'Ex-sineiro', P('#e0c0a0', '#e0e0e0', '#605040', '#403020'),
            'Na minha época, o sino grande era afinado por uma moça que desenhava mapas. Tinha um menino com ela.',
            'O menino perguntava por que o som acaba. Ela respondia: "para o próximo poder começar".'),
        ] }),
      z('Esgotos Badalantes', 'Canos que zumbem como sinos afogados. Algo lá embaixo aprendeu a imitar vozes.', 'cave', [T.FLOOR, T.CWALL, T.WATER], ['rat', 'slime', 'bat', 'beetle'], 'bubbles', '#90b0a0', 0.55, [80, 120, 100, 0.26],
        b('Rato-Sineiro Tolomeu', 'rat', '#8a7a60', 2.6, 'Um rato do tamanho de um porco usa um sino como capacete: — Meu! Todo som é meu!', 'O sino-capacete rola pelo chão e, enfim, toca uma nota limpa.', 'Atrás dele, preso numa rede de canos, o sineiro Bartolo acena, vivo e magrinho.'), { mode: 'survival', fx2: 'ghosts' }),
      z('Campanário Rachado', 'A torre do Grande Sino, rachada de alto a baixo. O vento passa pela rachadura e assobia uma música triste.', 'mountain', [T.FLOOR, T.WALL, T.PILLAR], ['gargoyle', 'crow', 'bat'], 'feathers', '#e0e8ff', 0.3, [200, 210, 240, 0.18],
        b('O Badalo Mudo', 'golem', '#a0a8c0', 3.2, 'O sino gigante se solta da torre e rola na sua direção. Ele não quer tocar. Tocar dói.', 'O Badalo para. Bartolo sobe a escada, segura a corda e puxa com o corpo inteiro.', 'BOOOM. A nota atravessa o vale inteiro.')),
    ],
  },
  /* ═════════════ Ato II — NIMBÁRIA, O ARQUIPÉLAGO DO CÉU ═════════════ */
  {
    id: 'nimbaria', gate: 'atos', act: 2, name: 'Nimbária, o Arquipélago do Céu', subtitle: 'Reino do Ato II — Ilhas Que Flutuam', level: 14, color: '#a8e0ff', portal: '#e0f6ff',
    prologue: [
      'Seis Ecos cantam, e o céu acima de Potos se abre como uma janela.',
      'Ilhas de terra e grama flutuam presas por raízes, ligadas por pontes de corda que balançam ao vento.',
      'Os nimbários são um povo de asas curtas. Eles vivem em barcos de nuvem e contam o tempo pelos relâmpagos.',
      'Desde o Silêncio, um rei-tempestade tomou o trono e as pontes começaram a cair. Uma por uma.',
    ],
    epilogue: [
      'O Trono do Relâmpago apaga. As nuvens escuras se desfazem em chuva fina e quente.',
      'As ilhas param de se afastar. Os nimbários amarram cordas novas, cantando.',
      'No trono, um pergaminho chamuscado: um mapa do céu desenhado pela mão firme de Vésper, com rabiscos de criança nas bordas.',
      'Ao lado dos rabiscos, uma pergunta: "Se o céu não tem chão, onde a música cai?"',
    ],
    reward: { item: 'atos_nimbaria', name: 'Pena do Rei-Céu', desc: 'Uma pena azul que deixa os passos leves como vento.', slot: 'ring' },
    zones: [
      z('Docas de Nuvem', 'Barcos de algodão amarrados em postes de nuvem dura. Mercadores vendem relâmpago em potes.', 'aurora', [T.MEADOW, T.BUSH, T.FLOWER], ['sprite'], 'clouds', '#d8f0ff', 0.05, [210, 235, 255, 0.14],
        b('Capitã Zéfira', 'crow', '#a0d0ff', 2, '...'), { mode: 'town', secrets: 4, fx2: 'feathers', npcs: [
          npc('Capitã Zéfira Ventania', 'Mestra das Pontes', P('#f0d8c0', '#f0f0ff', '#4080c0', '#204060', '#ffe080'),
            'Você subiu sem asas? Ou é muito corajoso ou muito tonto. Gosto dos dois.',
            'As Pontes de Vento estão caindo. Atravesse antes que a próxima rajada as leve. Vai ter que correr!',
            'Do outro lado ficam os Ninhos da Tempestade. E depois, o trono do Rei Trovejante.'),
          npc('Vendedor Cúmulo', 'Vende relâmpago em pote', P('#e8d0b0', '#ffffff', '#c0a040', '#605020'),
            'Relâmpago fresquinho! Bom para acender lareira e acordar avô.',
            'Um amigo meu escondeu as economias num canto das docas. Ele esqueceu qual. Se achar, fica pra você.'),
          npc('Nana Garoa', 'Contadora de Chuva', P('#d8c0a8', '#b0c0d0', '#6080a0', '#405060'),
            'Eu conto as gotas de cada chuva. Esta semana choveu ao contrário três vezes.',
            'Antigamente uma cartógrafa vinha aqui desenhar o céu. O menino dela tinha medo de altura, mas subia mesmo assim.'),
          npc('Pipoca', 'Filhote nimbário', P('#f8e0c8', '#ffd060', '#ff9060', '#a05030'),
            'Minhas asas são pequenas demais! Mas eu pulo bem alto, olha! ...ai.',
            'Dica: nas pontes, não pare. O vento conta até cem e depois sopra tudo.'),
        ] }),
      z('Pontes de Vento', 'Pontes de corda sobre o vazio. O vento conta em voz alta e, quando termina, sopra tudo para longe.', 'prism', [T.MEADOW, T.ROCK, T.CRYSTAL], ['crow', 'sprite', 'pixie', 'wisp'], 'clouds', '#c0e8ff', 0.1, [190, 225, 255, 0.16],
        b('Grifo das Rajadas Sopro-Alto', 'crow', '#80b0e0', 3, 'Um grifo de penas cinzentas pousa na ponte, que range: — Ninguém atravessa enquanto eu contar!', 'O grifo perde o fôlego no meio da contagem e cai sentado, rindo.', 'Ele aponta com a asa: os Ninhos ficam no alto, onde as nuvens escurecem.'), { mode: 'timed', fx2: 'feathers' }),
      z('Ninhos da Tempestade', 'Ninhos do tamanho de casas, feitos de raio trançado. Cada ovo brilha como uma pequena tempestade.', 'thunder', [T.ROCK, T.CWALL, T.CRYSTAL], ['gargoyle', 'crow', 'imp', 'wisp'], 'rain', '#90a0ff', 0.45, [100, 120, 220, 0.26],
        b('Mãe-Trovão Kumulonimba', 'gargoyle', '#6070d0', 3.2, 'Kumulonimba abre as asas e o céu inteiro escurece: — Meus filhos nasceram no Silêncio. Eles não conhecem música, só estrondo!', 'Ela abraça os ovos com as asas. Um deles choca e pia uma nota afinada.', 'A tempestade se acalma. Só o trono continua rugindo.'), { fx2: 'sparkles' }),
      z('Trono do Relâmpago', 'Um trono flutuante no olho de um furacão. O ar tem gosto de moeda e queima nos dentes.', 'thunder', [T.FLOOR, T.WALL, T.CRYSTAL], ['gargoyle', 'wraith', 'shade', 'imp'], 'rain', '#ffe060', 0.35, [255, 230, 120, 0.2],
        b('Rei Trovejante Bramor', 'golem', '#f0d040', 3.6, 'Bramor ergue um cetro de raio: — O Silêncio me prometeu o céu inteiro se eu calasse o vento. Eu calei. E ainda assim não tenho nada!', 'Bramor solta o cetro. O raio dele volta a ser só luz.', 'Bramor: — Ele me disse... Vael me disse que o silêncio era paz. Ele mentiu para nós dois.'), { mode: 'survival', fx2: 'sparkles' }),
    ],
  },
  /* ═════════════ Ato III — ÉREBO, O SUBMUNDO ═════════════ */
  {
    id: 'erebo', gate: 'atos', act: 3, name: 'Érebo, o Submundo', subtitle: 'Reino do Ato III — Onde as Canções Vão Morrer', level: 22, color: '#a080c0', portal: '#c0a0ff',
    prologue: [
      'Os Ecos Inquietos gritam, e o chão de Potos range como uma porta velha.',
      'Debaixo do mundo existe outro mundo. Érebo, o Submundo, onde vão parar as canções que ninguém mais canta.',
      'Um rio cinzento corre entre margens de cinza. Barqueiros sem rosto levam almas e melodias para o fundo.',
      'Algo lá embaixo está colecionando vozes. Muitas vozes. E está ficando grande.',
    ],
    epilogue: [
      'O Rei Sob a Terra se ajoelha. Do peito dele escapam mil melodias, como pássaros de uma gaiola aberta.',
      'Elas sobem pelas rachaduras até a superfície. Em Potos, alguém começa a assobiar sem saber por quê.',
      'Entre as melodias, uma cantiga de ninar. A mesma que Vael ouvia da mãe, no cais.',
      'O Rei: — Ele desceu aqui, uma vez. Procurava a voz da mãe. Eu não deixei ele levar. Talvez tenha sido aí que ele desistiu de tudo.',
    ],
    reward: { item: 'atos_erebo', name: 'Óbolo do Barqueiro', desc: 'Uma moeda antiga. Paga qualquer travessia, menos a última.', slot: 'amulet' },
    zones: [
      z('Margem do Rio Lete', 'Areia cinzenta e um rio que faz esquecer. Lanternas de alma boiam na água, sem dono.', 'obsidian', [T.SAND, T.ROCK, T.WATER], ['shade', 'wraith', 'wisp', 'skeleton'], 'ghosts', '#a090c0', 0.6, [90, 70, 130, 0.3],
        b('Cérbero das Três Canções', 'wolf', '#503060', 3.2, 'Três cabeças, três uivos, três músicas diferentes: — Quem desce não sobe. Quem sobe não lembra!', 'As três cabeças uivam juntas, pela primeira vez, a mesma nota.', 'O cão se deita e deixa você passar. A cauda bate devagar na areia.'), { fx2: 'void' }),
      z('Cidade dos Barqueiros', 'Casas de barco virado, ruas de remo. Os barqueiros trocam lembranças como moeda.', 'obsidian', [T.COBBLE, T.WALL, T.WATER], ['shade'], 'ghosts', '#c0a0e0', 0.5, [120, 90, 160, 0.26],
        b('Caronte', 'wraith', '#8070a0', 2, '...'), { mode: 'town', secrets: 5, npcs: [
          npc('Caronte, o Barqueiro-Mor', 'Senhor das Travessias', P('#b0a8c0', '#202020', '#302840', '#181420', '#c0a0ff'),
            'Vivo? Aqui embaixo? Faz séculos que não vejo bochechas coradas.',
            'Os Campos de Asfódelo ficam rio abaixo. Lá as almas esquecidas atacam quem lembra demais. Aguente firme.',
            'Depois deles, a Fornalha. E no fim, o Palácio. O Rei guarda vozes como um dragão guarda ouro.'),
          npc('Dona Saudade', 'Vende lembranças usadas', P('#d0c0c8', '#806080', '#604070', '#302040'),
            'Uma lembrança de primeiro beijo, quase nova! Uma de cheiro de chuva, meio gasta...',
            'Os barqueiros escondem lembranças boas nos cantos da cidade, para os dias ruins. Procure.'),
          npc('Fantasminha Lúcio', 'Alma que se perdeu', P('#e0e0f0', '#e0e0f0', '#c0c0e0', '#a0a0c0'),
            'Eu esqueci meu nome no rio. Lúcio é o nome que eu escolhi. Gostou?',
            'Uma vez vi um rapaz de capa cinza passar por aqui. Ele cantava baixinho e chorava. Os barqueiros tinham medo dele.'),
          npc('Ferreiro Hefesto Pó', 'Forja correntes de sombra', P('#a08070', '#302010', '#503020', '#201008'),
            'Na Fornalha das Almas o fogo apaga sozinho se você demorar. Corra até o fim antes que esfrie.',
            'E se achar uma bigorna escondida... não, deixa pra lá. Ninguém nunca achou.'),
        ] }),
      z('Campos de Asfódelo', 'Flores brancas até o horizonte. Cada flor é uma alma que esqueceu quem era, e elas não gostam de quem lembra.', 'spores', [T.MEADOW, T.ROCK, T.FLOWER], ['wraith', 'shade', 'skeleton', 'sporeling'], 'petals', '#e0e0f0', 0.5, [200, 200, 230, 0.22],
        b('Rainha do Asfódelo Perséfila', 'treant', '#d0d0f0', 3.3, 'Perséfila ergue os braços de flor: — Esquecer é tão bom. Venha, deite. Durma.', 'As flores se viram para você. Algumas lembram o próprio nome.', 'Perséfila: — Eu também tinha uma mãe que cantava... obrigada por me lembrar.'), { mode: 'survival', fx2: 'ghosts' }),
      z('Fornalha das Almas', 'Um fogo azul que derrete melodias e as transforma em correntes. O calor diminui a cada minuto.', 'volcanic', [T.ASH, T.ROCK, T.LAVA], ['imp', 'salamander', 'golem', 'shade'], 'embers', '#80a0ff', 0.45, [80, 100, 255, 0.26],
        b('Forjador Sem-Nome', 'golem', '#4060c0', 3.4, 'O Forjador martela uma corrente feita de canções: — Cada elo é alguém que parou de cantar. Você vai ser o próximo.', 'O martelo cai. As correntes se soltam e voltam a ser música.', 'Você ouve, entre os sons, a voz de uma mulher cantando para um menino no cais.'), { mode: 'timed', fx2: 'ash' }),
      z('Palácio do Rei Sob a Terra', 'Um palácio de raízes e ossos, iluminado por gaiolas cheias de vozes que brilham.', 'crimson', [T.FLOOR, T.CWALL, T.CRYSTAL], ['wraith', 'skeleton', 'gargoyle', 'shade'], 'void', '#c080ff', 0.55, [130, 70, 180, 0.28],
        b('Rei Sob a Terra, Hadrion', 'wraith', '#7040a0', 3.8, 'Hadrion senta num trono de gaiolas: — Eu guardo as vozes para que ninguém as perca. Ninguém mais vai perder nada. Nunca.', 'Hadrion abre as gaiolas, uma por uma, com as mãos tremendo.', 'Hadrion: — Guardar não é o mesmo que amar. Eu esqueci disso. Vael também.')),
    ],
  },
  /* ═════════════ Ato IV — O MERCADO DAS MIL LUAS ═════════════ */
  {
    id: 'lunaris', gate: 'atos', act: 4, name: 'Lunáris, o Mercado das Mil Luas', subtitle: 'Reino do Ato IV — Tudo Tem Preço', level: 30, color: '#f0e0a0', portal: '#fff0c0',
    prologue: [
      'Gorm confessou o que sabia. Naquela mesma noite, mil luas surgem no céu de Potos.',
      'Cada lua é uma barraca. Juntas, formam Lunáris, o mercado que só abre quando o mundo está prestes a mudar.',
      'Lá se compra de tudo: sonhos, nomes, anos de vida. Até um pedaço da Canção, dizem.',
      'Alguém está comprando todas as notas que restam. Pagando com silêncio.',
    ],
    epilogue: [
      'O Leiloeiro de Vidro se estilhaça. Todas as notas compradas voltam aos donos, tilintando como troco.',
      'As mil luas se apagam uma a uma, até sobrar só a de verdade, sozinha e redonda.',
      'No cofre do Leiloeiro, um recibo: "Vendido a V.: o direito de esquecer. Pagamento: a própria voz."',
      'Vael vendeu a voz. É por isso que ele nunca mais cantou.',
    ],
    reward: { item: 'atos_lunaris', name: 'Lua de Bolso', desc: 'Uma lua do tamanho de uma noz. Ilumina e nunca mente sobre preço.', slot: 'ring' },
    zones: [
      z('Bazar das Mil Luas', 'Barracas sob luas penduradas. Mercadores com cabeça de lua crescente pechincham em sussurros.', 'marble', [T.PANEL, T.WALL, T.FURNITURE], ['mimic'], 'stars', '#fff0c0', 0.25, [255, 240, 190, 0.18],
        b('Mercadora Selenia', 'pixie', '#f0e0a0', 2, '...'), { mode: 'town', secrets: 5, fx2: 'sparkles', npcs: [
          npc('Mercadora Selenia Minguante', 'Chefe da Guilda Lunar', P('#f8f0d8', '#f0e0a0', '#404070', '#202040', '#fff0a0'),
            'Bem-vindo a Lunáris! Aqui tudo tem preço. O seu, por exemplo, é bem alto.',
            'O Leiloeiro de Vidro compra todas as notas da Canção. Para chegar até ele, vença a Arena dos Eclipses e o Labirinto de Espelhos.',
            'Na Arena, eles soltam fera atrás de fera. Sobreviva e o público vai te amar.'),
          npc('Velho Penumbra', 'Vende sombras de segunda mão', P('#a0a0b0', '#404040', '#202030', '#101018'),
            'Sombra nova, sombra usada, sombra de gente famosa! Esta aqui era de um rei.',
            'Os mercadores mais antigos escondem tesouros debaixo das barracas. Eu vi onde. Mas não vou dizer. Procure.'),
          npc('Pequena Nova', 'Aprendiz de astróloga', P('#f0d0b0', '#3040a0', '#8060c0', '#403060'),
            'Eu leio o futuro nas manchas das luas. O seu tem muita luta. E bolo, eu acho.',
            'O Labirinto de Espelhos muda a cada minuto. Se demorar, ele te joga de volta na entrada!'),
          npc('Guarda Eclipse', 'Porteiro da Arena', P('#c0a080', '#202020', '#802020', '#401010', '#ffd040'),
            'Quer entrar na Arena? Então assine aqui. E aqui. E aqui, que diz que a culpa é sua.'),
        ] }),
      z('Arena dos Eclipses', 'Um coliseu sob um eclipse eterno. A plateia é feita de luas, e todas querem ver sangue.', 'crimson', [T.SAND, T.WALL, T.PILLAR], ['wolf', 'scorpion', 'gargoyle', 'boar', 'imp'], 'sand', '#ff9060', 0.4, [230, 120, 80, 0.22],
        b('Campeão Coroado Eclipsar', 'golem', '#302020', 3.4, 'Eclipsar entra e a arena escurece: — Mil lutas, mil vitórias. A plateia nem lembra mais o meu nome.', 'A plateia de luas se levanta e grita o seu nome.', 'Eclipsar: — Fique com o cinturão. Eu só queria que alguém lembrasse que eu existi.'), { mode: 'survival', fx2: 'embers' }),
      z('Labirinto de Espelhos', 'Mil espelhos, mil de você. Alguns reflexos se atrasam um pouco. Outros se adiantam.', 'prism', [T.FLOOR, T.CRYSTAL, T.CRYSTAL], ['shade', 'mimic', 'wisp', 'sprite'], 'sparkles', '#e0f0ff', 0.3, [210, 230, 255, 0.2],
        b('Reflexo Que Não Pisca', 'shade', '#c0d0ff', 3.2, 'Um reflexo seu sai do espelho, sorrindo do jeito errado: — Eu sou você sem medo. Sem saudade. Sem nada.', 'O reflexo hesita, pisca pela primeira vez, e volta para o espelho.', 'Todos os espelhos se viram para o mesmo lado: o cofre do Leiloeiro.'), { mode: 'timed', fx2: 'stars' }),
      z('Cofre do Leiloeiro de Vidro', 'Um cofre redondo como uma lua, cheio de notas compradas presas em frascos de vidro.', 'marble', [T.PANEL, T.WALL, T.CRYSTAL], ['golem', 'mimic', 'gargoyle', 'wraith'], 'stars', '#fff0a0', 0.35, [255, 240, 160, 0.2],
        b('O Leiloeiro de Vidro', 'golem', '#d0e8ff', 3.8, 'O Leiloeiro bate o martelo: — Dou-lhe uma! Dou-lhe duas! Sua voz está à venda!', 'O martelo trinca. Depois o Leiloeiro inteiro.', 'Dos frascos quebrados sobe um coro inteiro de vozes devolvidas.')),
    ],
  },
  /* ═════════════ Ato V — A COROA DO CÉU SILENTE ═════════════ */
  {
    id: 'coroa', gate: 'atos', act: 5, name: 'A Coroa do Céu Silente', subtitle: 'Reino do Ato V — Acima de Tudo, Nada', level: 38, color: '#fff8e0', portal: '#ffffff',
    prologue: [
      'Vael caiu, mas a Canção ainda soa incompleta. Lá no alto, acima das nuvens de Nimbária, uma coroa de pedra branca gira devagar.',
      'É a Coroa do Céu Silente: o primeiro lugar que o Silêncio tocou, e o último que vai soltar.',
      'Ali vive o Coro das Asas Caídas, anjos que pararam de cantar no mesmo dia que Vael.',
      'Se a Coroa não for libertada, o Silêncio sempre vai poder voltar.',
    ],
    epilogue: [
      'O Ouvido de Vael se fecha, satisfeito. Pela primeira vez ele ouviu a Canção inteira, do começo ao fim.',
      'Os anjos abrem as asas e cantam. A nota desce, atravessa Nimbária, Potos, Érebo, e chega ao fundo do mundo.',
      'Uma voz infantil ri no vento. Parece Vael, menino, antes de tudo.',
      'Vésper, na Manopla: — Toda música acaba. Para a próxima poder começar. Ele finalmente entendeu.',
    ],
    reward: { item: 'atos_coroa', name: 'Auréola Partida', desc: 'Metade de uma auréola. A outra metade ficou com quem você salvou.', slot: 'amulet' },
    zones: [
      z('Escadaria das Nuvens', 'Degraus de nuvem que se desfazem logo depois que você pisa. Não dá para voltar atrás.', 'aurora', [T.MEADOW, T.ROCK, T.CRYSTAL], ['sprite', 'wisp', 'gargoyle', 'crow'], 'clouds', '#ffffff', 0.05, [240, 245, 255, 0.16],
        b('Guardião da Escadaria Áureo', 'gargoyle', '#f0e0a0', 3.4, 'Áureo abre asas de mármore: — Cada degrau é uma oração que ninguém fez. Você não tem fé suficiente para subir.', 'Áureo sorri, cansado: — Talvez a fé seja só continuar subindo.', 'Os degraus atrás de você param de desmanchar.'), { mode: 'timed', fx2: 'feathers' }),
      z('Jardim Suspenso de Ofânia', 'Flores de luz em vasos que flutuam. Cada uma tem uma nota diferente quando o vento passa.', 'sakura', [T.MEADOW, T.BUSH, T.FLOWER], ['pixie', 'sprite', 'treant', 'crow'], 'petals', '#ffe0f0', 0.1, [255, 220, 240, 0.16],
        b('Jardineira Celeste Ofânia', 'treant', '#ffd0e0', 3.4, 'Ofânia poda as flores que cantam alto demais: — Silêncio é ordem. Ordem é beleza.', 'Ofânia deixa a tesoura cair. As flores cantam desafinadas e lindas.', 'Ofânia: — Eu tinha esquecido como é bonito o que não é perfeito.'), { fx2: 'sparkles' }),
      z('Cidade-Eco dos Anjos', 'Uma cidade de mármore onde cada palavra dita ecoa por um dia inteiro. Os anjos sussurram, com medo do próprio eco.', 'marble', [T.PANEL, T.WALL, T.PILLAR], ['sprite'], 'feathers', '#fff8f0', 0.1, [250, 245, 235, 0.14],
        b('Arcanjo Mudo', 'gargoyle', '#ffffff', 2, '...'), { mode: 'town', secrets: 5, fx2: 'sparkles', npcs: [
          npc('Arcanjo Sileno', 'Regente do Coro Calado', P('#f8f0e8', '#fff8d0', '#e0e0f0', '#a0a0c0', '#ffe080'),
            'Fale baixo. Tudo que se diz aqui ecoa até amanhã.',
            'O Coro das Asas Caídas parou de cantar quando Vael parou. Eles estão presos no próprio silêncio, mais adiante.',
            'Se você conseguir sobreviver ao Coro, o Ouvido de Vael vai escutar você. E então tudo termina. Ou começa.'),
          npc('Anjinha Lira', 'Aprendiz de harpa', P('#f8e0d0', '#ffe0a0', '#ffd0e0', '#c0a0b0'),
            'Minha harpa só tem uma corda. A outra eu escondi num lugar secreto da cidade, pra ninguém roubar.',
            'Se achar, pode ficar com o que tem junto. Eu não lembro onde pus. Ecoa demais pra pensar.'),
          npc('Velho Querubim Tônio', 'Guardião dos Ecos', P('#f0d8c0', '#ffffff', '#c0b090', '#806040'),
            'Eu ouvi o eco da primeira palavra de Vael. Foi "mãe". O eco ainda passa por aqui, de vez em quando.'),
          npc('Serafina Torta', 'Asa quebrada', P('#e8d0c0', '#c08060', '#e0c0a0', '#806050'),
            'Caí do Coro quando o Silêncio chegou. Quebrei uma asa. Mas fui a única que continuou cantarolando.',
            'Cante para eles. Eles só precisam lembrar que dá.'),
        ] }),
      z('Coro das Asas Caídas', 'Centenas de anjos ajoelhados em círculo, de boca fechada. Quando você entra, eles se levantam, todos ao mesmo tempo.', 'aurora', [T.FLOOR, T.WALL, T.PILLAR], ['gargoyle', 'wraith', 'sprite', 'wisp', 'shade'], 'feathers', '#e0e8ff', 0.25, [220, 230, 255, 0.18],
        b('Regente do Silêncio Calíope', 'wraith', '#c0c8ff', 3.6, 'Calíope ergue a batuta: — O último concerto é o silêncio. O público vai aplaudir de pé, para sempre.', 'Calíope baixa a batuta. O primeiro anjo abre a boca. Depois todos.', 'O Coro canta. O céu inteiro treme de alegria.'), { mode: 'survival', fx2: 'sparkles' }),
      z('O Ouvido de Vael', 'Uma concha gigante no topo da Coroa. Tudo que o mundo diz chega aqui. Vael ouvia tudo, e por isso enlouqueceu.', 'obsidian', [T.FLOOR, T.CWALL, T.CRYSTAL], ['shade', 'wraith', 'gargoyle', 'golem'], 'void', '#ffffff', 0.5, [200, 200, 230, 0.22],
        b('O Ouvido Que Tudo Ouve', 'shade', '#f0f0ff', 4, 'O Ouvido sussurra com a voz de Vael menino: — É barulho demais. Choro demais. Despedida demais. Me deixa dormir.', 'O Ouvido escuta a última nota: a sua. E finalmente dorme, tranquilo.', 'Silêncio. Mas um silêncio bom, de fim de música.'), { fx2: 'stars' }),
    ],
  },
];

/* ───────────── Histórias paralelas ───────────── */
const talk = (zone: number, text: string, hint: string): SideStep => ({ kind: 'talk', zone, text, hint });
const kill = (zone: number, n: number, text: string, hint: string): SideStep => ({ kind: 'kill', zone, n, text, hint });
const boss = (zone: number, text: string, hint: string): SideStep => ({ kind: 'boss', zone, text, hint });
const choice = (zone: number, text: string, a: string, bb: string): SideStep => ({ kind: 'choice', zone, text, hint: 'Uma decisão espera por você.', options: [a, bb] });

export const ATOS_SIDES: SideStory[] = [
  { id: 'sineiro', realm: 'brumavale', name: 'O Sineiro Perdido', npc: { name: 'Marta Bartolo', title: 'Esposa do Sineiro', pal: P('#f0d0b8', '#804020', '#806040', '#403020') },
    steps: [talk(0, 'Meu Bartolo desceu aos esgotos com uma lanterna e um sanduíche. O sanduíche já deve ter acabado.', 'Fale com Marta na Praça dos Sinos.'),
      kill(1, 12, 'Os ratos-sineiros roubaram a lanterna dele. Sem luz, ele não acha a saída.', 'Derrote 12 criaturas em Brumavale.'),
      boss(1, 'O Rato-Sineiro prende Bartolo. Liberte ele!', 'Derrote o Rato-Sineiro Tolomeu.'),
      choice(2, 'Bartolo voltou, mas diz que quer ficar no campanário para sempre, cuidando do sino. Devo deixar?', 'Deixar ele cuidar do sino', 'Pedir que volte para casa')],
    ending: ['Bartolo mora no campanário. Toda tarde, Marta sobe com um sanduíche, e o sino toca duas vezes: uma por ele, outra por ela.', 'Bartolo volta para casa. O sino passa a ser tocado pelas crianças, cada dia uma. Nunca soou tão desafinado e tão feliz.'],
    reward: { gold: 1500, xp: 4000, item: 'hi_potion', qty: 4 } },
  { id: 'pipoca', realm: 'nimbaria', name: 'As Asas de Pipoca', npc: { name: 'Pipoca', title: 'Filhote nimbário', pal: P('#f8e0c8', '#ffd060', '#ff9060', '#a05030') },
    steps: [talk(0, 'Quero voar até o Trono e ver o rei! Mas minhas asas são pequenas. Me ajuda a ficar forte?', 'Fale com Pipoca nas Docas de Nuvem.'),
      kill(1, 18, 'Traz penas das criaturas das pontes! Vou colar nas minhas asas!', 'Derrote 18 criaturas em Nimbária.'),
      boss(2, 'A Mãe-Trovão tem as penas mais fortes do céu!', 'Derrote a Mãe-Trovão Kumulonimba.'),
      choice(3, 'Com as penas coladas eu consigo voar! Mas a Nana diz que eu ia crescer asas sozinho, um dia. Colo ou espero?', 'Colar as penas e voar agora', 'Esperar as asas crescerem')],
    ending: ['Pipoca voa, desajeitado, colado de penas, gritando de alegria. Cai três vezes e sobe quatro.', 'Pipoca espera. Um ano depois, manda um bilhete por um grou: "Cresceram! Venha ver!"'],
    reward: { gold: 4000, xp: 15000, item: 'elixir', qty: 2 } },
  { id: 'lucio', realm: 'erebo', name: 'O Nome de Lúcio', npc: { name: 'Fantasminha Lúcio', title: 'Alma que se perdeu', pal: P('#e0e0f0', '#e0e0f0', '#c0c0e0', '#a0a0c0') },
    steps: [talk(1, 'Eu queria lembrar meu nome de verdade. Acho que caiu no Rio Lete, lá na margem.', 'Fale com Lúcio na Cidade dos Barqueiros.'),
      kill(0, 20, 'As sombras da margem comem nomes. Se derrotar bastante, talvez uma devolva o meu.', 'Derrote 20 criaturas em Érebo.'),
      boss(3, 'Ouvi dizer que o Forjador transformou meu nome em corrente!', 'Derrote o Forjador Sem-Nome.'),
      choice(1, 'Achei! Meu nome era Teodoro. Mas eu gosto de Lúcio... Qual eu uso?', 'Voltar a ser Teodoro', 'Continuar sendo Lúcio')],
    ending: ['Teodoro lembra da casa, da família, de tudo. Chora, sorri e sobe pelo rio, pronto para descansar.', 'Lúcio guarda o nome antigo num potinho e escolhe o novo. "Quem eu fui ajudou quem eu sou", ele diz.'],
    reward: { gold: 9000, xp: 40000, item: 'elixir', qty: 3 } },
  { id: 'eclipsar', realm: 'lunaris', name: 'O Nome do Campeão', npc: { name: 'Guarda Eclipse', title: 'Porteiro da Arena', pal: P('#c0a080', '#202020', '#802020', '#401010', '#ffd040') },
    steps: [talk(0, 'O Campeão Eclipsar luta há mil anos. Ninguém lembra o nome verdadeiro dele. Nem ele.', 'Fale com o Guarda Eclipse no Bazar.'),
      boss(1, 'Vença ele na Arena. Talvez assim ele descanse.', 'Derrote o Campeão Coroado Eclipsar.'),
      kill(2, 24, 'O nome dele está escrito num espelho do Labirinto. Os reflexos guardam o espelho.', 'Derrote 24 criaturas em Lunáris.'),
      choice(0, 'Achei o nome: Davi, filho de padeiro. Conto para a plateia ou só para ele?', 'Contar para a plateia', 'Contar só para ele')],
    ending: ['A plateia de luas grita "DAVI!" por uma hora. Ele ri como um menino.', 'Você cochicha o nome. Davi fecha os olhos, sorri e tira a coroa. "Obrigado. Agora posso ir para casa."'],
    reward: { gold: 16000, xp: 90000, item: 'elixir', qty: 4 } },
  { id: 'harpa', realm: 'coroa', name: 'A Segunda Corda', npc: { name: 'Anjinha Lira', title: 'Aprendiz de harpa', pal: P('#f8e0d0', '#ffe0a0', '#ffd0e0', '#c0a0b0') },
    steps: [talk(2, 'Com uma corda só, minha harpa toca uma nota. Com duas, toca uma conversa.', 'Fale com Lira na Cidade-Eco dos Anjos.'),
      kill(1, 26, 'As criaturas do Jardim fizeram ninho com a minha corda!', 'Derrote 26 criaturas na Coroa.'),
      boss(3, 'A Regente Calíope cortou as cordas de todo o coro. Faça ela parar!', 'Derrote a Regente Calíope.'),
      choice(2, 'Duas cordas! Toco para o Coro, ou para Vael, que ninguém nunca tocou?', 'Tocar para o Coro', 'Tocar para Vael')],
    ending: ['O Coro canta com a harpa de Lira, e a cidade ecoa música por um ano inteiro.', 'Lira toca para o Ouvido de Vael. Lá no fundo, alguém, pela primeira vez, pede bis.'],
    reward: { gold: 30000, xp: 180000, item: 'elixir', qty: 5 } },
];

/** Nomes dos campeões de elite (provações de zona). */
export const ATOS_CHAMPS: Record<string, string[]> = {
  brumavale: ['Sentinela da Névoa', 'Rato-Badalo Dentuço', 'Gárgula do Campanário'],
  nimbaria: ['Mercador de Raios', 'Grifo Retardatário', 'Filhote-Trovão', 'Arauto de Bramor'],
  erebo: ['Barqueiro Afogado', 'Lembrança Rancorosa', 'Flor Que Morde', 'Brasa Azul', 'Guarda das Gaiolas'],
  lunaris: ['Batedor de Carteira Lunar', 'Gladiador Minguante', 'Reflexo Atrasado', 'Cofre Que Anda'],
  coroa: ['Degrau Raivoso', 'Botão de Luz Espinhento', 'Eco Que Grita', 'Asa Partida', 'Tímpano Vivo'],
};

/** Encontra o ato que abre cada reino (para o mapa). */
export const atosAct = (id: string) => ATOS_REALMS.find((r) => r.id === id)?.act ?? 1;
