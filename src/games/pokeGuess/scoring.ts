import { normalizeGameScore } from "@/lib/scoring";

export const POKE_GUESS_CONFIG = {
  maxGuesses: 8,
  scoreSpread: 8, // N na fórmula
} as const;

/**
 * score = 1000 * max(0, 1 - (tentativas-1)/N), 0 se não acertou.
 * Acerto de primeira → 1000.
 */
export function scorePokeGuess(attempts: number, solved: boolean): number {
  if (!solved) return 0;
  return normalizeGameScore(1000 * (1 - (attempts - 1) / POKE_GUESS_CONFIG.scoreSpread));
}
