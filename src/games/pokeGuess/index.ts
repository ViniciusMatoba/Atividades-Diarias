import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";
import { POKEMON, getPokemon, type Pokemon } from "./data/pokemon";
import { POKE_GUESS_CONFIG, scorePokeGuess } from "./scoring";

// ---- Tipos ----

export interface PokeGuessChallenge {
  answerId: string;
}

export interface PokeGuessState {
  guesses: string[];
  finished: boolean;
  solved: boolean;
}

export type Direction = "eq" | "up" | "down"; // up = a resposta é MAIOR que o palpite

export interface CategoricalCmp<T> {
  value: T;
  match: boolean;
}
export interface NumericCmp {
  value: number;
  dir: Direction;
}

export interface PokeGuessRow {
  id: string;
  name: string;
  type1: CategoricalCmp<string>;
  type2: CategoricalCmp<string | null>;
  color: CategoricalCmp<string>;
  stage: NumericCmp;
  height: NumericCmp;
  weight: NumericCmp;
  correct: boolean;
}

export interface PokeGuessPublic {
  rows: PokeGuessRow[];
  pokemonList: { id: string; name: string; pokedexId: number; generation: number }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  answer: Pokemon | null;
}

export interface PokeGuessGuess {
  pokemonId: string;
}

// ---- Helpers ----

function dir(answer: number, guess: number): Direction {
  if (answer === guess) return "eq";
  return answer > guess ? "up" : "down";
}

function buildRow(answer: Pokemon, guess: Pokemon): PokeGuessRow {
  return {
    id: guess.id,
    name: guess.name,
    type1: { value: guess.type1, match: guess.type1 === answer.type1 },
    type2: { value: guess.type2, match: guess.type2 === answer.type2 },
    color: { value: guess.color, match: guess.color === answer.color },
    stage: { value: guess.stage, dir: dir(answer.stage, guess.stage) },
    height: { value: guess.heightM, dir: dir(answer.heightM, guess.heightM) },
    weight: { value: guess.weightKg, dir: dir(answer.weightKg, guess.weightKg) },
    correct: guess.id === answer.id,
  };
}

const guessSchema = z.object({ pokemonId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(POKE_GUESS_CONFIG.maxGuesses),
  finished: z.boolean(),
  solved: z.boolean(),
});

// ---- Módulo ----

export const pokeGuess: GameModule<PokeGuessChallenge, PokeGuessPublic, PokeGuessState, PokeGuessGuess> = {
  meta: {
    id: "poke-guess",
    name: "PokéGuess",
    description: "Descubra o Pokémon comparando atributos.",
    icon: "Sparkles",
    theme: "pokemon",
    order: 3,
  },

  generateChallenge(seed: string): PokeGuessChallenge {
    return { answerId: pickDeterministic(POKEMON, seed).id };
  },

  initialState(): PokeGuessState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): PokeGuessState {
    return stateSchema.parse(raw);
  },

  parseGuess(raw: unknown): PokeGuessGuess {
    const parsed = guessSchema.parse(raw);
    if (!getPokemon(parsed.pokemonId)) throw new Error(`Pokémon inválido: ${parsed.pokemonId}`);
    return parsed;
  },

  applyGuess(
    challenge: PokeGuessChallenge,
    state: PokeGuessState,
    guess: PokeGuessGuess,
  ): GuessOutcome<PokeGuessState> {
    if (state.finished) {
      return { state, feedback: { correct: state.solved, message: "Partida encerrada." }, finished: true, solved: state.solved };
    }
    const answer = getPokemon(challenge.answerId);
    if (!answer) throw new Error("Desafio inválido.");

    const guesses = [...state.guesses, guess.pokemonId];
    const correct = guess.pokemonId === challenge.answerId;
    if (correct) {
      return {
        state: { guesses, finished: true, solved: true },
        feedback: { correct: true, message: `Acertou! É ${answer.name}.` },
        finished: true,
        solved: true,
      };
    }
    const outOfGuesses = guesses.length >= POKE_GUESS_CONFIG.maxGuesses;
    return {
      state: { guesses, finished: outOfGuesses, solved: false },
      feedback: {
        correct: false,
        message: outOfGuesses ? `Fim! Era ${answer.name}.` : "Não é esse — veja as dicas.",
      },
      finished: outOfGuesses,
      solved: false,
    };
  },

  score(challenge: PokeGuessChallenge, state: PokeGuessState): number {
    return scorePokeGuess(state.guesses.length, state.solved);
  },

  toPublic(challenge: PokeGuessChallenge, state: PokeGuessState): PokeGuessPublic {
    const answer = getPokemon(challenge.answerId);
    if (!answer) throw new Error("Desafio inválido.");
    const rows = state.guesses
      .map((id) => getPokemon(id))
      .filter((p): p is Pokemon => Boolean(p))
      .map((p) => buildRow(answer, p));
    return {
      rows,
      pokemonList: POKEMON.map((p) => ({ id: p.id, name: p.name, pokedexId: p.pokedexId, generation: p.generation })),
      guessesRemaining: Math.max(0, POKE_GUESS_CONFIG.maxGuesses - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      answer: state.finished ? answer : null,
    };
  },

  toResult(challenge: PokeGuessChallenge, state: PokeGuessState): GameResult {
    const answer = getPokemon(challenge.answerId);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { answerId: challenge.answerId, answerName: answer?.name ?? challenge.answerId },
    };
  },
};
