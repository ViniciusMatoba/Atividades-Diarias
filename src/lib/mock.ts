/**
 * Dados fictícios para desenvolvimento da UI (Fase 4).
 * Substituíveis por dados reais do banco/servidor sem alterar as telas.
 */
import type { GameId } from "@/games/core/types";
import type { StarRating } from "./stars";

export type JourneyStatus = "not-started" | "in-progress" | "completed";

export interface JourneyCardData {
  gameId: GameId;
  status: JourneyStatus;
  score: number | null;
  stars: StarRating | null;
}

export interface MockUser {
  username: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  totalScore: number;
  gamesCompleted: number;
}

export const MOCK_USER: MockUser = {
  username: "DemoPlayer",
  level: 4,
  xp: 640,
  currentStreak: 5,
  longestStreak: 12,
  totalScore: 18420,
  gamesCompleted: 63,
};

export const MOCK_JOURNEY: JourneyCardData[] = [
  { gameId: "mystery-country", status: "not-started", score: null, stars: null },
  { gameId: "world-pin", status: "not-started", score: null, stars: null },
  { gameId: "poke-guess", status: "completed", score: 820, stars: 3 },
  { gameId: "geek-connections", status: "in-progress", score: null, stars: null },
  { gameId: "who-came-first", status: "completed", score: 560, stars: 2 },
];

export interface RankingRow {
  rank: number;
  username: string;
  score: number;
  isCurrentUser: boolean;
}

export const MOCK_RANKING_DAILY: RankingRow[] = [
  { rank: 1, username: "AshK", score: 4680, isCurrentUser: false },
  { rank: 2, username: "Sabrina", score: 4210, isCurrentUser: false },
  { rank: 3, username: "DemoPlayer", score: 3890, isCurrentUser: true },
  { rank: 4, username: "Misty", score: 3450, isCurrentUser: false },
  { rank: 5, username: "Brock", score: 2980, isCurrentUser: false },
];

export const MOCK_RANKING_WEEKLY: RankingRow[] = [
  { rank: 1, username: "AshK", score: 28640, isCurrentUser: false },
  { rank: 2, username: "DemoPlayer", score: 24310, isCurrentUser: true },
  { rank: 3, username: "Sabrina", score: 22180, isCurrentUser: false },
  { rank: 4, username: "Brock", score: 19870, isCurrentUser: false },
  { rank: 5, username: "Misty", score: 17420, isCurrentUser: false },
];

export const MOCK_UNLOCKED_ACHIEVEMENTS: string[] = ["first-game", "first-journey", "three-in-a-day"];
