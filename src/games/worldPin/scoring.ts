import { normalizeGameScore } from "@/lib/scoring";

export const WORLD_PIN_CONFIG = {
  maxDistanceKm: 5000, // distância na qual o score chega a 0
  bullseyeKm: 300, // "muito próximo" (conquista / considerado resolvido)
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

/** score = 1000 * max(0, 1 - d/Dmax). Clique exato → 1000. */
export function scoreWorldPin(distanceKm: number): number {
  return normalizeGameScore(1000 * (1 - distanceKm / WORLD_PIN_CONFIG.maxDistanceKm));
}
