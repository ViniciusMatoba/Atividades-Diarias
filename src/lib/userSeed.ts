"use client";

/**
 * Retorna uma chave única e persistente para o dispositivo/usuário atual.
 * Garante que a seed do jogo seja ÚNICA para cada jogador no mesmo dia,
 * evitando que jogadores passem a resposta de um dia para o outro.
 */
export function getOrCreateUserSeedId(uid?: string | null): string {
  if (uid && uid.trim().length > 0) return uid;
  if (typeof window === "undefined") return "default-seed";

  const KEY = "geekdaily:v1:user_seed_id";
  try {
    let existing = localStorage.getItem(KEY);
    if (!existing) {
      existing = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(KEY, existing);
    }
    return existing;
  } catch {
    return "anon-fallback";
  }
}
