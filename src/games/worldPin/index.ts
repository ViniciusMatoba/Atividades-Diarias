import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";
import { PIN_COUNTRIES, getPinCountry } from "./data/pinCountries";
import { haversineKm, scoreWorldPin, WORLD_PIN_CONFIG } from "./scoring";

// ---- Tipos ----

export interface WorldPinChallenge {
  countryId: string;
}

export interface WorldPinState {
  submitted: boolean;
  lat: number | null;
  lon: number | null;
  distanceKm: number | null;
  solved: boolean; // clicou muito perto (bullseye)
}

export interface WorldPinPublic {
  countryName: string;
  submitted: boolean;
  result: {
    guess: { lat: number; lon: number };
    answer: { name: string; lat: number; lon: number; code?: string; curiosity?: string };
    distanceKm: number;
    score: number;
    bullseye: boolean;
  } | null;
}

export interface WorldPinGuess {
  lat: number;
  lon: number;
}

const guessSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});
const stateSchema = z.object({
  submitted: z.boolean(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  distanceKm: z.number().nullable(),
  solved: z.boolean(),
});

// ---- Módulo ----

export const worldPin: GameModule<WorldPinChallenge, WorldPinPublic, WorldPinState, WorldPinGuess> = {
  meta: {
    id: "world-pin",
    name: "Pin do Mundo",
    description: "Aponte no mapa onde fica o país.",
    icon: "MapPin",
    theme: "geo",
    order: 2,
  },

  generateChallenge(seed: string): WorldPinChallenge {
    return { countryId: pickDeterministic(PIN_COUNTRIES, seed).id };
  },

  initialState(): WorldPinState {
    return { submitted: false, lat: null, lon: null, distanceKm: null, solved: false };
  },

  parseState(raw: unknown): WorldPinState {
    return stateSchema.parse(raw);
  },

  parseGuess(raw: unknown): WorldPinGuess {
    return guessSchema.parse(raw);
  },

  applyGuess(
    challenge: WorldPinChallenge,
    state: WorldPinState,
    guess: WorldPinGuess,
  ): GuessOutcome<WorldPinState> {
    if (state.submitted) {
      return { state, feedback: { correct: state.solved, message: "Partida encerrada." }, finished: true, solved: state.solved };
    }
    const answer = getPinCountry(challenge.countryId);
    if (!answer) throw new Error("Desafio inválido.");

    const distanceKm = Math.round(haversineKm(guess, { lat: answer.lat, lon: answer.lon }));
    const bullseye = distanceKm <= WORLD_PIN_CONFIG.bullseyeKm;
    return {
      state: { submitted: true, lat: guess.lat, lon: guess.lon, distanceKm, solved: bullseye },
      feedback: {
        correct: bullseye,
        message: bullseye ? "Na mosca! 🎯" : `A ${distanceKm} km do alvo.`,
        details: { distanceKm, bullseye },
      },
      finished: true,
      solved: bullseye,
    };
  },

  score(challenge: WorldPinChallenge, state: WorldPinState): number {
    if (!state.submitted || state.distanceKm === null) return 0;
    return scoreWorldPin(state.distanceKm);
  },

  toPublic(challenge: WorldPinChallenge, state: WorldPinState): WorldPinPublic {
    const answer = getPinCountry(challenge.countryId);
    if (!answer) throw new Error("Desafio inválido.");
    const result =
      state.submitted && state.lat !== null && state.lon !== null && state.distanceKm !== null
        ? {
            guess: { lat: state.lat, lon: state.lon },
            answer: { name: answer.name, lat: answer.lat, lon: answer.lon, code: answer.code, curiosity: answer.curiosity },
            distanceKm: state.distanceKm,
            score: scoreWorldPin(state.distanceKm),
            bullseye: state.solved,
          }
        : null;
    return { countryName: answer.name, submitted: state.submitted, result };
  },

  toResult(challenge: WorldPinChallenge, state: WorldPinState): GameResult {
    const answer = getPinCountry(challenge.countryId);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.submitted ? 1 : 0,
      summary: { countryId: challenge.countryId, countryName: answer?.name, distanceKm: state.distanceKm },
    };
  },
};
