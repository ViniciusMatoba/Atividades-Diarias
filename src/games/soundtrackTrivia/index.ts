import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";

export interface SoundtrackItem {
  id: string;
  title: string;
  composer: string;
  franchise: string;
  type: "Jogo" | "Filme" | "Anime";
  hint: string;
}

export const SOUNDTRACKS: readonly SoundtrackItem[] = [
  { id: "star-wars-theme", title: "Main Title", composer: "John Williams", franchise: "Star Wars", type: "Filme", hint: "Fanfarra espacial épica tocada na abertura" },
  { id: "super-mario-theme", title: "Overworld Theme", composer: "Koji Kondo", franchise: "Super Mario Bros", type: "Jogo", hint: "Melodia alegre do 1-1 no NES de 1985" },
  { id: "zelda-lullaby", title: "Zelda's Lullaby", composer: "Koji Kondo", franchise: "The Legend of Zelda", type: "Jogo", hint: "Canção de ninar tocada na Ocarina do Tempo" },
  { id: "harry-potter-hedwig", title: "Hedwig's Theme", composer: "John Williams", franchise: "Harry Potter", type: "Filme", hint: "Tema místico tocado pela celesta" },
  { id: "avengers-theme", title: "The Avengers Theme", composer: "Alan Silvestri", franchise: "Vingadores", type: "Filme", hint: "Tema triumfal dos heróis da Marvel reunidos" },
];

export interface SoundtrackChallenge { id: string }
export interface SoundtrackState { guesses: string[]; finished: boolean; solved: boolean }
export interface SoundtrackPublic {
  composer: string;
  hint: string;
  type: string;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  franchiseList: { id: string; name: string }[];
  answer: SoundtrackItem | null;
}
export interface SoundtrackGuess { franchiseId: string }

const guessSchema = z.object({ franchiseId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(5),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const soundtrackTrivia: GameModule<SoundtrackChallenge, SoundtrackPublic, SoundtrackState, SoundtrackGuess> = {
  meta: {
    id: "soundtrack-trivia",
    name: "Trilha Geek",
    description: "Reconheça o universo geek através de suas trilhas e composições marcantes.",
    icon: "Music",
    theme: "music",
    order: 10,
  },

  generateChallenge(seed: string): SoundtrackChallenge {
    return { id: pickDeterministic(SOUNDTRACKS, seed).id };
  },

  initialState(): SoundtrackState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): SoundtrackState { return stateSchema.parse(raw); },
  parseGuess(raw: unknown): SoundtrackGuess { return guessSchema.parse(raw); },

  applyGuess(challenge: SoundtrackChallenge, state: SoundtrackState, guess: SoundtrackGuess): GuessOutcome<SoundtrackState> {
    if (state.finished) return { state, feedback: { correct: state.solved, message: "Encerrado." }, finished: true, solved: state.solved };
    const correct = guess.franchiseId === challenge.id;
    const guesses = [...state.guesses, guess.franchiseId];
    const finished = correct || guesses.length >= 5;
    const target = SOUNDTRACKS.find((s) => s.id === challenge.id);
    return {
      state: { guesses, finished, solved: correct },
      feedback: {
        correct,
        message: correct ? `Acertou! Trilha de ${target?.franchise}.` : finished ? `Fim! Era a trilha de ${target?.franchise}.` : "Incorreto! Tente outra obra.",
      },
      finished,
      solved: correct,
    };
  },

  score(_challenge: SoundtrackChallenge, state: SoundtrackState): number {
    if (!state.solved) return 0;
    return Math.round(1000 * (1 - (state.guesses.length - 1) / 5));
  },

  toPublic(challenge: SoundtrackChallenge, state: SoundtrackState): SoundtrackPublic {
    const target = SOUNDTRACKS.find((s) => s.id === challenge.id) ?? SOUNDTRACKS[0]!;
    return {
      composer: target.composer,
      hint: target.hint,
      type: target.type,
      guesses: state.guesses.map((id) => {
        const item = SOUNDTRACKS.find((s) => s.id === id);
        return { id, name: item?.franchise ?? id, correct: id === challenge.id };
      }),
      guessesRemaining: Math.max(0, 5 - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      franchiseList: SOUNDTRACKS.map((s) => ({ id: s.id, name: `${s.franchise} (${s.type})` })),
      answer: state.finished ? target : null,
    };
  },

  toResult(challenge: SoundtrackChallenge, state: SoundtrackState): GameResult {
    const target = SOUNDTRACKS.find((s) => s.id === challenge.id);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { franchise: target?.franchise },
    };
  },
};
