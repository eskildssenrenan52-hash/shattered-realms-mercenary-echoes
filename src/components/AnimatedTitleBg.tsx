import { useEffect, useRef } from "react";
import sheet from "@/assets/intro/title-sheet.jpg";

// 50 quadros (10×5) gerados por IA numa única imagem. A ordem segue o brilho da Árvore,
// tocada em vai-e-volta para a luz crescer e diminuir num ciclo suave.
const COLS = 10, ROWS = 5;
const ORDER = [20, 41, 21, 49, 40, 29, 30, 46, 42, 31, 45, 10, 43, 38, 0, 1, 2, 39, 48, 28, 36, 37, 11, 22, 27, 18, 32, 19, 26, 12, 8, 13, 47, 6, 23, 3, 16, 35, 9, 17, 7, 4, 33, 5, 25, 15, 44, 14, 24, 34];
const LOOP = [...ORDER, ...ORDER.slice(1, -1).reverse()];
const FPS = 10;
const INSET = 3; // evita mostrar a borda do quadro vizinho

export function AnimatedTitleBg({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const img = new Image(); img.src = sheet;
    let f = 0, id = 0;
    const draw = () => {
      if (!img.complete || !img.naturalWidth) return;
      const W = cv.clientWidth, H = cv.clientHeight;
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const cw = img.naturalWidth / COLS, ch = img.naturalHeight / ROWS;
      const i = LOOP[f]!, sx = (i % COLS) * cw + INSET, sy = Math.floor(i / COLS) * ch + INSET;
      const sw = cw - INSET * 2, sh = ch - INSET * 2;
      // fundo: o quadro ampliado e desfocado; frente: o quadro inteiro, sem cortar, nítido
      const cover = Math.max(W / sw, H / sh), cw2 = sw * cover, ch2 = sh * cover;
      ctx.filter = "blur(14px) brightness(0.7)";
      ctx.drawImage(img, sx, sy, sw, sh, (W - cw2) / 2, (H - ch2) / 2, cw2, ch2);
      ctx.filter = "none";
      const fit = Math.min(W / sw, (H * 0.9) / sh) , dw = sw * fit, dh = sh * fit;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, sx, sy, sw, sh, (W - dw) / 2, (H - dh) / 2, dw, dh);
    };
    img.onload = draw;
    id = window.setInterval(() => { f = (f + 1) % LOOP.length; draw(); }, 1000 / FPS);
    return () => window.clearInterval(id);
  }, []);
  return <canvas ref={ref} className={className} role="img" aria-label="A Árvore de Mana brilhando ao pôr do sol, com o herói do arco dourado no penhasco" />;
}
