import { MAX_GAME_SCORE } from "./scoring";

export type StarRating = 1 | 2 | 3;

/**
 * Limiares de estrelas: score >= threshold concede aquela quantidade de estrelas.
 * Configurável — trocar aqui altera a classificação em todo o app.
 */
export interface StarThresholds {
  two: number;
  three: number;
}

export const DEFAULT_STAR_THRESHOLDS: StarThresholds = {
  two: 400,
  three: 750,
};

/**
 * Converte uma pontuação (0..1000) em 1, 2 ou 3 estrelas.
 * Padrão: 0–399 → 1★, 400–749 → 2★, 750–1000 → 3★.
 */
export function scoreToStars(
  score: number,
  thresholds: StarThresholds = DEFAULT_STAR_THRESHOLDS,
): StarRating {
  const s = Math.min(Math.max(score, 0), MAX_GAME_SCORE);
  if (s >= thresholds.three) return 3;
  if (s >= thresholds.two) return 2;
  return 1;
}
