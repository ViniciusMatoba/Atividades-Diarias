/**
 * Curva de experiência / nível. Configurável e isolada da UI.
 * MVP: apenas um nível geral da conta.
 *
 * Curva: XP acumulado necessário para alcançar o nível L é `BASE * (L-1)^EXP`.
 * Level 1 começa em 0 XP.
 */
export interface XpCurveConfig {
  base: number;
  exponent: number;
}

export const DEFAULT_XP_CURVE: XpCurveConfig = {
  base: 100,
  exponent: 1.5,
};

/** XP total acumulado necessário para atingir o início de `level` (>=1). */
export function xpForLevel(level: number, cfg: XpCurveConfig = DEFAULT_XP_CURVE): number {
  if (level <= 1) return 0;
  return Math.round(cfg.base * Math.pow(level - 1, cfg.exponent));
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number; // 0..1
}

/** Dado um XP total, retorna o nível atual e o progresso rumo ao próximo. */
export function levelFromXp(totalXp: number, cfg: XpCurveConfig = DEFAULT_XP_CURVE): LevelProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  while (xpForLevel(level + 1, cfg) <= xp) {
    level += 1;
  }
  const currentFloor = xpForLevel(level, cfg);
  const nextFloor = xpForLevel(level + 1, cfg);
  const span = nextFloor - currentFloor;
  const xpIntoLevel = xp - currentFloor;
  return {
    level,
    xpIntoLevel,
    xpForNextLevel: span,
    progress: span > 0 ? xpIntoLevel / span : 0,
  };
}
