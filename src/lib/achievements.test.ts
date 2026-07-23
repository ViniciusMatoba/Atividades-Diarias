import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "./achievements";

describe("evaluateAchievements", () => {
  it("desbloqueia 'first-game' ao concluir qualquer jogo", () => {
    const r = evaluateAchievements({
      type: "game-completed",
      gameId: "mystery-country",
      score: 500,
      firstTry: false,
      flawless: false,
      bullseye: false,
    });
    expect(r).toContain("first-game");
  });

  it("desbloqueia conquista específica de PokéGuess na 1ª tentativa", () => {
    const r = evaluateAchievements({
      type: "game-completed",
      gameId: "poke-guess",
      score: 1000,
      firstTry: true,
      flawless: false,
      bullseye: false,
    });
    expect(r).toContain("poke-first-try");
  });

  it("escala conquistas da jornada por nº de jogos e pontuação", () => {
    const r = evaluateAchievements({ type: "journey-completed", gamesInDay: 5, dayScore: 5000 });
    expect(r).toEqual(
      expect.arrayContaining(["first-journey", "three-in-a-day", "five-in-a-day", "score-4000", "score-5000"]),
    );
  });

  it("dá streak-7 mas não streak-30 aos 7 dias", () => {
    const r = evaluateAchievements({ type: "streak-updated", current: 7 });
    expect(r).toContain("streak-7");
    expect(r).not.toContain("streak-30");
  });
});
