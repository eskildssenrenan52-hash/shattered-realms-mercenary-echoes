import type { World } from './world';
import { W, H, TS, T, SOLID, hash } from './world';
import { LEGACY_W, LEGACY_H, FRONTIER_GATES } from './frontier';

export interface Building { id: string; name: string; x: number; y: number; w: number; h: number; kind: 'home' | 'inn' | 'smith' | 'alchemy' | 'library' | 'ruin'; resident?: string; secret?: boolean; accent?: string; note: string }
const POTOS_BUILDINGS: Building[] = [
  { id: 'forge', name: 'Forja de Brunhild', x: 109, y: 119, w: 5, h: 4, kind: 'smith', resident: 'smith', note: 'O calor da forja nunca se apaga. Há um compartimento atrás das caixas.' },
  { id: 'lira', name: 'Ateliê de Lira', x: 130, y: 119, w: 5, h: 4, kind: 'alchemy', resident: 'alchemist', note: 'As flores azuis crescem perto de lugares onde a mana ainda é pura.' },
  { id: 'archive', name: 'Arquivo de Potos', x: 116, y: 112, w: 7, h: 5, kind: 'library', resident: 'elder', note: '“Sob a biblioteca, as raízes guardam o primeiro segredo. Examine a estante do fundo.”' },
  { id: 'inn', name: 'Pousada do Vagalume', x: 109, y: 130, w: 5, h: 4, kind: 'inn', note: 'Uma cama macia e uma refeição quente. Os viajantes contam sobre portais esquecidos.' },
  { id: 'pip', name: 'Empório do Pip', x: 131, y: 130, w: 5, h: 4, kind: 'home', resident: 'merchant', note: 'Pip esconde suas economias entre os vasos. Não conte a ninguém.' },
  { id: 'ranger', name: 'Cabana das Folhas', x: 51, y: 108, w: 5, h: 4, kind: 'home', resident: 'ranger', note: 'Siga os cogumelos luminosos para encontrar o Jardim Esquecido.' },
  { id: 'oasis', name: 'Refúgio das Areias', x: 201, y: 120, w: 6, h: 4, kind: 'inn', resident: 'nomad', note: 'A leste, a areia engoliu um templo. Sua entrada ainda respira luz.' },
  { id: 'monastery', name: 'Mosteiro da Aurora', x: 124, y: 34, w: 6, h: 5, kind: 'library', resident: 'hermit', note: 'O cristal azul aponta para a cripta. Nem tudo que dorme no gelo está morto.' },
  { id: 'bakery', name: 'Padaria Mel & Trigo', x: 107, y: 99, w: 5, h: 4, kind: 'home', note: 'Cheiro de pão quente. A padeira jura que o trigo das Campinas do Sol cresce mais doce.' },
  { id: 'weaver', name: 'Casa do Tecelão', x: 114, y: 99, w: 5, h: 4, kind: 'home', note: 'Teares cheios de fios coloridos. Um tapete ainda inacabado mostra um mapa do continente.' },
  { id: 'academy', name: 'Escola de Magia de Potos', x: 126, y: 99, w: 6, h: 4, kind: 'library', note: 'Monstros têm níveis fixos: cada bioma tem seu perigo, e cada espécie soma sua própria força.' },
  { id: 'watch', name: 'Torre da Guarda', x: 144, y: 101, w: 5, h: 4, kind: 'home', note: 'O capitão anota: “Planícies nível 1. Cavernas, nível 18. Obsidiana... só os tolos vão sem nível 30.”' },
  { id: 'tavern', name: 'Taverna do Javali Dourado', x: 92, y: 113, w: 6, h: 4, kind: 'inn', note: 'Música, risadas e sopa quente. Aqui todo aventureiro descansa.' },
  { id: 'armory', name: 'Armaria de Garrick', x: 92, y: 130, w: 6, h: 4, kind: 'smith', note: 'Espadas penduradas em fileiras. Garrick diz que minério de cristal faz as melhores lâminas.' },
  { id: 'herbalist', name: 'Herbanário da Vovó Fen', x: 94, y: 144, w: 5, h: 4, kind: 'alchemy', note: 'Potes de ervas secas até o teto. Um bilhete: “Ervas da geada curam o que o frio feriu.”' },
  { id: 'fishers', name: 'Casa dos Pescadores', x: 107, y: 144, w: 5, h: 4, kind: 'home', note: 'Redes, varas e histórias sobre peixes que brilham nos lagos da fronteira.' },
  { id: 'moss', name: 'Casa da Família Moss', x: 114, y: 144, w: 5, h: 4, kind: 'home', note: 'Desenhos de crianças nas paredes mostram o herói enfrentando um golem gigante.' },
  { id: 'cathedral', name: 'Catedral da Árvore de Mana', x: 126, y: 144, w: 8, h: 6, kind: 'library', note: 'Vitrais contam a história da Árvore de Mana e dos oito espíritos.' },
  { id: 'stable', name: 'Estábulo do Caravaneiro', x: 144, y: 113, w: 5, h: 4, kind: 'home', note: 'Caravanas partem daqui para as fronteiras. Feno, selas e mapas rabiscados.' },
  { id: 'garden', name: 'Jardim Esquecido', x: 30, y: 151, w: 5, h: 4, kind: 'ruin', secret: true, note: 'Entre raízes e estrelas, alguém ainda cuida deste jardim.' },
  { id: 'temple', name: 'Templo do Sol Afogado', x: 258, y: 156, w: 7, h: 5, kind: 'ruin', secret: true, note: 'O império caiu. A luz permaneceu.' },
  { id: 'crypt', name: 'Cripta da Aurora', x: 72, y: 23, w: 5, h: 4, kind: 'ruin', secret: true, note: 'Os guardiões gravaram seus nomes em cristais de gelo.' },
  { id: 'roots', name: 'Santuário das Raízes', x: 144, y: 190, w: 7, h: 5, kind: 'ruin', secret: true, note: 'A Árvore de Mana se estende muito além do que os olhos alcançam.' },
  { id: 'lantern-hall', name: 'Salão das Lanternas Imóveis', x: 187, y: 91, w: 6, h: 5, kind: 'library', resident: 'elder', note: 'Uma lanterninha âmbar se acende quando alguém conta uma lembrança verdadeira.' },
  { id: 'sky-observatory', name: 'Observatório do Bosque Enraizado', x: 240, y: 102, w: 6, h: 5, kind: 'library', resident: 'hermit', note: 'O astrônomo planta relógios no solo para descobrir quando a próxima estação esquecida chegará.' },
  { id: 'salt-inn', name: 'Pousada da Maré de Sal', x: 263, y: 132, w: 6, h: 4, kind: 'inn', resident: 'nomad', note: 'Os viajantes deixam conchas nas janelas; cada uma contém uma nota de uma cidade submersa.' },
  { id: 'comet-forge', name: 'Forja dos Cometas', x: 236, y: 184, w: 6, h: 5, kind: 'smith', resident: 'smith', note: 'O ferreiro usa pedra estelar fria e espera o dia em que o céu volte a nascer.' },
];
export interface FrontierCity { id: string; name: string; gateId: string; biome: string; tx: number; ty: number; lore: string; color: string }
const CITY_TALES = [
  { gate: 0, name: 'Lúmen-Pétala', lore: 'As pétalas da avenida central mudam de cor com cada lembrança partilhada.', color: '#f1a7c4', buildings: [
    ['salão_das_pétalas', 'Salão das Pétalas', 'library', 'lumen_keeper', 'O arquivo da cidade guarda folhas que caíram antes da fundação. Uma margem fala de um mapa sob as raízes.'],
    ['oficina_rosada', 'Oficina Rosada', 'smith', 'smith', 'A ferreira grava o nome de cada aprendiz no cabo da primeira ferramenta que ele constrói.'],
    ['pousada_borboleta', 'Pousada da Borboleta', 'inn', 'merchant', 'Uma viajante deixou bilhetes de três cidades que ainda não aparecem no Atlas.'],
  ] },
  { gate: 2, name: 'Prisma-Viva', lore: 'Mercadores trocam cacos de cristal por histórias, nunca por moedas.', color: '#8ce1d7', buildings: [
    ['casa_dos_veios', 'Casa dos Veios', 'library', 'prism_keeper', 'O mestre dos cristais afirma que cada cor responde a um som diferente.'],
    ['forja_prismatica', 'Forja Prismática', 'smith', 'smith', 'A bigorna tem sete marcas: uma para cada minério que veio do coração da montanha.'],
    ['estalagem_espectro', 'Estalagem do Espectro', 'inn', 'nomad', 'Mapas de vidro mostram uma passagem segura entre os pilares do labirinto.'],
  ] },
  { gate: 4, name: 'Porto das Marés Doces', lore: 'O porto suspende lanternas azuis quando barcos fantasmas voltam para casa.', color: '#70bfd8', buildings: [
    ['arquivo_mare', 'Arquivo da Maré', 'library', 'tide_keeper', 'Os livros são pesados com conchas. Um diário descreve sinos que continuam tocando no fundo do mar.'],
    ['estaleiro_concha', 'Estaleiro da Concha', 'smith', 'smith', 'A oficina conserta cascos com madeira antiga e resina dos manguezais.'],
    ['casa_marulho', 'Casa do Marulho', 'inn', 'merchant', 'Uma mesa está reservada para um capitão que ainda não regressou da travessia.'],
  ] },
  { gate: 6, name: 'Bambu do Zéfiro', lore: 'Pontes de bambu cantam quando os ventos indicam que uma caravana está próxima.', color: '#92c994', buildings: [
    ['escola_dos_ventos', 'Escola dos Ventos', 'library', 'zephyr_keeper', 'Os aprendizes aprendem primeiro a ouvir o vento, depois a escolher o caminho.'],
    ['ateliê_jade', 'Ateliê de Jade', 'alchemy', 'alchemist', 'Chás de jade acalmam espíritos que perderam a direção entre as raízes.'],
    ['pousada_grou', 'Pousada do Grou', 'inn', 'ranger', 'A guardiã das trilhas marca no mapa os lugares onde os bambus crescem ao contrário.'],
  ] },
  { gate: 8, name: 'Farol de Âmbar', lore: 'A cidade usa lentes de âmbar para guiar viajantes durante as tempestades de areia.', color: '#e6b46d', buildings: [
    ['observatorio_ambar', 'Observatório de Âmbar', 'library', 'amber_keeper', 'A lente principal revela estradas que só existem ao meio-dia.'],
    ['fundição_dourada', 'Fundição Dourada', 'smith', 'smith', 'O metal desta região fica mais resistente depois de uma noite sob as estrelas.'],
    ['mercado_do_oasis', 'Mercado do Oásis', 'inn', 'merchant', 'Os caravaneiros aceitam ervas raras como pagamento por rotas secretas.'],
  ] },
  { gate: 9, name: 'Raiz de Trovão', lore: 'A muralha é feita de árvores que atraem relâmpagos e os guardam no tronco.', color: '#a6b3c8', buildings: [
    ['casa_dos_tambores', 'Casa dos Tambores', 'library', 'storm_keeper', 'Cada tambor reproduz um trovão antigo; a sequência certa abre o portão do planalto.'],
    ['oficina_raio', 'Oficina do Raio', 'smith', 'smith', 'As lâminas são temperadas durante uma tempestade, nunca dentro de uma fornalha.'],
    ['estalagem_nuvem', 'Estalagem da Nuvem Baixa', 'inn', 'nomad', 'Um mapa dobrado indica as ruínas mais altas da fronteira.'],
  ] },
  { gate: 11, name: 'Mata dos Esporos', lore: 'Cogumelos luminosos formam uma rede de recados entre as casas da cidade.', color: '#bd9ad6', buildings: [
    ['arquivo_micelio', 'Arquivo do Micélio', 'library', 'mycelium_keeper', 'As raízes trocam notícias entre si. O arquivo apenas traduz os sussurros.'],
    ['botica_fosforescente', 'Botica Fosforescente', 'alchemy', 'alchemist', 'Uma gota de orvalho lunar cura feridas, mas revela por um instante o que foi esquecido.'],
    ['pousada_cogumelo', 'Pousada do Cogumelo Azul', 'inn', 'merchant', 'Os hóspedes desenham em guardanapos os caminhos que tiveram coragem de seguir.'],
  ] },
  { gate: 14, name: 'Marbleira', lore: 'Escultores deixam espaços vazios nas estátuas para que a cidade possa mudar de ideia.', color: '#d8d4bd', buildings: [
    ['museu_marmore', 'Museu do Mármore', 'library', 'marble_keeper', 'Uma sala vazia celebra todas as pessoas que ajudaram sem deixar o nome.'],
    ['atelier_escultores', 'Ateliê dos Escultores', 'smith', 'smith', 'O escultor diz que o mármore tem memória e só precisa de tempo para falar.'],
    ['hospedaria_quieta', 'Hospedaria da Praça', 'inn', 'ranger', 'Os bancos da praça apontam para os portões mais antigos do continente.'],
  ] },
];
export const FRONTIER_CITIES: FrontierCity[] = CITY_TALES.map((city) => {
  const gate = FRONTIER_GATES[city.gate]!;
  return { id: `city_${gate.biome}`, name: city.name, gateId: gate.id, biome: gate.biome, tx: gate.tx, ty: gate.ty, lore: city.lore, color: city.color };
});
const CITY_BUILDINGS: Building[] = CITY_TALES.flatMap((city, i) => {
  const district = FRONTIER_CITIES[i]!;
  const points = [[-18, -17], [7, -17], [-5, 10]] as const;
  return city.buildings.map(([suffix, name, kind, resident, note], j) => {
    const [dx, dy] = points[j]!;
    return { id: `${district.id}_${suffix}`, name: `${name} de ${district.name}`, x: district.tx + dx, y: district.ty + dy, w: j === 2 ? 8 : 6, h: 5, kind: kind as Building['kind'], resident, accent: district.color, note };
  });
});
export const BUILDINGS: Building[] = [...POTOS_BUILDINGS, ...CITY_BUILDINGS];
export function frontierCityAt(tx: number, ty: number) {
  let nearest: FrontierCity | undefined;
  let distance = Infinity;
  for (const city of FRONTIER_CITIES) {
    const d = Math.hypot(tx - city.tx, ty - city.ty);
    if (d < distance) { nearest = city; distance = d; }
  }
  return distance <= 38 ? nearest : undefined;
}
export const doorOf = (b: Building) => ({ tx: b.x + Math.floor(b.w / 2), ty: b.y + b.h - 1 });
export interface Treasure { id: string; tx: number; ty: number; gold: number; item: string; qty: number; name: string }
export const TREASURES: Treasure[] = [
  { id: 'village-well', tx: 127, ty: 136, gold: 25, item: 'potion', qty: 2, name: 'O presente do viajante' },
  ...Array.from({ length: 35 }, (_, i) => ({ id: `wild-${i}`, tx: 15 + Math.floor(hash(i, 7, 81) * (LEGACY_W - 35)), ty: 12 + Math.floor(hash(i, 3, 42) * (LEGACY_H - 30)), gold: 35 + i * 7, item: ['ether', 'hi_potion', 'mana_shard', 'crystal_ore', 'elixir'][i % 5], qty: i % 3 + 1, name: ['Cache dos peregrinos', 'Herança dos antigos', 'Relíquia entre raízes', 'Tesouro da lua', 'O segredo do explorador'][i % 5] })),
  ...FRONTIER_GATES.map((g,i)=>({id:`cache-${g.id}`,tx:g.tx+6,ty:g.ty+5,gold:75+i*15,item:'mana_shard',qty:3,name:`Relíquia: ${g.name}`})),
];
export const ROOM = { left: 106, top: 94, width: 27, height: 17, spawnX: 119 * TS + 8, spawnY: 108 * TS + 8, exitX: 119, exitY: 110 };
export function createInterior(b: Building): World {
  const tiles = new Uint8Array(W * H).fill(T.CWALL);
  const biomes = new Uint8Array(W * H).fill(b.kind === 'ruin' ? 3 : 0);
  for (let y = ROOM.top; y <= ROOM.exitY; y++) for (let x = ROOM.left; x < ROOM.left + ROOM.width; x++) tiles[y * W + x] = y < ROOM.top + 2 ? T.PANEL : b.kind === 'ruin' ? T.CAVE : T.FLOOR;
  for (let x = ROOM.left; x < ROOM.left + ROOM.width; x++) tiles[ROOM.exitY * W + x] = x === ROOM.exitX ? T.DOOR : T.PANEL;
  for (let y = ROOM.top + 2; y < ROOM.exitY; y++) { tiles[y * W + ROOM.left] = T.PANEL; tiles[y * W + ROOM.left + ROOM.width - 1] = T.PANEL; }
  // Furniture collision, with clear walking lanes and an unobstructed exit.
  for (const [x,y,w,h] of [[108,96,4,2],[126,96,4,2],[114,101,4,2],[126,103,3,3]]) for (let dy=0;dy<h;dy++) for(let dx=0;dx<w;dx++) tiles[(y+dy)*W+x+dx]=T.FURNITURE;
  return { tiles, biomes, nodes: [] };
}
export function prepareExploration(world: World) {
  for (const b of BUILDINGS) {
    for(let y=b.y-2;y<=b.y+b.h+2;y++) for(let x=b.x-2;x<=b.x+b.w+2;x++) if(x>=0&&y>=0&&x<W&&y<H) world.tiles[y*W+x]=T.GRASS;
    for(let y=0;y<b.h;y++) for(let x=0;x<b.w;x++) world.tiles[(b.y+y)*W+b.x+x]=y<b.h-2?T.ROOF:T.WALL;
    const d=doorOf(b); world.tiles[d.ty*W+d.tx]=T.DOOR;
    for(let y=d.ty+1;y<d.ty+4;y++) world.tiles[y*W+d.tx]=T.PATH;
  }
  for(const t of TREASURES) for(let y=-1;y<=1;y++) for(let x=-1;x<=1;x++) { const i=(t.ty+y)*W+t.tx+x; if(SOLID.has(world.tiles[i])) world.tiles[i]=world.biomes[i]===3?T.CAVE:world.biomes[i]===4?T.SNOW:world.biomes[i]===2?T.SAND:T.GRASS; }
}
export function canClaimTreasure(opened: ReadonlySet<string>, id: string) { return !opened.has(id); }
