import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { GameIcon } from "@/components/GameIcon";

/** Janela padrão dos dois jogos: cabeçalho fixo, corpo com rolagem e fecha com Esc. */
export function Modal({ title, onClose, children, wide, overlayClassName = "" }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; overlayClassName?: string }) {
  const m = title.match(/^(.*?)\s+[—·]\s+(.*)$/);
  const main = m ? m[1] : title, sub = m ? m[2] : "";
  const lower = title.toLocaleLowerCase();
  const theme = lower.includes("inventário") || lower.includes("arsenal") ? "inventory" : lower.includes("habilidades") ? "skills" : lower.includes("mapa") || lower.includes("atlas") ? "atlas" : lower.includes("missões") || lower.includes("crônica") ? "lore" : lower.includes("grimório") || lower.includes("mana") ? "arcane" : lower.includes("mercen") || lower.includes("companhia") ? "mercenary" : lower.includes("pet") ? "nature" : lower.includes("forja") || lower.includes("alquimia") || lower.includes("mercado") ? "craft" : "default";
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0]!; const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", k, true);
    return () => { window.removeEventListener("keydown", k, true); restoreRef.current?.focus(); };
  }, [onClose]);
  return (
    <div className={`modal-overlay absolute inset-0 flex items-center justify-center p-4 ${overlayClassName}`} onMouseDown={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} data-modal-theme={theme} className={`game-panel modal-content modal-shell w-full ${wide ? "max-w-4xl" : "max-w-3xl"} text-[12px]`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <span className="modal-gem" aria-hidden="true" />
          <div className="modal-titles"><h2 id={titleId} className="modal-title">{main}</h2>{sub && <span className="modal-sub">{sub}</span>}</div>
          <Button ref={closeRef} type="button" variant="game" onClick={onClose} className="modal-close" aria-label="Fechar"><GameIcon name="close" size={26} /></Button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/** Seção com título ornamentado dentro de uma janela. */
export function Section({ title, aside, children, className = "" }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`modal-section ${className}`}>
      <h3 className="modal-section-title"><span>{title}</span>{aside !== undefined && <small>{aside}</small>}</h3>
      {children}
    </section>
  );
}

/** Barra de progresso no estilo do jogo. */
export function Meter({ value, max, tone = "gold" }: { value: number; max: number; tone?: "gold" | "mana" | "life" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return <div className={`modal-meter meter-${tone}`}><div style={{ width: `${pct}%` }} /></div>;
}
