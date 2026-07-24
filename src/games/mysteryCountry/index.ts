import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";
import { COUNTRIES, getCountry, type Country } from "./data/countries";
import { MYSTERY_COUNTRY_SCORING, scoreMysteryCountry } from "./scoring";

// ---- Tipos do jogo ----

export interface MysteryCountryChallenge {
  answerId: string;
}

export type ClueKind = "continent" | "population" | "languages" | "neighbors" | "capital";

export interface Clue {
  kind: ClueKind;
  label: string;
  value: string;
}

export interface MysteryCountryState {
  revealedClues: number; // >= 1
  guesses: string[]; // ids de países tentados, em ordem
  finished: boolean;
  solved: boolean;
}

export interface MysteryCountryPublic {
  clues: Clue[]; // apenas as reveladas
  totalClues: number;
  revealedClues: number;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  /** Revelado somente ao terminar. */
  answer: { id: string; name: string } | null;
}

export interface MysteryCountryGuess {
  countryId: string;
}

// ---- Pistas (ordem: difícil → fácil) ----

function buildClues(country: Country): Clue[] {
  const neighborCount = country.neighbors.length;
  return [
    { kind: "continent", label: "Continente", value: country.continent },
    { kind: "population", label: "População", value: country.populationBucket },
    { kind: "languages", label: "Idioma(s)", value: country.languages.join(", ") },
    {
      kind: "neighbors",
      label: "Países vizinhos",
      value: neighborCount === 0 ? "Nenhum (ilha ou isolado)" : `${neighborCount} vizinho(s)`,
    },
    { kind: "capital", label: "Capital", value: country.capital },
  ];
}

const guessSchema = z.object({
  countryId: z.string().min(1),
});

const stateSchema = z.object({
  revealedClues: z.number().int().min(1).max(10),
  guesses: z.array(z.string().min(1)).max(6),
  finished: z.boolean(),
  solved: z.boolean(),
});

function countWrong(state: MysteryCountryState, answerId: string): number {
  return state.guesses.filter((g) => g !== answerId).length;
}

// ---- Módulo ----

export const mysteryCountry: GameModule<
  MysteryCountryChallenge,
  MysteryCountryPublic,
  MysteryCountryState,
  MysteryCountryGuess
> = {
  meta: {
    id: "mystery-country",
    name: "País Misterioso",
    description: "Descubra o país do dia com pistas progressivas.",
    icon: "Globe2",
    theme: "geo",
    order: 1,
  },

  generateChallenge(seed: string): MysteryCountryChallenge {
    const country = pickDeterministic(COUNTRIES, seed);
    return { answerId: country.id };
  },

  initialState(): MysteryCountryState {
    return { revealedClues: 1, guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): MysteryCountryState {
    return stateSchema.parse(raw);
  },

  parseGuess(raw: unknown): MysteryCountryGuess {
    const parsed = guessSchema.parse(raw);
    if (!getCountry(parsed.countryId)) {
      throw new Error(`País desconhecido: ${parsed.countryId}`);
    }
    return parsed;
  },

  applyGuess(
    challenge: MysteryCountryChallenge,
    state: MysteryCountryState,
    guess: MysteryCountryGuess,
  ): GuessOutcome<MysteryCountryState> {
    if (state.finished) {
      return {
        state,
        feedback: { correct: state.solved, message: "Partida já encerrada." },
        finished: true,
        solved: state.solved,
      };
    }

    const answer = getCountry(challenge.answerId);
    if (!answer) throw new Error(`Desafio inválido: ${challenge.answerId}`);

    const totalClues = buildClues(answer).length;
    const guesses = [...state.guesses, guess.countryId];
    const correct = guess.countryId === challenge.answerId;

    if (correct) {
      const next: MysteryCountryState = {
        ...state,
        guesses,
        finished: true,
        solved: true,
      };
      return {
        state: next,
        feedback: { correct: true, message: `Acertou! É ${answer.name}.` },
        finished: true,
        solved: true,
      };
    }

    const outOfGuesses = guesses.length >= MYSTERY_COUNTRY_SCORING.maxGuesses;
    const revealedClues = Math.min(totalClues, state.revealedClues + 1);
    const next: MysteryCountryState = {
      revealedClues,
      guesses,
      finished: outOfGuesses,
      solved: false,
    };

    return {
      state: next,
      feedback: {
        correct: false,
        message: outOfGuesses
          ? `Fim das tentativas. Era ${answer.name}.`
          : "Não é esse. Nova pista liberada!",
        details: { revealedClues },
      },
      finished: outOfGuesses,
      solved: false,
    };
  },

  score(challenge: MysteryCountryChallenge, state: MysteryCountryState): number {
    return scoreMysteryCountry({
      revealedClues: state.revealedClues,
      wrongGuesses: countWrong(state, challenge.answerId),
      solved: state.solved,
    });
  },

  toPublic(
    challenge: MysteryCountryChallenge,
    state: MysteryCountryState,
  ): MysteryCountryPublic {
    const answer = getCountry(challenge.answerId);
    if (!answer) throw new Error(`Desafio inválido: ${challenge.answerId}`);
    const allClues = buildClues(answer);
    const revealed = allClues.slice(0, state.revealedClues);

    return {
      clues: revealed,
      totalClues: allClues.length,
      revealedClues: state.revealedClues,
      guesses: state.guesses.map((id) => ({
        id,
        name: getCountry(id)?.name ?? id,
        correct: id === challenge.answerId,
      })),
      guessesRemaining: Math.max(0, MYSTERY_COUNTRY_SCORING.maxGuesses - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      answer: state.finished ? { id: answer.id, name: answer.name } : null,
    };
  },

  toResult(challenge: MysteryCountryChallenge, state: MysteryCountryState): GameResult {
    const answer = getCountry(challenge.answerId);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: {
        answerId: challenge.answerId,
        answerName: answer?.name ?? challenge.answerId,
        revealedClues: state.revealedClues,
      },
    };
  },
};
