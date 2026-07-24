import { describe, expect, it } from "vitest";
import { countInversions, maxPairs, scoreWhoCameFirst } from "./scoring";

const years = new Map<string, number>([
  ["a", 1980],
  ["b", 1990],
  ["c", 2000],
  ["d", 2010],
]);

describe("countInversions", () => {
  it("é 0 para ordem cronológica correta", () => {
    expect(countInversions(["a", "b", "c", "d"], years)).toBe(0);
  });
  it("conta pares invertidos", () => {
    expect(countInversions(["b", "a", "c", "d"], years)).toBe(1);
    expect(countInversions(["d", "c", "b", "a"], years)).toBe(maxPairs(4));
  });
});

describe("scoreWhoCameFirst", () => {
  it("dá 1000 para ordem perfeita", () => {
    expect(scoreWhoCameFirst(["a", "b", "c", "d"], years)).toBe(1000);
  });
  it("dá 0 para ordem totalmente invertida", () => {
    expect(scoreWhoCameFirst(["d", "c", "b", "a"], years)).toBe(0);
  });
  it("pontua proporcionalmente para ordem parcial", () => {
    // 1 inversão de 6 pares → 1000 * (1 - 1/6) ≈ 833
    expect(scoreWhoCameFirst(["b", "a", "c", "d"], years)).toBe(833);
  });
});
