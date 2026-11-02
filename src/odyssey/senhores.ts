// Os Senhores das Terras — oito chefes únicos, um para cada bioma antigo que ainda não tinha
// guardião. Cada um tem aparência, cena de chegada e cena de vitória próprias. Dado puro.
import type { Biome, BossDef, EnemyKind } from './data';
import { BIOME_LEVEL } from './levels';

interface Senhor { id: string; name: string; biome: Biome; tx: number; ty: number; kind: EnemyKind; tint: string; scale: number; minion: EnemyKind; reward: string[]; intro: string[]; victory: string[] }

const S: Senhor[] = [
  { id: 'lord_autumn', name: 'Viúva do Outono, Elegíra', biome: 'autumn', tx: 50, ty: 154, kind: 'crow', tint: '#d06a20', scale: 3, minion: 'crow', reward: ['hi_potion', 'hi_potion', 'mana_shard'],
    intro: ['As folhas param no ar. Pela primeira vez em cem anos, o outono deixa de cair.', 'Do redemoinho dourado surge Elegíra, feita de mil folhas secas costuradas com saudade.', '— Ninguém vai embora deste bosque — diz ela. — Eu não deixo. Eu não aguento mais nenhum adeus.', 'Suas asas se abrem. Cada pena é uma carta de despedida que nunca foi entregue.'],
    victory: ['Elegíra se desfaz numa chuva de folhas. Pela primeira vez, elas tocam o chão.', 'Entre as folhas, uma carta antiga: “Volto antes do inverno.” A velha que varre o caminho a lê e sorri.', '— Então ele tentou — sussurra ela. — Isso basta.', 'Naquela noite, depois de um século, neva no Bosque de Âmbar.'] },
  { id: 'lord_swamp', name: 'Barqueiro Sem Rosto, Morrow', biome: 'swamp', tx: 80, ty: 192, kind: 'shade', tint: '#5ad0a0', scale: 3.2, minion: 'wisp', reward: ['hi_potion', 'elixir'],
    intro: ['Os vagalumes se apagam todos de uma vez.', 'O barqueiro que lhe cobrou uma lembrança ergue o remo. Agora ele tem um rosto: o seu.', '— Eu guardo o que o mundo esquece — diz Morrow. — E você, viajante, esquece demais.', '— Vamos ver quantas vidas suas eu consigo guardar no fundo do pântano.'],
    victory: ['O barco afunda devagar. Das águas sobem milhares de luzes: as lembranças que Morrow guardava.', 'Uma delas pousa na sua mão. É o gosto daquela fruta que você nunca comeu. Agora você lembra onde a comeu.', 'Foi num Ciclo anterior. Gorm estava lá. E Vael também, sorrindo.', 'Os vagalumes voltam a piscar, agora no ritmo do seu coração.'] },
  { id: 'lord_coast', name: 'Leviatã do Farol, Candora', biome: 'coast', tx: 290, ty: 90, kind: 'serpent', tint: '#3a90d0', scale: 3.4, minion: 'crab', reward: ['hi_potion', 'hi_potion', 'elixir'],
    intro: ['O mar recua de uma vez, deixando peixes se debatendo na areia.', 'Da água negra se ergue Candora, uma serpente marinha com um farol apagado cravado nas costas.', '— Cem anos de navios perdidos — ela ruge. — Eu engoli todos para que ninguém mais chorasse no cais.', 'A onda que ela levanta é do tamanho de uma montanha.'],
    victory: ['O farol nas costas de Candora se acende sozinho quando ela cai.', 'Pela luz, barcos fantasmas voltam ao porto, um por um. Nos cais, as famílias acenam.', 'O faroleiro desce a escada pela última vez, chorando. — Eles acharam o caminho — diz. — Finalmente.', 'Na estátua dos dois meninos, o rosto raspado volta a aparecer. É Vael, criança, rindo.'] },
  { id: 'lord_jungle', name: 'Mãe-das-Lianas, Argaesh', biome: 'jungle', tx: 32, ty: 192, kind: 'treant', tint: '#3aa040', scale: 3.4, minion: 'spider', reward: ['hi_potion', 'mana_shard', 'mana_shard'],
    intro: ['A trilha atrás de você desaparece. A selva fechou a única saída.', 'Uma árvore se levanta do chão, com raízes como braços e flores carnívoras no lugar dos olhos.', '— Eu como nomes — sussurra Argaesh. — Foi assim que protegi meu povo do Silêncio: ninguém aqui tem nome pra perder.', '— O seu nome tem um gosto antigo. Vou saboreá-lo devagar.'],
    victory: ['Argaesh tomba e, de dentro do tronco, saem nomes: centenas, escritos em folhas.', 'Os Argaes descem das copas pela primeira vez em gerações, cada um procurando o seu.', 'A caçadora encontra o dela e o lê em voz alta, tremendo. É um nome lindo.', '— A profecia errou — ela ri. — Você não perdeu tudo. Você nos devolveu tudo.'] },
  { id: 'lord_volcanic', name: 'Forjador Cinzento, Kaorath', biome: 'volcanic', tx: 240, ty: 194, kind: 'golem', tint: '#e04820', scale: 3.6, minion: 'imp', reward: ['elixir', 'elixir', 'mana_shard'],
    intro: ['A lava para de correr. Fica cinza, como pedra morta.', 'Um colosso de ferro ergue um martelo do tamanho de uma casa. No peito dele, pulsa um arco cinzento.', '— Fui eu que forjei o arco do Silêncio — diz Kaorath. — Vael me pediu. Eu não soube dizer não.', '— Agora carrego o peso dele. E você vai carregar o meu.'],
    victory: ['O arco cinzento se parte no peito de Kaorath. A lava volta a correr, vermelha e viva.', '— Obrigado — diz o forjador, enquanto se desfaz em brasas. — Diga ao menino que eu o perdoo.', 'A forja de Kaore volta a esquentar. Os ferreiros cantam enquanto trabalham, pela primeira vez em cem anos.', 'Do arco quebrado, você guarda uma lasca. Ela é morna. Parece um pedido de desculpas.'] },
  { id: 'lord_mushroom', name: 'Sonhador Sem Fim, Mycelion', biome: 'mushroom', tx: 14, ty: 154, kind: 'mushroom', tint: '#c050e0', scale: 3.2, minion: 'sporeling', reward: ['hi_potion', 'hi_potion', 'mana_shard'],
    intro: ['O chão vira teto. O céu vira lago. O bosque está sonhando com você.', 'Mycelion, o sábio-esporo gigante, abre todos os olhos ao mesmo tempo.', '— Este é um dos sonhos ruins — diz ele, com tristeza. — Aquele em que você não vence.', '— Prove que é só um sonho. Por favor.'],
    victory: ['O sonho se rasga como papel. O bosque volta ao lugar, e o rio volta a correr.', 'Mycelion fecha os olhos, aliviado. — Agora todos os sonhos terminam do mesmo jeito.', '— Com você em pé. Com a Canção inteira.', 'Os cogumelos brilham num tom dourado que nunca tinham tido antes.'] },
  { id: 'lord_meadow', name: 'Pastor das Estrelas, Aethyron', biome: 'meadow', tx: 124, ty: 190, kind: 'boar', tint: '#f0e080', scale: 3, minion: 'slime', reward: ['hi_potion', 'mana_shard'],
    intro: ['À noite, as estrelas da Pradaria descem do céu e se juntam num só corpo.', 'Aethyron é um touro feito de constelações, com um buraco escuro no lugar do coração.', '— Falta uma estrela — ele brada. — A de Vael. E enquanto faltar, eu não descanso.', '— Talvez a sua sirva no lugar.'],
    victory: ['Aethyron se ajoelha e se desfaz em estrelas, que sobem de volta para o céu.', 'No lugar vazio, a estrela que faltava acende. Fraca, mas acesa.', 'O pastor menino aponta, gritando de alegria: — Ela voltou! Bisa, ela voltou!', 'Em algum lugar distante, um homem de manto cinza olha para cima e, sem saber por quê, sorri.'] },
  { id: 'lord_ruins', name: 'Regente de Pedra, Artisan', biome: 'ruins', tx: 174, ty: 194, kind: 'gargoyle', tint: '#b0b0c8', scale: 3.6, minion: 'skeleton', reward: ['elixir', 'elixir', 'eco_shard'],
    intro: ['As estátuas de Artis viram a cabeça, todas ao mesmo tempo, para você.', 'O último rei da cidade desce do trono, feito inteiro de mármore rachado.', '— Eu mandei meu povo parar — diz Artisan. — Achei que, parados, não iriam sofrer.', '— Se você quer que eles voltem a andar, vai ter que me fazer cair primeiro.'],
    victory: ['O Regente cai e, com ele, a pedra que prendia a cidade.', 'Uma por uma, as estátuas respiram. Piscam. Choram. Se abraçam.', 'A criança de pedra assobia com a folha de trigo que você deixou na mão dela.', 'Artis volta a cantar. Não a sinfonia de antes: uma canção nova, cheia de notas erradas e de vida.'] },
];

const lvl = (b: Biome) => BIOME_LEVEL[b] + 8;
export const SENHOR_BOSSES: BossDef[] = S.map((s) => {
  const l = lvl(s.biome);
  return { id: s.id, name: s.name, biome: s.biome, tx: s.tx, ty: s.ty, hp: Math.round(900 + l * l * 14 + l * 70), atk: Math.round(14 + l * 1.8), xp: Math.round(200 + l * l * 6), gold: l * 35, color: s.tint, minion: s.minion, reward: s.reward };
});
export const SENHOR_LOOK: Record<string, { kind: EnemyKind; tint: string; scale: number }> = Object.fromEntries(S.map((s) => [s.id, { kind: s.kind, tint: s.tint, scale: s.scale }]));
export const SENHOR_VICTORY = S.map((s) => ({ id: `senhor_${s.id}`, trigger: `boss:${s.id}`, title: `${s.name} — Vencido`, lines: s.victory }));
export const SENHOR_INTROS = S.map((s) => ({ id: `senhor_intro_${s.id}`, trigger: `boss:intro:${s.id}`, title: `Senhor das Terras — ${s.name}`, lines: s.intro }));
