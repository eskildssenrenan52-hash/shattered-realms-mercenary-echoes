// Constantes e cena da Manopla sem dependências (evita ciclo story → manopla → world → data → story).
export const MANOPLA_ITEM = 'manopla_vesper';
export const MANOPLA_QUEST = 'm6';

/* ───────────── A Manopla entra na história ───────────── */
export const MANOPLA_BEAT = {
  id: 'manopla_vesper', trigger: `quest:${MANOPLA_QUEST}`, title: 'A Manopla de Vésper', lines: [
    'Entre os cacos do Colosso, algo brilha que não é cristal: uma manopla de latão e couro, coberta de mapas gravados.',
    'Ela se encaixa no seu braço como se tivesse sido feita para ele. Os dedos se mexem sozinhos.',
    'Voz baixa, vinda da Manopla: — Finalmente alguém forte o bastante para quebrar aquele guardião. Ele me engoliu há cem anos.',
    '— Meu nome é Vésper. Fui a Primeira Cartógrafa. Desenhei a Canção em mapas até o Silêncio arrancar páginas inteiras do mundo.',
    '— Há lugares que ninguém lembra mais. Não estão no Atlas. Não estão em lugar nenhum. Mas eu ainda sei onde a costura ficou.',
    'Gorm arregala os olhos: — A Fenda Costurada... a cicatriz no chão, a oeste da praça. Sempre achei que fosse só uma rachadura.',
    'Vésper: — Leve a minha mão até lá. Eu abro o caminho. Você faz o resto.',
  ],
};
