import { describe, expect, it } from "vitest";
import { mysteryCountry, type MysteryCountryState } from "./index";
import { COUNTRIES } from "./data/countries";

const seed = "2026-07-23:mystery-country";

function freshChallenge() {
  return mysteryCountry.generateChallenge(seed);
}

describe("mysteryCountry.generateChallenge", () => {
  it("é determinístico para a mesma seed", () => {
    expect(mysteryCountry.generateChallenge(seed).answerId).toBe(
      mysteryCountry.generateChallenge(seed).answerId,
    );
  });

  it("sempre escolhe um país existente na base", () => {
    const ids = COUNTRIES.map((c) => c.id);
    for (const s of ["a", "b", "c", "2026-01-01", "2026-12-31"]) {
      expect(ids).toContain(mysteryCountry.generateChallenge(s).answerId);
    }
  });
});

describe("mysteryCountry.applyGuess", () => {
  it("acerto de primeira → resolvido, 1000 pontos, não muta o estado original", () => {
    const challenge = freshChallenge();
    const state = mysteryCountry.initialState(challenge);
    const out = mysteryCountry.applyGuess(challenge, state, { countryId: challenge.answerId });

    expect(out.solved).toBe(true);
    expect(out.finished).toBe(true);
    expect(mysteryCountry.score(challenge, out.state)).toBe(1000);
    // imutabilidade
    expect(state.finished).toBe(false);
    expect(state.guesses).toHaveLength(0);
  });

  it("palpite errado libera nova pista e não encerra antes das 6 tentativas", () => {
    const challenge = freshChallenge();
    const wrong = COUNTRIES.find((c) => c.id !== challenge.answerId)!.id;
    const state = mysteryCountry.initialState(challenge);
    const out = mysteryCountry.applyGuess(challenge, state, { countryId: wrong });

    expect(out.solved).toBe(false);
    expect(out.finished).toBe(false);
    expect(out.state.revealedClues).toBe(2);
    expect(out.state.guesses).toEqual([wrong]);
  });

  it("encerra sem solução após 6 palpites errados e pontua 0", () => {
    const challenge = freshChallenge();
    const wrong = COUNTRIES.find((c) => c.id !== challenge.answerId)!.id;
    let state: MysteryCountryState = mysteryCountry.initialState(challenge);
    for (let i = 0; i < 6; i++) {
      state = mysteryCountry.applyGuess(challenge, state, { countryId: wrong }).state;
    }
    expect(state.finished).toBe(true);
    expect(state.solved).toBe(false);
    expect(mysteryCountry.score(challenge, state)).toBe(0);
  });

  it("penaliza tentativas erradas antes do acerto", () => {
    const challenge = freshChallenge();
    const wrong = COUNTRIES.find((c) => c.id !== challenge.answerId)!.id;
    let state: MysteryCountryState = mysteryCountry.initialState(challenge);
    state = mysteryCountry.applyGuess(challenge, state, { countryId: wrong }).state;
    state = mysteryCountry.applyGuess(challenge, state, { countryId: challenge.answerId }).state;
    // 1 pista extra revelada pelo erro (80) + 1 palpite errado (60)
    expect(mysteryCountry.score(challenge, state)).toBe(1000 - 80 - 60);
  });

  it("não altera partida já encerrada (idempotência)", () => {
    const challenge = freshChallenge();
    const state = mysteryCountry.initialState(challenge);
    const solved = mysteryCountry.applyGuess(challenge, state, {
      countryId: challenge.answerId,
    }).state;
    const again = mysteryCountry.applyGuess(challenge, solved, { countryId: challenge.answerId });
    expect(again.state).toEqual(solved);
  });
});

describe("mysteryCountry.toPublic", () => {
  it("não revela a resposta enquanto a partida não termina", () => {
    const challenge = freshChallenge();
    const state = mysteryCountry.initialState(challenge);
    const pub = mysteryCountry.toPublic(challenge, state);
    expect(pub.answer).toBeNull();
    expect(pub.clues).toHaveLength(1); // só a pista inicial
    expect(pub.guessesRemaining).toBe(6);
  });

  it("revela a resposta ao terminar", () => {
    const challenge = freshChallenge();
    const state = mysteryCountry.initialState(challenge);
    const solved = mysteryCountry.applyGuess(challenge, state, {
      countryId: challenge.answerId,
    }).state;
    const pub = mysteryCountry.toPublic(challenge, solved);
    expect(pub.answer?.id).toBe(challenge.answerId);
  });
});

describe("mysteryCountry.parseGuess", () => {
  it("rejeita país inexistente", () => {
    expect(() => mysteryCountry.parseGuess({ countryId: "narnia" })).toThrow();
  });
  it("rejeita payload malformado", () => {
    expect(() => mysteryCountry.parseGuess({})).toThrow();
    expect(() => mysteryCountry.parseGuess({ countryId: 123 })).toThrow();
  });
});
