import { normalizeGameScore } from "@/lib/scoring";

export const WORLD_PIN_CONFIG = {
  maxGuesses: 6, // tentativas até encerrar
  earthMaxKm: 20015, // metade da circunferência (p/ barra de proximidade)
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

const DIRECTIONS = ["Norte", "Nordeste", "Leste", "Sudeste", "Sul", "Sudoeste", "Oeste", "Noroeste"] as const;
export type CompassDirection = (typeof DIRECTIONS)[number];

/** Direção (rosa dos ventos, 8 pontos) para ir de `from` até `to`. */
export function bearingDirection(from: LatLon, to: LatLon): CompassDirection {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLon = toRad(to.lon - from.lon);
  const y = Math.sin(dLon) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLon);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return DIRECTIONS[Math.round(brng / 45) % 8] as CompassDirection;
}

/** 0..100 — quão perto o palpite está (barra "quente/frio"). */
export function proximityPct(distanceKm: number): number {
  return Math.round(100 * Math.max(0, 1 - distanceKm / WORLD_PIN_CONFIG.earthMaxKm));
}

/**
 * Pontuação por nº de tentativas (só se acertou o país).
 * Acerto de primeira → 1000; cai a cada tentativa.
 */
export function scoreWorldPin(attempts: number, solved: boolean): number {
  if (!solved) return 0;
  return normalizeGameScore(1000 * (1 - (attempts - 1) / WORLD_PIN_CONFIG.maxGuesses));
}
