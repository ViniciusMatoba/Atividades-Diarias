import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";
import { PIN_COUNTRIES, getPinCountry } from "./data/pinCountries";
import { haversineKm, scoreWorldPin, WORLD_PIN_CONFIG } from "./scoring";

// ---- Tipos ----
// Mecânica: o pino aparece no local do país-resposta; o jogador ADIVINHA o país.
// A cada erro, revela distância + direção até o país correto.

export interface WorldPinChallenge {
  countryId: string;
}

export interface WorldPinState {
  guesses: string[]; // ids de países tentados
  finished: boolean;
  solved: boolean;
}

export interface WorldPinGuessRow {
  id: string;
  name: string;
  code: string;
  distanceKm: number;
  correct: boolean;
}

export interface WorldPinPublic {
  /** Localização do país-resposta (o pino mostrado no mapa). */
  pin: { lat: number; lon: number };
  guesses: WorldPinGuessRow[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  countryList: { id: string; name: string }[];
  /** Revelado só ao terminar. */
  answer: { name: string; code: string; curiosity: string } | null;
}

export interface WorldPinGuess {
  countryId: string;
}

const guessSchema = z.object({ countryId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(WORLD_PIN_CONFIG.maxGuesses),
  finished: z.boolean(),
  solved: z.boolean(),
});

function rowFor(guessId: string, answerLatLon: { lat: number; lon: number }, answerId: string): WorldPinGuessRow {
  const g = getPinCountry(guessId);
  const correct = guessId === answerId;
  if (!g) {
    return { id: guessId, name: guessId, code: "", distanceKm: 0, correct };
  }
  const distanceKm = Math.round(haversineKm({ lat: g.lat, lon: g.lon }, answerLatLon));
  return { id: guessId, name: g.name, code: g.code, distanceKm, correct };
}

// ---- Módulo ----

export const worldPin: GameModule<WorldPinChallenge, WorldPinPublic, WorldPinState, WorldPinGuess> = {
  meta: {
    id: "world-pin",
    name: "Pin do Mundo",
    description: "Adivinhe o país marcado no mapa.",
    icon: "MapPin",
    theme: "geo",
    order: 2,
  },

  generateChallenge(seed: string): WorldPinChallenge {
    return { countryId: pickDeterministic(PIN_COUNTRIES, seed).id };
  },

  initialState(): WorldPinState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): WorldPinState {
    return stateSchema.parse(raw);
  },

  parseGuess(raw: unknown): WorldPinGuess {
    const parsed = guessSchema.parse(raw);
    if (!getPinCountry(parsed.countryId)) throw new Error(`País inválido: ${parsed.countryId}`);
    return parsed;
  },

  applyGuess(
    challenge: WorldPinChallenge,
    state: WorldPinState,
    guess: WorldPinGuess,
  ): GuessOutcome<WorldPinState> {
    if (state.finished) {
      return { state, feedback: { correct: state.solved, message: "Partida encerrada." }, finished: true, solved: state.solved };
    }
    const answer = getPinCountry(challenge.countryId);
    if (!answer) throw new Error("Desafio inválido.");

    const guesses = [...state.guesses, guess.countryId];
    const correct = guess.countryId === challenge.countryId;
    if (correct) {
      return {
        state: { guesses, finished: true, solved: true },
        feedback: { correct: true, message: `Acertou! É ${answer.name}.` },
        finished: true,
        solved: true,
      };
    }

    const outOfGuesses = guesses.length >= WORLD_PIN_CONFIG.maxGuesses;
    const row = rowFor(guess.countryId, { lat: answer.lat, lon: answer.lon }, challenge.countryId);
    return {
      state: { guesses, finished: outOfGuesses, solved: false },
      feedback: {
        correct: false,
        message: outOfGuesses
          ? `Fim! Era ${answer.name}.`
          : `${row.distanceKm.toLocaleString("pt-BR")} km do país correto.`,
        details: { distanceKm: row.distanceKm },
      },
      finished: outOfGuesses,
      solved: false,
    };
  },

  score(challenge: WorldPinChallenge, state: WorldPinState): number {
    return scoreWorldPin(state.guesses.length, state.solved);
  },

  toPublic(challenge: WorldPinChallenge, state: WorldPinState): WorldPinPublic {
    const answer = getPinCountry(challenge.countryId);
    if (!answer) throw new Error("Desafio inválido.");
    const answerLatLon = { lat: answer.lat, lon: answer.lon };
    return {
      pin: answerLatLon,
      guesses: state.guesses.map((id) => rowFor(id, answerLatLon, challenge.countryId)),
      guessesRemaining: Math.max(0, WORLD_PIN_CONFIG.maxGuesses - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      countryList: PIN_COUNTRIES.map((c) => ({ id: c.id, name: c.name })),
      answer: state.finished ? { name: answer.name, code: answer.code, curiosity: answer.curiosity } : null,
    };
  },

  toResult(challenge: WorldPinChallenge, state: WorldPinState): GameResult {
    const answer = getPinCountry(challenge.countryId);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { countryId: challenge.countryId, countryName: answer?.name },
    };
  },
};
