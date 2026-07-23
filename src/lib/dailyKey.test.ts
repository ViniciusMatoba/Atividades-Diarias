import { describe, expect, it } from "vitest";
import { daysBetweenKeys, getDailyKey, getWeekKey, previousKey } from "./dailyKey";

describe("getDailyKey", () => {
  it("formata como YYYY-MM-DD", () => {
    const key = getDailyKey(new Date("2026-07-23T12:00:00Z"), "America/Sao_Paulo");
    expect(key).toBe("2026-07-23");
  });

  it("respeita a virada de meia-noite em America/Sao_Paulo (UTC-3)", () => {
    // 02:30 UTC = 23:30 do dia anterior em São Paulo
    const beforeMidnight = getDailyKey(new Date("2026-07-24T02:30:00Z"), "America/Sao_Paulo");
    expect(beforeMidnight).toBe("2026-07-23");
    // 03:30 UTC = 00:30 já do dia seguinte em São Paulo
    const afterMidnight = getDailyKey(new Date("2026-07-24T03:30:00Z"), "America/Sao_Paulo");
    expect(afterMidnight).toBe("2026-07-24");
  });

  it("muda com o fuso para o mesmo instante", () => {
    const instant = new Date("2026-07-24T02:30:00Z");
    expect(getDailyKey(instant, "America/Sao_Paulo")).toBe("2026-07-23");
    expect(getDailyKey(instant, "UTC")).toBe("2026-07-24");
  });
});

describe("daysBetweenKeys", () => {
  it("conta dias corretamente, inclusive virada de mês", () => {
    expect(daysBetweenKeys("2026-07-23", "2026-07-24")).toBe(1);
    expect(daysBetweenKeys("2026-07-23", "2026-07-23")).toBe(0);
    expect(daysBetweenKeys("2026-07-31", "2026-08-01")).toBe(1);
    expect(daysBetweenKeys("2026-07-24", "2026-07-23")).toBe(-1);
  });
});

describe("previousKey", () => {
  it("retorna o dia anterior, inclusive virada de mês", () => {
    expect(previousKey("2026-07-24")).toBe("2026-07-23");
    expect(previousKey("2026-08-01")).toBe("2026-07-31");
    expect(previousKey("2026-01-01")).toBe("2025-12-31");
  });
});

describe("getWeekKey", () => {
  it("agrupa dias da mesma semana ISO na mesma chave", () => {
    // 2026-07-20 (segunda) a 2026-07-26 (domingo) = mesma semana ISO
    const mon = getWeekKey(new Date("2026-07-20T12:00:00Z"), "UTC");
    const sun = getWeekKey(new Date("2026-07-26T12:00:00Z"), "UTC");
    expect(mon).toBe(sun);
    expect(mon).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("muda de chave ao virar para a próxima segunda-feira", () => {
    const sun = getWeekKey(new Date("2026-07-26T12:00:00Z"), "UTC");
    const nextMon = getWeekKey(new Date("2026-07-27T12:00:00Z"), "UTC");
    expect(sun).not.toBe(nextMon);
  });
});
