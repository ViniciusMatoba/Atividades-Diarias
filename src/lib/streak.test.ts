import { describe, expect, it } from "vitest";
import {
  applyDailyCompletion,
  effectiveCurrentStreak,
  journeyCountsForStreak,
  type StreakState,
} from "./streak";

describe("journeyCountsForStreak", () => {
  it("exige pelo menos 3 jogos", () => {
    expect(journeyCountsForStreak(2)).toBe(false);
    expect(journeyCountsForStreak(3)).toBe(true);
    expect(journeyCountsForStreak(5)).toBe(true);
  });
});

const fresh: StreakState = { current: 0, longest: 0, lastCompletedKey: null };

describe("applyDailyCompletion", () => {
  it("inicia o streak em 1 na primeira conclusão", () => {
    const s = applyDailyCompletion(fresh, "2026-07-23");
    expect(s.current).toBe(1);
    expect(s.longest).toBe(1);
    expect(s.lastCompletedKey).toBe("2026-07-23");
  });

  it("incrementa em dias consecutivos", () => {
    let s = applyDailyCompletion(fresh, "2026-07-23");
    s = applyDailyCompletion(s, "2026-07-24");
    s = applyDailyCompletion(s, "2026-07-25");
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
  });

  it("reinicia após uma lacuna e preserva o recorde", () => {
    let s = applyDailyCompletion(fresh, "2026-07-23");
    s = applyDailyCompletion(s, "2026-07-24"); // current 2
    s = applyDailyCompletion(s, "2026-07-27"); // lacuna -> reinicia
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });

  it("é idempotente no mesmo dia", () => {
    const s1 = applyDailyCompletion(fresh, "2026-07-23");
    const s2 = applyDailyCompletion(s1, "2026-07-23");
    expect(s2).toEqual(s1);
  });
});

describe("effectiveCurrentStreak", () => {
  const state: StreakState = { current: 5, longest: 9, lastCompletedKey: "2026-07-23" };

  it("mantém o streak se concluiu ontem", () => {
    expect(effectiveCurrentStreak(state, "2026-07-24")).toBe(5);
  });

  it("zera se pulou um dia sem jogar", () => {
    expect(effectiveCurrentStreak(state, "2026-07-25")).toBe(0);
  });

  it("mostra 0 quando nunca concluiu", () => {
    expect(effectiveCurrentStreak(fresh, "2026-07-24")).toBe(0);
  });
});
