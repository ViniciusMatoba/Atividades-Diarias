import { DAILY_GAME_COUNT } from "./scoring";
import { daysBetweenKeys } from "./dailyKey";

/** Mínimo de jogos concluídos no dia para a jornada "contar" para o streak. */
export const STREAK_MIN_GAMES = 3;

/** Uma jornada conta para o streak se >= STREAK_MIN_GAMES jogos foram concluídos. */
export function journeyCountsForStreak(gamesCompleted: number): boolean {
  return gamesCompleted >= STREAK_MIN_GAMES && gamesCompleted <= DAILY_GAME_COUNT;
}

export interface StreakState {
  current: number;
  longest: number;
  lastCompletedKey: string | null;
}

/**
 * Atualiza o streak quando o usuário conclui a jornada de `todayKey`.
 * - Continua o streak se a última conclusão foi ontem.
 * - Reinicia para 1 se houve lacuna (>1 dia) ou é a primeira vez.
 * - É idempotente: concluir de novo o mesmo dia não altera o streak.
 *
 * Abrir o app sem jogar nunca chama esta função → não mantém streak.
 */
export function applyDailyCompletion(state: StreakState, todayKey: string): StreakState {
  if (state.lastCompletedKey === todayKey) {
    return state; // idempotente
  }

  let current: number;
  if (state.lastCompletedKey === null) {
    current = 1;
  } else {
    const gap = daysBetweenKeys(state.lastCompletedKey, todayKey);
    current = gap === 1 ? state.current + 1 : 1;
  }

  return {
    current,
    longest: Math.max(state.longest, current),
    lastCompletedKey: todayKey,
  };
}

/**
 * Retorna o streak "efetivo" para exibição: se o último dia concluído não foi
 * hoje nem ontem, o streak já está quebrado (mostra 0), mesmo sem nova jogada.
 */
export function effectiveCurrentStreak(state: StreakState, todayKey: string): number {
  if (state.lastCompletedKey === null) return 0;
  const gap = daysBetweenKeys(state.lastCompletedKey, todayKey);
  if (gap <= 0) return state.current; // hoje
  if (gap === 1) return state.current; // ontem, ainda vivo
  return 0; // quebrou
}
