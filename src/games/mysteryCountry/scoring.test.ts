import { describe, expect, it } from "vitest";
import { scoreMysteryCountry } from "./scoring";

describe("scoreMysteryCountry", () => {
  it("dá 1000 ao acertar de primeira, só com a pista inicial", () => {
    expect(scoreMysteryCountry({ revealedClues: 1, wrongGuesses: 0, solved: true })).toBe(1000);
  });

  it("penaliza pistas extras", () => {
    expect(scoreMysteryCountry({ revealedClues: 3, wrongGuesses: 0, solved: true })).toBe(
      1000 - 2 * 80,
    );
  });

  it("penaliza palpites errados", () => {
    expect(scoreMysteryCountry({ revealedClues: 1, wrongGuesses: 2, solved: true })).toBe(
      1000 - 2 * 60,
    );
  });

  it("combina penalidades de forma aditiva", () => {
    // 6 pistas extras (480) + 6 erros (360) = 840 de penalidade
    expect(scoreMysteryCountry({ revealedClues: 7, wrongGuesses: 6, solved: true })).toBe(160);
  });

  it("faz clamp em 0 quando as penalidades excedem a base", () => {
    expect(scoreMysteryCountry({ revealedClues: 10, wrongGuesses: 6, solved: true })).toBe(0);
  });

  it("dá 0 quando não resolvido", () => {
    expect(scoreMysteryCountry({ revealedClues: 1, wrongGuesses: 0, solved: false })).toBe(0);
  });
});
