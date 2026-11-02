import type { EchoSystemsState } from "./echoes-state";

/** Cada encerramento do ciclo anterior muda de modo previsível o próximo confronto daquele reino. */
export function beyondBossModifiers(state: EchoSystemsState, realmId: string) {
  const cycle = Math.max(0, state.beyond.cycle);
  const previousChoice = state.beyond.history.at(-1)?.choices[realmId];
  const base = Math.min(1.8, cycle * 0.18);
  return {
    hp: 1 + base + (previousChoice === "transform" ? 0.12 : 0),
    atk: 1 + base * 0.42 + (previousChoice === "preserve" ? 0.08 : 0),
    reward: 1 + Math.min(0.5, cycle * 0.08) + (previousChoice === "preserve" ? 0.12 : 0),
  };
}
