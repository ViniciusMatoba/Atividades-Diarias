/**
 * Catálogo de conquistas + motor baseado em eventos.
 * Jogos e telas emitem EVENTOS; as regras de conquista ficam aqui, permitindo
 * adicionar conquistas sem alterar cada jogo individualmente.
 */

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: "first-game", name: "Primeiro Passo", description: "Conclua seu primeiro jogo.", icon: "Play" },
  { id: "first-journey", name: "Aventureiro", description: "Conclua sua primeira jornada diária.", icon: "Compass" },
  { id: "three-in-a-day", name: "Trinca", description: "Complete 3 jogos no mesmo dia.", icon: "CheckCheck" },
  { id: "five-in-a-day", name: "Dia Perfeito", description: "Complete os 5 jogos no mesmo dia.", icon: "Star" },
  { id: "streak-7", name: "Semana de Fogo", description: "Alcance 7 dias de streak.", icon: "Flame" },
  { id: "streak-30", name: "Dedicação", description: "Alcance 30 dias de streak.", icon: "CalendarCheck" },
  { id: "score-4000", name: "Mestre do Dia", description: "Obtenha 4.000 pontos em um dia.", icon: "Award" },
  { id: "score-5000", name: "Impecável", description: "Obtenha 5.000 pontos em um dia.", icon: "Crown" },
  { id: "poke-first-try", name: "Sentido Pokémon", description: "Acerte o Pokémon na primeira tentativa.", icon: "Zap" },
  { id: "connections-flawless", name: "Conexão Perfeita", description: "Resolva Geek Connections sem erros.", icon: "Grid3x3" },
  { id: "pin-bullseye", name: "Na Mosca", description: "Acerte uma localização muito próxima no Pin do Mundo.", icon: "Target" },
  { id: "order-perfect", name: "Linha do Tempo", description: "Ordene tudo certo em Quem Veio Primeiro.", icon: "ArrowDownUp" },
];

/** Eventos que o app pode emitir. Novas conquistas leem estes eventos. */
export type AchievementEvent =
  | { type: "game-completed"; gameId: string; score: number; firstTry: boolean; flawless: boolean; bullseye: boolean }
  | { type: "journey-completed"; gamesInDay: number; dayScore: number }
  | { type: "streak-updated"; current: number };

/**
 * Avalia um evento e retorna os ids de conquistas que ele desbloqueia.
 * Puro e testável; o caller persiste (ignorando as já obtidas — unique no banco).
 */
export function evaluateAchievements(event: AchievementEvent): string[] {
  const unlocked: string[] = [];
  switch (event.type) {
    case "game-completed":
      unlocked.push("first-game");
      if (event.firstTry && event.gameId === "poke-guess") unlocked.push("poke-first-try");
      if (event.flawless && event.gameId === "geek-connections") unlocked.push("connections-flawless");
      if (event.bullseye && event.gameId === "world-pin") unlocked.push("pin-bullseye");
      if (event.firstTry && event.gameId === "who-came-first") unlocked.push("order-perfect");
      break;
    case "journey-completed":
      unlocked.push("first-journey");
      if (event.gamesInDay >= 3) unlocked.push("three-in-a-day");
      if (event.gamesInDay >= 5) unlocked.push("five-in-a-day");
      if (event.dayScore >= 4000) unlocked.push("score-4000");
      if (event.dayScore >= 5000) unlocked.push("score-5000");
      break;
    case "streak-updated":
      if (event.current >= 7) unlocked.push("streak-7");
      if (event.current >= 30) unlocked.push("streak-30");
      break;
  }
  return unlocked;
}
