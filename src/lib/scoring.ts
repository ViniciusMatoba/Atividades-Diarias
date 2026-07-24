/**
 * Utilitários centrais de pontuação, compartilhados por todos os jogos.
 * Regras específicas de cada jogo vivem em `games/<id>/scoring.ts` e usam estes helpers.
 */

/** Pontuação máxima possível por jogo. */
export const MAX_GAME_SCORE = 1000;

/** Número de jogos na jornada diária. */
export const DAILY_GAME_COUNT = 10;

/** Pontuação máxima possível por dia. */
export const MAX_DAILY_SCORE = MAX_GAME_SCORE * DAILY_GAME_COUNT;

/** Restringe um número ao intervalo [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** Garante que uma pontuação de jogo fique em [0, MAX_GAME_SCORE] e seja inteira. */
export function normalizeGameScore(raw: number): number {
  return Math.round(clamp(raw, 0, MAX_GAME_SCORE));
}
