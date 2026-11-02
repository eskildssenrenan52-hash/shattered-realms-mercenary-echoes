// Marcos locais: o Vite copia estas imagens para o bundle web e para o APK offline.
import relicarioUrl from '@/assets/realm-marcos/runtime/relicario.webp';
import origamiaUrl from '@/assets/realm-marcos/runtime/origamia.webp';
import leviataUrl from '@/assets/realm-marcos/runtime/leviata.webp';
import brumavaleUrl from '@/assets/realm-marcos/runtime/brumavale.webp';
import nimbariaUrl from '@/assets/realm-marcos/runtime/nimbaria.webp';
import ereboUrl from '@/assets/realm-marcos/runtime/erebo.webp';
import lunarisUrl from '@/assets/realm-marcos/runtime/lunaris.webp';
import coroaUrl from '@/assets/realm-marcos/runtime/coroa.webp';

const SOURCES: Record<string, string> = {
  relicario: relicarioUrl,
  origamia: origamiaUrl,
  leviata: leviataUrl,
  brumavale: brumavaleUrl,
  nimbaria: nimbariaUrl,
  erebo: ereboUrl,
  lunaris: lunarisUrl,
  coroa: coroaUrl,
};

const art = new Map<string, HTMLImageElement>();
for (const [id, src] of Object.entries(SOURCES)) {
  if (typeof Image === 'undefined') continue;
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  art.set(id, image);
}

/** Desenha apenas o asset pronto; o cenário manual abaixo dele continua sendo o fallback. */
export function drawGeneratedRealmArt(c: CanvasRenderingContext2D, id: string, x: number, y: number, size: number, pulse = 1) {
  const image = art.get(id);
  if (!image || !image.complete || image.naturalWidth < 2) return false;
  const ratio = image.naturalHeight / image.naturalWidth || 1;
  const w = size, h = Math.round(size * ratio);
  c.save();
  c.globalAlpha = Math.max(0.72, Math.min(1, pulse));
  c.imageSmoothingEnabled = false;
  c.drawImage(image, Math.round(x - w / 2), Math.round(y - h + 2), w, h);
  c.restore();
  return true;
}

export const generatedRealmArtUrl = (id: string) => SOURCES[id];
