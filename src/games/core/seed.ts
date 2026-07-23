/**
 * Geração de seed determinística e PRNG para desafios diários.
 * A mesma (dailyKey, gameId) sempre produz a mesma seed → todos os usuários
 * recebem o mesmo desafio, de forma reproduzível.
 */

/** Hash FNV-1a de 32 bits (estável entre ambientes, sem dependências). */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Seed textual para um jogo num dado dia. */
export function dailySeed(dailyKey: string, gameId: string): string {
  return `${dailyKey}:${gameId}:${hashSeed(`${dailyKey}|${gameId}`)}`;
}

/** PRNG mulberry32 determinístico a partir de uma seed numérica. */
export function makeRng(seedNum: number): () => number {
  let a = seedNum >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escolhe um item de forma determinística a partir de uma seed textual. */
export function pickDeterministic<T>(items: readonly T[], seed: string): T {
  if (items.length === 0) throw new Error("pickDeterministic: lista vazia");
  const idx = hashSeed(seed) % items.length;
  // idx está em [0, length) → acesso seguro
  return items[idx] as T;
}
