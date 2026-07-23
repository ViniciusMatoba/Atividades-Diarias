import { describe, expect, it } from "vitest";
import { levelFromXp, xpForLevel } from "./xp";

describe("xpForLevel", () => {
  it("começa em 0 no nível 1", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(0)).toBe(0);
  });

  it("é monotonicamente crescente", () => {
    let prev = -1;
    for (let l = 1; l <= 20; l++) {
      const v = xpForLevel(l);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("levelFromXp", () => {
  it("retorna nível 1 com 0 XP", () => {
    const p = levelFromXp(0);
    expect(p.level).toBe(1);
    expect(p.progress).toBeGreaterThanOrEqual(0);
  });

  it("sobe de nível ao atingir o piso do próximo", () => {
    const floor2 = xpForLevel(2);
    expect(levelFromXp(floor2).level).toBe(2);
    expect(levelFromXp(floor2 - 1).level).toBe(1);
  });

  it("progress fica em [0,1]", () => {
    for (const xp of [0, 50, 100, 250, 1000, 5000]) {
      const p = levelFromXp(xp);
      expect(p.progress).toBeGreaterThanOrEqual(0);
      expect(p.progress).toBeLessThanOrEqual(1);
    }
  });
});
