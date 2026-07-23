import type { JourneyCardData } from "./mock";
import { DAILY_GAME_COUNT, MAX_DAILY_SCORE } from "./scoring";
import { journeyCountsForStreak } from "./streak";

export interface JourneySummary {
  completed: number;
  total: number;
  dayScore: number;
  maxScore: number;
  progress: number; // 0..1 por jogos concluídos
  countsForStreak: boolean;
}

export function summarizeJourney(cards: readonly JourneyCardData[]): JourneySummary {
  const completed = cards.filter((c) => c.status === "completed").length;
  const dayScore = cards.reduce((acc, c) => acc + (c.score ?? 0), 0);
  return {
    completed,
    total: DAILY_GAME_COUNT,
    dayScore,
    maxScore: MAX_DAILY_SCORE,
    progress: completed / DAILY_GAME_COUNT,
    countsForStreak: journeyCountsForStreak(completed),
  };
}
