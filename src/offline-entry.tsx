import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { OdysseyScreen } from "./routes/odyssey";
import "./styles.css";

class BootBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  override componentDidCatch(error: Error, info: ErrorInfo) { console.error("Falha fatal no jogo offline", error, info); }
  override render() {
    if (this.state.error) return (
      <main className="game-shell boot-error-screen">
        <section className="boot-error-card" role="alert">
          <div className="title-studio-mark">REMULU GAMES · RECUPERAÇÃO</div>
          <h1>O jogo precisa ser recarregado</h1>
          <p>A interface encontrou um erro inesperado. O progresso salvo não foi apagado.</p>
          <code>{this.state.error.message}</code>
          <button type="button" className="game-btn" onClick={() => window.location.reload()}>Recarregar</button>
        </section>
      </main>
    );
    return this.props.children;
  }
}

const mount = document.getElementById("root");
if (!mount) throw new Error("O container do jogo offline não foi encontrado.");
createRoot(mount).render(<BootBoundary><OdysseyScreen /></BootBoundary>);
