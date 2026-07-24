import { normalizeGameScore } from "@/lib/scoring";

export const GEEK_CONNECTIONS_CONFIG = {
  groupCount: 4,
  groupSize: 4,
  maxMistakes: 4,
} as const;

export interface ConnectionsScoreInput {
  solvedGroups: number; // 0..4
  mistakes: number; // 0..4
}

/**
 * score = (gruposCertos/4) * 1000 * fatorErros
 * fatorErros = max(0.4, 1 - erros*0.15)
 * 4 grupos sem erro → 1000.
 */
export function scoreGeekConnections(input: ConnectionsScoreInput): number {
  const groupRatio = input.solvedGroups / GEEK_CONNECTIONS_CONFIG.groupCount;
  const errorFactor = Math.max(0.4, 1 - input.mistakes * 0.15);
  return normalizeGameScore(1000 * groupRatio * errorFactor);
}
