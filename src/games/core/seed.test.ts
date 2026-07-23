import { describe, expect, it } from "vitest";
import { dailySeed, hashSeed, makeRng, pickDeterministic } from "./seed";

describe("hashSeed", () => {
  it("é determinístico", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
  });
  it("difere para entradas diferentes", () => {
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });
});

describe("dailySeed", () => {
  it("é estável para a mesma data+jogo", () => {
    expect(dailySeed("2026-07-23", "mystery-country")).toBe(
      dailySeed("2026-07-23", "mystery-country"),
    );
  });
  it("muda entre dias e entre jogos", () => {
    expect(dailySeed("2026-07-23", "mystery-country")).not.toBe(
      dailySeed("2026-07-24", "mystery-country"),
    );
    expect(dailySeed("2026-07-23", "mystery-country")).not.toBe(
      dailySeed("2026-07-23", "world-pin"),
    );
  });
});

describe("makeRng", () => {
  it("produz a mesma sequência para a mesma seed", () => {
    const a = makeRng(123);
    const b = makeRng(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("gera valores em [0,1)", () => {
    const r = makeRng(999);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("pickDeterministic", () => {
  it("escolhe o mesmo item para a mesma seed", () => {
    const list = ["a", "b", "c", "d"];
    expect(pickDeterministic(list, "x")).toBe(pickDeterministic(list, "x"));
  });
});
