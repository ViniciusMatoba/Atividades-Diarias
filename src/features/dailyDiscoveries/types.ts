import type { Pokemon } from "@/games/pokeGuess/data/pokemon";
import type { Country } from "@/games/mysteryCountry/data/countries";

export type DailyDiscoveryType = "pokemon" | "country" | "movie" | "series";

export interface MovieSeries {
  id: string;
  type: "movie" | "series";
  title: string;
  year: number;
  genres: string[];
  directorOrCreator: string;
  studio: string;
  durationOrSeasons: string;
  ratingAge?: string;
  synopsis: string;
  whyToWatch: string;
  productionTrivia: string;
  culturalImpact: string;
  imageUrl?: string;
}

export interface PokemonTeaser {
  type1: string;
  generation: number;
  heightApprox: string;
  clueText: string;
}

export interface CountryTeaser {
  continent: string;
  languages: string[];
  clueText: string;
  scrambledCapital?: string;
}

export interface MovieSeriesTeaser {
  year: number;
  genres: string[];
  directorOrCreator: string;
  clueText: string;
}

export interface DailyDiscoveryBase {
  id: string; // ex: "2026-07-24:pokemon"
  dateKey: string; // YYYY-MM-DD
  title: string;
}

export type DailyDiscovery =
  | (DailyDiscoveryBase & { type: "pokemon"; contentId: string; content: Pokemon; teaser: PokemonTeaser })
  | (DailyDiscoveryBase & { type: "country"; contentId: string; content: Country; teaser: CountryTeaser })
  | (DailyDiscoveryBase & { type: "movie" | "series"; contentId: string; content: MovieSeries; teaser: MovieSeriesTeaser });

export interface UserDiscoveryState {
  discoveryId: string; // ex: "2026-07-24:pokemon"
  dateKey: string;
  type: DailyDiscoveryType;
  contentId: string;
  viewedAt?: string;
  revealedAt?: string;
  userGuess?: string;
  isCorrect?: boolean;
  isFavorite?: boolean;
  inWatchlist?: boolean;
}
