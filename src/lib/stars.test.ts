import { describe, expect, it } from "vitest";
import { scoreToStars, DEFAULT_STAR_THRESHOLDS } from "./stars";

describe("scoreToStars", () => {
  it("dá 1 estrela na faixa baixa (0–399)", () => {
    expect(scoreToStars(0)).toBe(1);
    expect(scoreToStars(399)).toBe(1);
  });

  it("dá 2 estrelas na faixa média (400–749)", () => {
    expect(scoreToStars(400)).toBe(2);
    expect(scoreToStars(749)).toBe(2);
  });

  it("dá 3 estrelas na faixa alta (750–1000)", () => {
    expect(scoreToStars(750)).toBe(3);
    expect(scoreToStars(1000)).toBe(3);
  });

  it("trata os limites exatos dos thresholds", () => {
    expect(scoreToStars(DEFAULT_STAR_THRESHOLDS.two)).toBe(2);
    expect(scoreToStars(DEFAULT_STAR_THRESHOLDS.three)).toBe(3);
  });

  it("faz clamp de valores fora do intervalo", () => {
    expect(scoreToStars(-50)).toBe(1);
    expect(scoreToStars(5000)).toBe(3);
  });

  it("respeita thresholds customizados", () => {
    const custom = { two: 500, three: 900 };
    expect(scoreToStars(499, custom)).toBe(1);
    expect(scoreToStars(500, custom)).toBe(2);
    expect(scoreToStars(900, custom)).toBe(3);
  });
});
