import { normalizeGameScore } from "@/lib/scoring";

export const WHO_CAME_FIRST_CONFIG = {
  itemCount: 5,
} as const;

/** Nº de pares fora de ordem cronológica (inversões) numa ordenação. */
export function countInversions(order: readonly string[], yearById: ReadonlyMap<string, number>): number {
  let inv = 0;
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      const yi = yearById.get(order[i] as string);
      const yj = yearById.get(order[j] as string);
      if (yi === undefined || yj === undefined) continue;
      if (yi > yj) inv++; // item mais novo colocado antes de um mais antigo
    }
  }
  return inv;
}

/** Máximo de pares possível para n itens. */
export function maxPairs(n: number): number {
  return (n * (n - 1)) / 2;
}

/**
 * Pontuação proporcional à proximidade da ordem correta (não é tudo-ou-nada).
 * Ordem perfeita → 1000; totalmente invertida → 0.
 */
export function scoreWhoCameFirst(order: readonly string[], yearById: ReadonlyMap<string, number>): number {
  const pairs = maxPairs(order.length);
  if (pairs === 0) return 0;
  const inv = countInversions(order, yearById);
  return normalizeGameScore(1000 * (1 - inv / pairs));
}
