import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";

export interface FlagCountry {
  id: string;
  name: string;
  code: string;
  continent: string;
}

export const FLAG_COUNTRIES: readonly FlagCountry[] = [
  { id: "brazil", name: "Brasil", code: "br", continent: "América do Sul" },
  { id: "japan", name: "Japão", code: "jp", continent: "Ásia" },
  { id: "france", name: "França", code: "fr", continent: "Europa" },
  { id: "canada", name: "Canadá", code: "ca", continent: "América do Norte" },
  { id: "germany", name: "Alemanha", code: "de", continent: "Europa" },
  { id: "italy", name: "Itália", code: "it", continent: "Europa" },
  { id: "argentina", name: "Argentina", code: "ar", continent: "América do Sul" },
  { id: "australia", name: "Austrália", code: "au", continent: "Oceania" },
  { id: "south-korea", name: "Coreia do Sul", code: "kr", continent: "Ásia" },
  { id: "mexico", name: "México", code: "mx", continent: "América do Norte" },
];

export interface FlagMasterChallenge { id: string }
export interface FlagMasterState { guesses: string[]; finished: boolean; solved: boolean }
export interface FlagMasterPublic {
  flagCode: string;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  countryList: { id: string; name: string }[];
  answer: FlagCountry | null;
}
export interface FlagMasterGuess { countryId: string }

const guessSchema = z.object({ countryId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(5),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const flagMaster: GameModule<FlagMasterChallenge, FlagMasterPublic, FlagMasterState, FlagMasterGuess> = {
  meta: {
    id: "flag-master",
    name: "Mestre das Bandeiras",
    description: "Identifique a qual país pertence a bandeira apresentada.",
    icon: "Globe2",
    theme: "geo",
    order: 9,
  },

  generateChallenge(seed: string): FlagMasterChallenge {
    return { id: pickDeterministic(FLAG_COUNTRIES, seed).id };
  },

  initialState(): FlagMasterState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): FlagMasterState { return stateSchema.parse(raw); },
  parseGuess(raw: unknown): FlagMasterGuess { return guessSchema.parse(raw); },

  applyGuess(challenge: FlagMasterChallenge, state: FlagMasterState, guess: FlagMasterGuess): GuessOutcome<FlagMasterState> {
    if (state.finished) return { state, feedback: { correct: state.solved, message: "Encerrado." }, finished: true, solved: state.solved };
    const correct = guess.countryId === challenge.id;
    const guesses = [...state.guesses, guess.countryId];
    const finished = correct || guesses.length >= 5;
    const target = FLAG_COUNTRIES.find((c) => c.id === challenge.id);
    return {
      state: { guesses, finished, solved: correct },
      feedback: {
        correct,
        message: correct ? `Acertou! É a bandeira de ${target?.name}.` : finished ? `Fim! Era a bandeira de ${target?.name}.` : "Incorreto! Tente outro país.",
      },
      finished,
      solved: correct,
    };
  },

  score(_challenge: FlagMasterChallenge, state: FlagMasterState): number {
    if (!state.solved) return 0;
    return Math.round(1000 * (1 - (state.guesses.length - 1) / 5));
  },

  toPublic(challenge: FlagMasterChallenge, state: FlagMasterState): FlagMasterPublic {
    const target = FLAG_COUNTRIES.find((c) => c.id === challenge.id) ?? FLAG_COUNTRIES[0]!;
    return {
      flagCode: target.code,
      guesses: state.guesses.map((id) => {
        const item = FLAG_COUNTRIES.find((c) => c.id === id);
        return { id, name: item?.name ?? id, correct: id === challenge.id };
      }),
      guessesRemaining: Math.max(0, 5 - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      countryList: FLAG_COUNTRIES.map((c) => ({ id: c.id, name: c.name })),
      answer: state.finished ? target : null,
    };
  },

  toResult(challenge: FlagMasterChallenge, state: FlagMasterState): GameResult {
    const target = FLAG_COUNTRIES.find((c) => c.id === challenge.id);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { country: target?.name },
    };
  },
};
