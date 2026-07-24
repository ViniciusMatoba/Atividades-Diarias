import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";

export interface WordScrambleItem {
  id: string;
  word: string;
  category: string;
  hint: string;
}

export const SCRAMBLE_WORDS: readonly WordScrambleItem[] = [
  { id: "pikachu", word: "PIKACHU", category: "Pokémon", hint: "Mascote elétrico amarelo de Kanto" },
  { id: "avengers", word: "AVENGERS", category: "Cinema & Marvel", hint: "Os heróis mais poderosos da Terra" },
  { id: "batman", word: "BATMAN", category: "Quadrinhos & DC", hint: "O Cavaleiro das Trevas de Gotham" },
  { id: "minecraft", word: "MINECRAFT", category: "Videogames", hint: "Jogo de construção e sobrevivência em blocos" },
  { id: "matrix", word: "MATRIX", category: "Cinema Sci-Fi", hint: "Filme dos irmãos Wachowski com Neo e Morpheus" },
  { id: "zelda", word: "ZELDA", category: "Videogames", hint: "Princesa de Hyrule na franquia da Nintendo" },
  { id: "nintendo", word: "NINTENDO", category: "Empresas Geek", hint: "Criadora do Mario, Zelda e Pokémon" },
  { id: "starwars", word: "STARWARS", category: "Cinema Épico", hint: "Saga galáctica de Jedis e Siths criada por George Lucas" },
  { id: "hogwarts", word: "HOGWARTS", category: "Literatura & Cinema", hint: "Escola de Magia e Bruxaria de Harry Potter" },
  { id: "cyberpunk", word: "CYBERPUNK", category: "Ficção Científica", hint: "Gênero futurista distópico de neon e implantes" },
];

function scrambleString(str: string, seedStr: string): string {
  const arr = str.split("");
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash += seedStr.charCodeAt(i);
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (hash + i * 7) % (i + 1);
    const temp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = temp;
  }
  
  const result = arr.join("");
  return result === str ? arr.reverse().join("") : result;
}

export interface WordScrambleChallenge { id: string }
export interface WordScrambleState { guesses: string[]; finished: boolean; solved: boolean }
export interface WordScramblePublic {
  scrambled: string;
  category: string;
  hint: string;
  length: number;
  revealedPrefix: string;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  wordList: { id: string; name: string }[];
  answer: WordScrambleItem | null;
}
export interface WordScrambleGuess { word: string }

const guessSchema = z.object({ word: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(5),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const wordScramble: GameModule<WordScrambleChallenge, WordScramblePublic, WordScrambleState, WordScrambleGuess> = {
  meta: {
    id: "word-scramble",
    name: "Anagrama Geek",
    description: "Desembaralhe as letras para descobrir a palavra geek secreta.",
    icon: "Shuffle",
    theme: "geek",
    order: 6,
  },

  generateChallenge(seed: string): WordScrambleChallenge {
    return { id: pickDeterministic(SCRAMBLE_WORDS, seed).id };
  },

  initialState(): WordScrambleState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): WordScrambleState { return stateSchema.parse(raw); },
  parseGuess(raw: unknown): WordScrambleGuess { return guessSchema.parse(raw); },

  applyGuess(challenge: WordScrambleChallenge, state: WordScrambleState, guess: WordScrambleGuess): GuessOutcome<WordScrambleState> {
    if (state.finished) return { state, feedback: { correct: state.solved, message: "Encerrado." }, finished: true, solved: state.solved };
    const target = SCRAMBLE_WORDS.find((w) => w.id === challenge.id);
    const normalizedGuess = guess.word.trim().toUpperCase();
    const correct = normalizedGuess === target?.word.toUpperCase() || guess.word === challenge.id;
    const guesses = [...state.guesses, normalizedGuess];
    const finished = correct || guesses.length >= 5;
    
    return {
      state: { guesses, finished, solved: correct },
      feedback: {
        correct,
        message: correct ? `Parabéns! A palavra era ${target?.word}.` : finished ? `Fim! A palavra era ${target?.word}.` : "Incorreto! Tente desembaralhar novamente.",
      },
      finished,
      solved: correct,
    };
  },

  score(_challenge: WordScrambleChallenge, state: WordScrambleState): number {
    if (!state.solved) return 0;
    return Math.round(1000 * (1 - (state.guesses.length - 1) / 5));
  },

  toPublic(challenge: WordScrambleChallenge, state: WordScrambleState): WordScramblePublic {
    const target = SCRAMBLE_WORDS.find((w) => w.id === challenge.id) ?? SCRAMBLE_WORDS[0]!;
    const scrambled = scrambleString(target.word, challenge.id);
    const attempts = state.guesses.length;
    const revealedPrefix = target.word.slice(0, Math.min(attempts, target.word.length - 1));

    return {
      scrambled,
      category: target.category,
      hint: target.hint,
      length: target.word.length,
      revealedPrefix,
      guesses: state.guesses.map((w) => ({ id: w, name: w, correct: w === target.word })),
      guessesRemaining: Math.max(0, 5 - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      wordList: SCRAMBLE_WORDS.map((w) => ({ id: w.id, name: w.word })),
      answer: state.finished ? target : null,
    };
  },

  toResult(challenge: WordScrambleChallenge, state: WordScrambleState): GameResult {
    const target = SCRAMBLE_WORDS.find((w) => w.id === challenge.id);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { word: target?.word },
    };
  },
};
