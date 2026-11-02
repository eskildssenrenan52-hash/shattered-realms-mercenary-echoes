// Ecos Além — cinco cidades-reinos pós-Ato V e 120 fragmentos de história.
// Os reinos usam o mesmo runtime da Saga, portanto mantêm save, chefes, ondas e escolhas compatíveis.
import type { EnemyKind } from './data';
import type { SagaBoss, SagaFx, SagaRealm, SagaZone, TownNpc, ZoneMode } from './saga';
import { T } from './world';

const P = (skin: string, hair: string, body: string, legs: string, accent?: string): TownNpc['pal'] => accent ? { skin, hair, body, legs, accent } : { skin, hair, body, legs };
const npc = (name: string, title: string, pal: TownNpc['pal'], ...lines: string[]): TownNpc => ({ name, title, pal, lines });
const boss = (name: string, kind: EnemyKind, tint: string, scale: number, intro: string, ...victory: string[]): SagaBoss => ({ name, kind, tint, scale, intro, victory });
const zone = (name: string, lore: string, biome: SagaZone['biome'], tiles: [number, number, number], enemies: EnemyKind[], fx: SagaFx, color: string, light: number, tint: [number, number, number, number], b: SagaBoss, mode: ZoneMode = 'hunt', npcs?: TownNpc[]): SagaZone => ({ name, lore, biome, floor: tiles[0], wall: tiles[1], deco: tiles[2], enemies, fx, color, light, tint, boss: b, mode, npcs, secrets: mode === 'town' ? 5 : 2 });

export const ECHOES_BEYOND_REALMS: SagaRealm[] = [
  {
    id: 'ferrolume', gate: 'ecos', name: 'Ferrólume, a Cidade de Ferro Vivo', subtitle: 'Ecos Além I — Pontes que Lembram', level: 46, color: '#f2b060', portal: '#ffd090',
    prologue: ['Depois da Coroa, uma ponte de metal cresce sobre Potos sem tocar o chão.', 'Ferrólume era a cidade que fabricava as primeiras pontes do mundo. Seus ferreiros aprenderam a dobrar memórias dentro do aço.', 'Agora cada ponte escolhe quem pode atravessar. E a maior delas se recusa a levar alguém embora outra vez.'],
    epilogue: ['A Ponte-Mãe baixa pela primeira vez em séculos.', 'Uma criança atravessa correndo e volta só para provar que pode. Os ferreiros riem, como se a cidade tivesse recebido um coração novo.', 'No arco de ferro, Vésper deixou um desenho: duas pessoas atravessando juntas, sem que uma precise ficar para trás.'],
    reward: { item: 'beyond_ferrolume', name: 'Rebite da Ponte-Mãe', desc: 'Ferro que lembra todo passo que ajudou a dar.', slot: 'armor' },
    zones: [
      zone('Mercado das Chaves Quentes', 'Chaves cantam dentro das bancas. Algumas abrem portas que ainda não existem.', 'amber', [T.COBBLE, T.WALL, T.FURNITURE], ['goblin'], 'gears', '#ffc070', 0.25, [255, 180, 100, 0.18], boss('Prefeita Auri', 'golem', '#d0a060', 2.2, '...'), 'town', [npc('Prefeita Auri Rebite', 'Guardadora de Pontes', P('#e0b890', '#402820', '#b06030', '#503018', '#ffe080'), 'A Ponte-Mãe acordou e decidiu que ninguém merece ir embora.', 'Fale com as pontes. Elas só escutam quem também teve medo de despedida.'), npc('Mestre Ferrugem', 'Ferreiro de lembranças', P('#c09070', '#807060', '#604838', '#302018'), 'Escondi meus melhores rebites onde ninguém procura: perto das colunas que fingem não ter ouvido.')] ),
      zone('Viaduto das Cem Despedidas', 'Trilhos de ferro passam sobre um vazio cheio de vozes que pedem mais um minuto.', 'obsidian', [T.COBBLE, T.ROCK, T.PILLAR], ['golem', 'gargoyle', 'imp'], 'gears', '#e89050', 0.45, [210, 110, 60, 0.25], boss('Cobrador de Bilhetes Brasa', 'golem', '#e06030', 3.3, 'Ninguém cruza sem pagar com uma despedida.', 'Brasa rasga os bilhetes e deixa a ponte cantar o nome de quem volta.'), 'timed'),
      zone('Forno da Ponte-Mãe', 'O forno não forja armas: forja caminhos. Cada martelada vira uma estrada no mundo.', 'volcanic', [T.ASH, T.ROCK, T.LAVA], ['salamander', 'golem', 'imp'], 'embers', '#ff8050', 0.48, [255, 90, 40, 0.3], boss('Ponte-Mãe Vardena', 'golem', '#ffc060', 3.8, 'Se eu abrir, alguém vai partir. Não aguento outra ausência.', 'Vardena abre os braços de aço. A ponte fica. Os viajantes também podem voltar.'), 'survival'),
    ],
  },
  {
    id: 'caligo', gate: 'ecos', name: 'Caligo, o Porto das Nuvens Baixas', subtitle: 'Ecos Além II — Mar sem Horizonte', level: 50, color: '#8fd0d8', portal: '#b0f0f0',
    prologue: ['Um nevoeiro salgado chega a Potos vindo de cima, não do mar.', 'Caligo flutua entre as nuvens baixas; seus navios navegam em correntes de vento e pescam lembranças perdidas.', 'O farol apagou. Sem ele, todos os barcos seguem o mesmo último adeus.'],
    epilogue: ['O farol não mostra uma direção: ele acende todas.', 'Os navios de Caligo escolhem seus caminhos, e a névoa vira chuva sobre Potos.', 'Numa garrafa vazia, Vael escreveu quando criança: “se eu me perder, procure a luz que não manda em mim.”'],
    reward: { item: 'beyond_caligo', name: 'Farol de Bolso', desc: 'Uma luz que aponta para o caminho escolhido, não para o imposto.', slot: 'amulet' },
    zones: [
      zone('Cais da Neblina Pescada', 'Redes puxam memórias brilhantes em vez de peixes. Algumas memórias ainda mordem.', 'coast', [T.COBBLE, T.WALL, T.WATER], ['jelly'], 'spray', '#a0e8f0', 0.25, [100, 200, 220, 0.2], boss('Capitã Lume', 'crow', '#c0f0ff', 2.1, '...'), 'town', [npc('Capitã Lume Maré-Baixa', 'Navegadora de Ar', P('#e0c8b0', '#507080', '#4080a0', '#204050', '#e0ffff'), 'Meu farol escolheu calar porque cada luz parecia uma ordem.', 'Recupere as memórias que o vento levou. Talvez ele aceite iluminar sem prender.'), npc('Peixeiro Nilo', 'Vendedor de memórias pequenas', P('#d0a080', '#306070', '#409090', '#205050'), 'Tem baús nos pontos onde a neblina fica mais grossa. Não pergunte como sei.')] ),
      zone('Pontes de Bruma Contrária', 'A ponte aparece somente quando você caminha. Se hesitar, ela decide que era imaginação.', 'aurora', [T.ICE, T.ROCK, T.CRYSTAL], ['wisp', 'crow', 'sprite'], 'clouds', '#d8f8ff', 0.08, [205, 235, 250, 0.18], boss('Gaivota dos Retornos', 'crow', '#80b8d0', 3.1, 'Toda viagem termina no mesmo lugar. Eu garanto.', 'A gaivota abre as asas; por baixo delas há mapas para destinos que nunca existiram.'), 'timed'),
      zone('Farol Acima do Mar', 'Um farol de pedra preso a uma âncora de nuvem, cercado por navios que perderam o nome.', 'thunder', [T.FLOOR, T.WALL, T.PILLAR], ['wraith', 'gargoyle', 'jelly'], 'rain', '#c0f8ff', 0.35, [120, 180, 230, 0.24], boss('Faroleiro Sem-Rosto', 'wraith', '#b0e0f0', 3.7, 'Se eu acender, alguém verá o fim. Se eu apagar, ninguém sairá.', 'O faroleiro encontra um rosto no reflexo da lanterna e acende a luz.'), 'survival'),
    ],
  },
  {
    id: 'auriflor', gate: 'ecos', name: 'Auriflor, os Jardins que Escolhem', subtitle: 'Ecos Além III — A Flor da Decisão', level: 54, color: '#ffd88a', portal: '#fff0b0',
    prologue: ['Sementes douradas caem em Potos e brotam escadas para um jardim suspenso.', 'Em Auriflor, cada flor escolhe uma possibilidade que poderia ter existido. Os jardineiros começaram a podar todas as escolhas difíceis.', 'O jardim está bonito. E completamente sem vida.'],
    epilogue: ['As flores deixam de escolher por todos.', 'Uma rosa torta cresce entre as douradas, e a cidade inteira a protege como tesouro.', 'Vésper anota: “um mapa só serve se aceita estradas erradas.”'],
    reward: { item: 'beyond_auriflor', name: 'Semente de Possibilidade', desc: 'Floresce apenas quando você muda de ideia.', slot: 'ring' },
    zones: [
      zone('Estufa dos Talvez', 'Vidros altos protegem flores que mostram futuros pequenos: uma carta enviada, um abraço recusado.', 'meadow', [T.MEADOW, T.BUSH, T.FLOWER], ['pixie'], 'petals', '#ffe090', 0.1, [255, 220, 130, 0.18], boss('Jardineira Mavie', 'treant', '#e0b050', 2.2, '...'), 'town', [npc('Jardineira Mavie', 'Cuidadora dos Talvez', P('#f0d0b0', '#d0a040', '#70a050', '#305030', '#ffe080'), 'Flores não deveriam escolher o futuro de ninguém, mas eu tinha medo de vê-las sofrer.', 'Atravesse o jardim imperfeito. Não arranque o que parecer errado só porque é estranho.'), npc('Pólen', 'Aprendiz espirrador', P('#f8d8b8', '#80c050', '#d8c060', '#706030'), 'Os baús gostam de se esconder perto das plantas feias. Elas são boas em guardar coisas.')] ),
      zone('Labirinto das Pétalas Possíveis', 'Pétalas mudam de lugar sempre que você tenta lembrar por qual porta entrou.', 'sakura', [T.FLOWER, T.CWALL, T.BUSH], ['sprite', 'pixie', 'spider'], 'petals', '#ffc8d0', 0.2, [255, 180, 200, 0.22], boss('Borboleta do E Se', 'sprite', '#ffb0d0', 3.2, 'E se você tivesse virado à esquerda?', 'A borboleta pousa na sua mão: “então você seria outro, e ainda seria você.”'), 'timed'),
      zone('Raiz das Escolhas', 'Uma raiz de ouro divide-se em milhares de caminhos, todos pedindo para ser o único.', 'forest', [T.MOSS, T.TREE, T.CRYSTAL], ['treant', 'spider', 'wisp'], 'leaves', '#e8c060', 0.35, [220, 180, 80, 0.25], boss('Árvore da Resposta Única', 'treant', '#d0a040', 3.9, 'Escolha. Escolha. Escolha. Uma resposta é suficiente.', 'A árvore cresce torta, aliviada por não ter de caber numa única forma.'), 'survival'),
    ],
  },
  {
    id: 'espelhum', gate: 'ecos', name: 'Espelhum, a Cidade do Outro Lado', subtitle: 'Ecos Além IV — Reflexos com Vontade', level: 58, color: '#c8d8ff', portal: '#e8eeff',
    prologue: ['Os espelhos de Potos refletem uma cidade que não fica atrás de ninguém.', 'Espelhum é feita daquilo que as pessoas não disseram. Seus habitantes são reflexos que aprenderam a ter vontade própria.', 'O espelho da prefeitura decidiu que o mundo real é uma cópia mal iluminada.'],
    epilogue: ['Os dois lados da cidade assinam o mesmo espelho.', 'Reflexos podem atravessar em dias de festa, e ninguém precisa deixar de existir para o outro caber.', 'Vael desenhou uma janela entre os dois mundos. Vésper acrescentou uma maçaneta dos dois lados.'],
    reward: { item: 'beyond_espelhum', name: 'Espelho de Duas Portas', desc: 'Mostra quem você é e quem você poderia acolher.', slot: 'ring' },
    zones: [
      zone('Praça dos Retratos Inquietos', 'Quadros conversam uns com os outros quando ninguém olha.', 'prism', [T.FLOOR, T.WALL, T.CRYSTAL], ['mimic'], 'sparkles', '#d8e0ff', 0.2, [180, 200, 255, 0.2], boss('Prefeito Refletido', 'shade', '#b0c0ff', 2.3, '...'), 'town', [npc('Prefeito Rian e Rian', 'Duas versões em desacordo', P('#e0c8c0', '#304070', '#6070b0', '#303060', '#d0e0ff'), 'Eu sou o original. — Não, eu sou quem ficou quando você fugiu.', 'Ajude-nos a provar que uma cidade não precisa de um único lado.'), npc('Moldureira Sombra', 'Conserta bordas do mundo', P('#d0b0c0', '#201830', '#604070', '#302040'), 'Os melhores tesouros ficam atrás das molduras que parecem baratas.')] ),
      zone('Galeria de Passos Atrasados', 'Cada passo ecoa antes de acontecer. Se o eco chega ao fim primeiro, a porta fecha.', 'prism', [T.FLOOR, T.CRYSTAL, T.CRYSTAL], ['shade', 'mimic', 'wisp'], 'stars', '#b0c8ff', 0.25, [150, 180, 255, 0.24], boss('Você de Amanhã', 'shade', '#d0dcff', 3.3, 'Eu já perdi. Você ainda pode evitar tudo.', 'O futuro dá um passo para trás e abre espaço para o presente.'), 'timed'),
      zone('Salão do Espelho-Mor', 'Um espelho do tamanho do céu tenta refletir o mundo inteiro de uma vez.', 'marble', [T.FLOOR, T.WALL, T.PILLAR], ['gargoyle', 'wraith', 'shade'], 'void', '#e0e8ff', 0.38, [200, 210, 255, 0.24], boss('Espelho-Mor Albedo', 'golem', '#d8e8ff', 3.9, 'O original é sempre uma decepção. Deixe-me corrigir tudo.', 'Albedo racha em duas portas, ambas abertas.'), 'survival'),
    ],
  },
  {
    id: 'orquestria', gate: 'ecos', name: 'Orquestria, a Cidade das Mil Vozes', subtitle: 'Ecos Além V — Depois do Último Eco', level: 62, color: '#e4a8ff', portal: '#ffd0ff',
    prologue: ['Quando o Ouvido de Vael adormece, uma cidade inteira começa a ensaiar dentro do próprio eco.', 'Orquestria foi construída em torno de uma única nota e aprendeu a dividi-la entre mil pessoas.', 'O maestro quer recolher todas as vozes de volta. Diz que harmonia só existe quando ninguém improvisa.'],
    epilogue: ['A cidade canta fora do compasso e encontra um ritmo novo.', 'Potos ouve de longe e responde. Por um instante, todos os reinos cantam sem que uma voz cubra a outra.', 'Vésper fecha o atlas: “agora sim, o mapa está incompleto do jeito certo.”'],
    reward: { item: 'beyond_orquestria', name: 'Diapasão Incompleto', desc: 'Vibra com cada voz que não quis calar.', slot: 'weapon' },
    zones: [
      zone('Rua dos Instrumentos Órfãos', 'Violinos carregam seus próprios estojos e procuram quem os toque sem mandar neles.', 'lavender', [T.COBBLE, T.WALL, T.FURNITURE], ['sprite'], 'sparkles', '#e8b8ff', 0.18, [220, 150, 255, 0.2], boss('Maestrina Cora', 'sprite', '#d8a0f0', 2.3, '...'), 'town', [npc('Maestrina Cora Fora-do-Tom', 'Regente provisória', P('#f0d0c0', '#8050a0', '#604080', '#302050', '#ffd0ff'), 'Todo músico aqui ouviu o Silêncio e jurou nunca mais errar uma nota.', 'Mas uma canção sem risco é só uma caixa fechada. Abra o Teatro das Resonâncias.'), npc('Tamborim', 'Tambor que fala baixo', P('#b08060', '#c05050', '#a06030', '#503020'), 'Baús escondidos fazem um som oco quando você passa perto. Eu ensinaria, mas só sei tum.')] ),
      zone('Teatro das Resonâncias', 'Cada aplauso convoca sombras de plateias antigas. Elas exigem bis até esquecerem por que vieram.', 'ruins', [T.FLOOR, T.WALL, T.PILLAR], ['wraith', 'shade', 'mimic'], 'ghosts', '#c8a0e8', 0.4, [170, 120, 210, 0.26], boss('Plateia de Mil Máscaras', 'wraith', '#b080d0', 3.4, 'Mais uma. Mais uma. Mais uma.', 'As máscaras batem palmas uma última vez e deixam o palco vazio, em paz.'), 'survival'),
      zone('Palco da Nota Única', 'Um palco no alto da cidade onde uma nota tenta cantar todas as outras e está quase se quebrando.', 'aurora', [T.FLOOR, T.WALL, T.CRYSTAL], ['wisp', 'gargoyle', 'shade'], 'stars', '#f0d0ff', 0.24, [230, 180, 255, 0.22], boss('Maestro Uníssono', 'wraith', '#f0c0ff', 4, 'Uma voz. Uma verdade. Um fim.', 'O maestro ouve uma criança cantar fora do tom e sorri pela primeira vez.'), 'timed'),
    ],
  },
];

export interface BeyondChronicle { id: string; realm: string; title: string; text: string; }
const CHRONICLERS = [
  ['Auri', 'um rebite que aprendeu a esperar'], ['Lume', 'uma âncora que sonhava com o céu'], ['Mavie', 'uma flor que escolheu nascer torta'], ['Rian', 'um reflexo que recusou ser cópia'], ['Cora', 'um acorde que esqueceu o compasso'],
  ['Vésper', 'um mapa que se redesenhou sozinho'], ['Vael', 'uma despedida que não virou silêncio'], ['Gorm', 'uma carta que chegou tarde, mas chegou'], ['Lyria', 'uma canção cantada por quem tinha medo'], ['Benedito', 'um porto que se lembrava de todos'],
  ['Seraphine', 'uma estrela que aceitou não saber o caminho'], ['Lúcio', 'um nome escolhido duas vezes'],
] as const;
const MOTIFS = ['ponte', 'luz', 'semente', 'espelho', 'tambor', 'mapa', 'maré', 'asa', 'chave', 'eco'];
export const ECHOES_BEYOND_CHRONICLES: BeyondChronicle[] = Array.from({ length: 120 }, (_, i) => {
  const [speaker, seed] = CHRONICLERS[i % CHRONICLERS.length]!;
  const motif = MOTIFS[Math.floor(i / CHRONICLERS.length) % MOTIFS.length]!;
  return { id: `beyond-${i + 1}`, realm: ECHOES_BEYOND_REALMS[i % ECHOES_BEYOND_REALMS.length]!.id, title: `${speaker} · Fragmento ${String(i + 1).padStart(3, '0')}`, text: `${speaker} deixou ${seed}. A ${motif} responde: “o que foi perdido não precisa mandar no que vem depois.”` };
});

export const AMBITIOUS_SYSTEMS = [
  ['cartografia-viva', 'Cartografia viva de Vésper', 'Explorações, escolhas e ilhas alimentam rotas registradas no Atlas com viagem rápida segura.'],
  ['potos-reconstruida', 'Reconstrução de Potos', 'Moradores e uma mercadora retornam; cada reino liberto amplia a cidade e melhora os preços.'],
  ['lacos-eco', 'Laços de Eco', 'Pets de elementos diferentes podem despertar uma cena de lealdade e uma combinação passiva de ataque/guarda.'],
  ['conselho', 'Conselho dos Reinos', 'Três votações persistentes alteram reputação das facções, preço de loja e pontuação de finais.'],
  ['sonhos', 'Expedições oníricas', 'Memórias de chefes abrem masmorras curtas procedurais com guardião, recompensa e progressão salva.'],
  ['constelacoes', 'Rituais de constelação', 'Três sequências de céu, mar e som registram uma rota estelar alternativa ao Coração Oculto.'],
  ['caravanas', 'Caravanas', 'Encomendas usam ouro/tábuas, exigem visita ao destino e devolução em Potos para abrir rotas.'],
  ['museu', 'Museu das Canções Perdidas', 'Relíquias liberam cenas; a curadoria preserva ou liberta a lembrança, com escolha persistente.'],
  ['tempestades', 'Tempestades de Fratura', 'Eventos opt-in instanciados distorcem uma região, geram cache e Arauto raro sem interromper outros jogadores.'],
  ['ciclo-alem', 'Novo Ciclo: Ecos Além', 'Cinco desfechos persistentes reabrem os reinos e modificam escala e recompensas dos chefes.'],
] as const;
