import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";

export interface EmojiMovieItem {
  id: string;
  emojis: string;
  title: string;
  type: "Filme" | "Jogo" | "Série";
  hint: string;
}

export const EMOJI_MOVIES: readonly EmojiMovieItem[] = [
  { id: "lion-king", emojis: "🦁 👑 🌴", title: "O Rei Leão", type: "Filme", hint: "Animação clássica da Disney" },
  { id: "spider-man", emojis: "🕷️ 👨 🕸️", title: "Homem-Aranha", type: "Filme", hint: "Super-herói aracnídeo da Marvel" },
  { id: "lord-of-rings", emojis: "💍 🌋 🧙‍♂️", title: "O Senhor dos Anéis", type: "Filme", hint: "Trilogia épica na Terra-média" },
  { id: "harry-potter", emojis: "🧙‍♂️ ⚡ 🧹", title: "Harry Potter", type: "Filme", hint: "Escola de Magia de Hogwarts" },
  { id: "ghostbusters", emojis: "👻 🚫 🔫", title: "Os Caça-Fantasmas", type: "Filme", hint: "Clássico dos anos 80 em Nova York" },
  { id: "jurassic-park", emojis: "🦖 🌴 🚙", title: "Jurassic Park", type: "Filme", hint: "Parque dos Dinossauros" },
  { id: "minecraft", emojis: "🧱 🪓 🐷", title: "Minecraft", type: "Jogo", hint: "Jogo dos blocos mais vendido do mundo" },
];

export interface EmojiMovieChallenge { id: string }
export interface EmojiMovieState { guesses: string[]; finished: boolean; solved: boolean }
export interface EmojiMoviePublic {
  emojis: string;
  hint: string;
  type: string;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  titleList: { id: string; name: string }[];
  answer: EmojiMovieItem | null;
}
export interface EmojiMovieGuess { titleId: string }

const guessSchema = z.object({ titleId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(5),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const emojiMovie: GameModule<EmojiMovieChallenge, EmojiMoviePublic, EmojiMovieState, EmojiMovieGuess> = {
  meta: {
    id: "emoji-movie",
    name: "Emoji Cine",
    description: "Decifre o título do filme ou jogo através dos emojis.",
    icon: "Sparkles",
    theme: "movies",
    order: 8,
  },

  generateChallenge(seed: string): EmojiMovieChallenge {
    return { id: pickDeterministic(EMOJI_MOVIES, seed).id };
  },

  initialState(): EmojiMovieState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): EmojiMovieState { return stateSchema.parse(raw); },
  parseGuess(raw: unknown): EmojiMovieGuess { return guessSchema.parse(raw); },

  applyGuess(challenge: EmojiMovieChallenge, state: EmojiMovieState, guess: EmojiMovieGuess): GuessOutcome<EmojiMovieState> {
    if (state.finished) return { state, feedback: { correct: state.solved, message: "Encerrado." }, finished: true, solved: state.solved };
    const correct = guess.titleId === challenge.id;
    const guesses = [...state.guesses, guess.titleId];
    const finished = correct || guesses.length >= 5;
    const target = EMOJI_MOVIES.find((e) => e.id === challenge.id);
    return {
      state: { guesses, finished, solved: correct },
      feedback: {
        correct,
        message: correct ? `Acertou! É ${target?.title}.` : finished ? `Fim! Era ${target?.title}.` : "Incorreto! Tente outro título.",
      },
      finished,
      solved: correct,
    };
  },

  score(_challenge: EmojiMovieChallenge, state: EmojiMovieState): number {
    if (!state.solved) return 0;
    return Math.round(1000 * (1 - (state.guesses.length - 1) / 5));
  },

  toPublic(challenge: EmojiMovieChallenge, state: EmojiMovieState): EmojiMoviePublic {
    const target = EMOJI_MOVIES.find((e) => e.id === challenge.id) ?? EMOJI_MOVIES[0]!;
    return {
      emojis: target.emojis,
      hint: target.hint,
      type: target.type,
      guesses: state.guesses.map((id) => {
        const item = EMOJI_MOVIES.find((e) => e.id === id);
        return { id, name: item?.title ?? id, correct: id === challenge.id };
      }),
      guessesRemaining: Math.max(0, 5 - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      titleList: EMOJI_MOVIES.map((e) => ({ id: e.id, name: `${e.title} (${e.type})` })),
      answer: state.finished ? target : null,
    };
  },

  toResult(challenge: EmojiMovieChallenge, state: EmojiMovieState): GameResult {
    const target = EMOJI_MOVIES.find((e) => e.id === challenge.id);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { title: target?.title },
    };
  },
};
