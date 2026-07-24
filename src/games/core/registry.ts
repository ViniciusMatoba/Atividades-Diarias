import type { AnyGameModule, GameId, GameMeta } from "./types";
import { mysteryCountry } from "../mysteryCountry";
import { whoCameFirst } from "../whoCameFirst";
import { geekConnections } from "../geekConnections";
import { pokeGuess } from "../pokeGuess";
import { worldPin } from "../worldPin";

import { movieQuote } from "../movieQuote";
import { pixelGuess } from "../pixelGuess";
import { emojiMovie } from "../emojiMovie";
import { flagMaster } from "../flagMaster";
import { soundtrackTrivia } from "../soundtrackTrivia";

/**
 * Registry central de módulos de jogo.
 */
const modules: Partial<Record<GameId, AnyGameModule>> = {
  "mystery-country": mysteryCountry,
  "who-came-first": whoCameFirst,
  "geek-connections": geekConnections,
  "poke-guess": pokeGuess,
  "world-pin": worldPin,
  "movie-quote": movieQuote,
  "pixel-guess": pixelGuess,
  "emoji-movie": emojiMovie,
  "flag-master": flagMaster,
  "soundtrack-trivia": soundtrackTrivia,
};

/** Metadados dos 10 jogos (todos jogáveis). */
export const GAME_CATALOG: readonly GameMeta[] = [
  mysteryCountry.meta,
  worldPin.meta,
  pokeGuess.meta,
  geekConnections.meta,
  whoCameFirst.meta,
  movieQuote.meta,
  pixelGuess.meta,
  emojiMovie.meta,
  flagMaster.meta,
  soundtrackTrivia.meta,
];

export function getGameModule(id: GameId): AnyGameModule | undefined {
  return modules[id];
}

export function isPlayable(id: GameId): boolean {
  return modules[id] !== undefined;
}

export function getGameMeta(id: GameId): GameMeta | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
}
