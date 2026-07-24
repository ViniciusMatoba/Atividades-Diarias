import { normalizeGameScore } from "@/lib/scoring";

export const WORLD_PIN_CONFIG = {
  maxGuesses: 6, // tentativas até encerrar
} as const;

export interface LatLon {
  lat: number;
  lon: number;
}

/** Distância em km entre dois pontos (fórmula de haversine). */
export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Pontuação por nº de tentativas (só se acertou o país).
 * Acerto de primeira → 1000; cai a cada tentativa.
 */
export function scoreWorldPin(attempts: number, solved: boolean): number {
  if (!solved) return 0;
  return normalizeGameScore(1000 * (1 - (attempts - 1) / WORLD_PIN_CONFIG.maxGuesses));
}
