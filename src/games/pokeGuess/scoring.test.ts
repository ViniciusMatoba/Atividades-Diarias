import { describe, expect, it } from "vitest";
import { scorePokeGuess } from "./scoring";

describe("scorePokeGuess", () => {
  it("acerto de primeira → 1000", () => {
    expect(scorePokeGuess(1, true)).toBe(1000);
  });
  it("cai a cada tentativa", () => {
    expect(scorePokeGuess(2, true)).toBe(875);
    expect(scorePokeGuess(8, true)).toBe(125);
  });
  it("não acertou → 0", () => {
    expect(scorePokeGuess(3, false)).toBe(0);
  });
});
