import { normalizeGameScore } from "@/lib/scoring";

/** Parâmetros de pontuação do País Misterioso. Configuráveis e isolados da UI. */
export const MYSTERY_COUNTRY_SCORING = {
  base: 1000,
  cluePenalty: 80, // por pista revelada além da primeira
  wrongGuessPenalty: 60, // por palpite errado
  maxGuesses: 6,
} as const;

export interface MysteryCountryScoreInput {
  revealedClues: number; // >= 1
  wrongGuesses: number; // palpites errados
  solved: boolean;
}

/**
 * score = base - (pistasExtras * cluePenalty) - (errados * wrongGuessPenalty),
 * restrito a [0, 1000]. Não resolvido → 0.
 */
export function scoreMysteryCountry(input: MysteryCountryScoreInput): number {
  if (!input.solved) return 0;
  const extraClues = Math.max(0, input.revealedClues - 1);
  const raw =
    MYSTERY_COUNTRY_SCORING.base -
    extraClues * MYSTERY_COUNTRY_SCORING.cluePenalty -
    input.wrongGuesses * MYSTERY_COUNTRY_SCORING.wrongGuessPenalty;
  return normalizeGameScore(raw);
}
