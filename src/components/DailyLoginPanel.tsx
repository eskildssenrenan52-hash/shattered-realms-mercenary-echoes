import { useEffect, useState } from "react";
import { CalendarDays, Check, Clock3, Coins, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dailyLoginSnapshot, type DailyLoginState } from "@/odyssey/daily-login";
import { ITEMS } from "@/odyssey/data";

export interface DailyLoginPanelProps {
  state: DailyLoginState;
  /** Recebe a data UTC do clique; o chamador decide como salvar e aplicar a recompensa. */
  onClaim: (todayUtc: string) => void;
}

const weekdays = ["Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5", "Dia 6", "Dia 7"];

export function DailyLoginPanel({ state, onClaim }: DailyLoginPanelProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 15_000); return () => window.clearInterval(timer); }, []);
  const todayUtc = new Date(now).toISOString().slice(0, 10);
  const snapshot = dailyLoginSnapshot(state, todayUtc);
  const untilReset = Math.max(0, Date.parse(`${todayUtc}T00:00:00.000Z`) + 86_400_000 - now);
  const countdown = `${String(Math.floor(untilReset / 3_600_000)).padStart(2, "0")}:${String(Math.floor((untilReset % 3_600_000) / 60_000)).padStart(2, "0")}:${String(Math.floor((untilReset % 60_000) / 1_000)).padStart(2, "0")}`;

  return <section aria-labelledby="daily-login-title" className="relative overflow-hidden rounded-lg border border-amber-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 text-foreground shadow-xl sm:p-6">
    <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
    <header className="relative mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-md border border-amber-300/30 bg-amber-300/10 text-amber-200"><CalendarDays size={22} aria-hidden="true" /></span>
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">Bônus local · offline</p><h2 id="daily-login-title" className="text-xl font-bold sm:text-2xl">Presente de jornada</h2></div>
      </div>
      <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-right"><span className="block text-xs text-muted-foreground">Sequência</span><strong className="text-lg text-amber-200">{snapshot.streak} {snapshot.streak === 1 ? "dia" : "dias"}</strong></div>
    </header>

    <p className="relative mb-4 text-sm text-slate-300">Um presente por dia UTC, registrado neste aparelho ou save.</p>
    <ol aria-label="Calendário de recompensas de sete dias" className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {snapshot.days.map(({ day, status, reward }) => {
        const active = status === "available";
        const completed = status === "claimed";
        return <li key={day} aria-current={active ? "date" : undefined} className={`min-w-0 rounded-md border p-3 transition-colors ${active ? "border-amber-300/70 bg-amber-300/10 ring-1 ring-amber-300/30" : completed ? "border-emerald-400/30 bg-emerald-400/5" : "border-white/10 bg-black/15 opacity-75"}`}>
          <div className="mb-2 flex items-center justify-between gap-1"><span className="text-xs font-bold uppercase tracking-wider text-slate-300">{weekdays[day - 1]}</span>{completed ? <Check size={15} className="text-emerald-300" aria-label="Resgatado" /> : active ? <Sparkles size={15} className="text-amber-200" aria-label="Disponível" /> : <Clock3 size={14} className="text-slate-500" aria-label="Futuro" />}</div>
          <p className="truncate text-sm font-semibold" title={reward.label}>{reward.label}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-100"><Coins size={13} aria-hidden="true" />{reward.gold} ouro</p>
          <p className="text-xs text-sky-200">{reward.xp} XP</p>
          <p className="mt-1 truncate text-xs text-violet-200" title={`${ITEMS[reward.item]?.name ?? reward.item} ×${reward.qty}`}>+ {ITEMS[reward.item]?.name ?? reward.item} ×{reward.qty}</p>
          <span className="sr-only">{completed ? "Resgatado" : active ? "Disponível para resgate" : "Recompensa futura"}</span>
        </li>;
      })}
    </ol>

    <div className="relative mt-5 flex flex-col gap-3 rounded-md border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex items-start gap-3"><Gift size={20} className="mt-0.5 shrink-0 text-amber-200" aria-hidden="true" /><div><p className="font-semibold">{snapshot.clockRollback ? "Data anterior ao último resgate" : snapshot.claimedToday ? "Presente de hoje já resgatado" : "Seu presente está pronto"}</p><p className="text-sm text-slate-300">{snapshot.clockRollback ? "Ajuste o relógio para a data correta para continuar." : snapshot.claimedToday ? `Volte amanhã · reinicia em ${countdown} UTC.` : `${snapshot.nextReward.gold} ouro · ${snapshot.nextReward.xp} XP · ${ITEMS[snapshot.nextReward.item]?.name ?? snapshot.nextReward.item} ×${snapshot.nextReward.qty}`}</p></div></div>
      <Button type="button" variant="game" className="w-full shrink-0 sm:w-auto" disabled={!snapshot.canClaim} onClick={() => onClaim(new Date().toISOString().slice(0, 10))}>
        <Gift size={16} aria-hidden="true" />{snapshot.canClaim ? "Resgatar presente" : snapshot.clockRollback ? "Resgate indisponível" : "Resgatado hoje"}
      </Button>
    </div>
    <p className="relative mt-3 text-xs leading-relaxed text-slate-400">O registro pertence a este aparelho/save e usa o dia UTC. Sem conta ou servidor, a mudança do relógio do dispositivo não pode ser verificada contra fraude.</p>
  </section>;
}
