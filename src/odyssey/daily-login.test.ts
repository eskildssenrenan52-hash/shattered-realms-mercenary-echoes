import { describe, expect, it } from "vitest";
import { claimDailyLogin, createDailyLoginState, dailyLoginSnapshot, DAILY_REWARDS } from "./daily-login";

describe("check-in diário offline UTC", () => {
  it("começa disponível e primeiro resgate registra o dia UTC informado", () => {
    const initial = createDailyLoginState();
    expect(dailyLoginSnapshot(initial, "2026-11-03").canClaim).toBe(true);
    expect(claimDailyLogin(initial, "2026-11-03")).toMatchObject({
      state: { lastClaimDate: "2026-11-03", streak: 1 }, claimed: true,
      reward: DAILY_REWARDS[0], reason: "claimed",
    });
  });

  it("não concede recompensa nem avança estado num segundo resgate no mesmo dia", () => {
    const first = claimDailyLogin(createDailyLoginState(), "2026-11-03");
    expect(claimDailyLogin(first.state, "2026-11-03")).toMatchObject({
      state: first.state, reward: null, claimed: false, reason: "already-claimed",
    });
    expect(dailyLoginSnapshot(first.state, "2026-11-03").claimedToday).toBe(true);
  });

  it("avança a sequência em dias UTC consecutivos", () => {
    let state = createDailyLoginState();
    for (const [date, streak] of [["2026-11-03", 1], ["2026-11-04", 2], ["2026-11-05", 3]] as const) {
      const result = claimDailyLogin(state, date);
      expect(result.state.streak).toBe(streak);
      state = result.state;
    }
  });

  it("reinicia a sequência após perder mais de um dia", () => {
    const first = claimDailyLogin(createDailyLoginState(), "2026-11-03");
    const afterGap = claimDailyLogin(first.state, "2026-11-05");
    expect(afterGap.state.streak).toBe(1);
    expect(afterGap.reward).toEqual(DAILY_REWARDS[0]);
  });

  it("bloqueia rollback do relógio e preserva o estado", () => {
    const first = claimDailyLogin(createDailyLoginState(), "2026-11-03");
    expect(claimDailyLogin(first.state, "2026-11-02")).toMatchObject({
      state: first.state, reward: null, claimed: false, reason: "clock-rollback",
    });
    expect(dailyLoginSnapshot(first.state, "2026-11-02").clockRollback).toBe(true);
  });

  it("entrega a recompensa especial no sétimo dia consecutivo", () => {
    let state = createDailyLoginState();
    for (let day = 1; day <= 7; day++) {
      const date = `2026-11-${String(day + 2).padStart(2, "0")}`;
      const result = claimDailyLogin(state, date);
      state = result.state;
      if (day === 7) expect(result.reward).toEqual(DAILY_REWARDS[6]);
    }
    expect(state.streak).toBe(7);
  });
});
