import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";

export interface PixelCharacter {
  id: string;
  name: string;
  franchise: string;
  imageUrl: string;
  hint: string;
}

export const PIXEL_CHARACTERS: readonly PixelCharacter[] = [
  { id: "mario", name: "Mario", franchise: "Super Mario", imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", hint: "Encanador de bigode do Reino dos Cogumelos" },
  { id: "goku", name: "Goku", franchise: "Dragon Ball Z", imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png", hint: "Sayajin protetor da Terra que ama comer" },
  { id: "naruto", name: "Naruto Uzumaki", franchise: "Naruto", imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png", hint: "Ninja da Vila da Folha que deseja ser Hokage" },
  { id: "sonic", name: "Sonic the Hedgehog", franchise: "Sonic", imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png", hint: "Ouriço azul superveloz que coleta anéis dourados" },
  { id: "link", name: "Link", franchise: "The Legend of Zelda", imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", hint: "Herói de túnica verde empunhando a Master Sword" },
  { id: "kratos", name: "Kratos", franchise: "God of War", imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png", hint: "Fantasma de Esparta portador das Lâminas do Caos" },
];

export interface PixelGuessChallenge { id: string }
export interface PixelGuessState { guesses: string[]; finished: boolean; solved: boolean }
export interface PixelGuessPublic {
  characterId: string;
  blurLevel: number;
  hint: string;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  characterList: { id: string; name: string }[];
  answer: PixelCharacter | null;
}
export interface PixelGuessGuess { characterId: string }

const guessSchema = z.object({ characterId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(5),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const pixelGuess: GameModule<PixelGuessChallenge, PixelGuessPublic, PixelGuessState, PixelGuessGuess> = {
  meta: {
    id: "pixel-guess",
    name: "Geek Pixel",
    description: "Descubra quem é o personagem geek antes que a imagem fique nítida.",
    icon: "Sparkles",
    theme: "anime",
    order: 7,
  },

  generateChallenge(seed: string): PixelGuessChallenge {
    return { id: pickDeterministic(PIXEL_CHARACTERS, seed).id };
  },

  initialState(): PixelGuessState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): PixelGuessState { return stateSchema.parse(raw); },
  parseGuess(raw: unknown): PixelGuessGuess { return guessSchema.parse(raw); },

  applyGuess(challenge: PixelGuessChallenge, state: PixelGuessState, guess: PixelGuessGuess): GuessOutcome<PixelGuessState> {
    if (state.finished) return { state, feedback: { correct: state.solved, message: "Encerrado." }, finished: true, solved: state.solved };
    const correct = guess.characterId === challenge.id;
    const guesses = [...state.guesses, guess.characterId];
    const finished = correct || guesses.length >= 5;
    const target = PIXEL_CHARACTERS.find((c) => c.id === challenge.id);
    return {
      state: { guesses, finished, solved: correct },
      feedback: {
        correct,
        message: correct ? `Acertou! É o ${target?.name}.` : finished ? `Fim! Era o ${target?.name}.` : "Incorreto! Imagem ficou um pouco mais nítida.",
      },
      finished,
      solved: correct,
    };
  },

  score(_challenge: PixelGuessChallenge, state: PixelGuessState): number {
    if (!state.solved) return 0;
    return Math.round(1000 * (1 - (state.guesses.length - 1) / 5));
  },

  toPublic(challenge: PixelGuessChallenge, state: PixelGuessState): PixelGuessPublic {
    const target = PIXEL_CHARACTERS.find((c) => c.id === challenge.id) ?? PIXEL_CHARACTERS[0]!;
    const attempts = state.guesses.length;
    const blurLevel = state.finished ? 0 : Math.max(0, 20 - attempts * 4);
    return {
      characterId: target.id,
      blurLevel,
      hint: target.hint,
      guesses: state.guesses.map((id) => {
        const item = PIXEL_CHARACTERS.find((c) => c.id === id);
        return { id, name: item?.name ?? id, correct: id === challenge.id };
      }),
      guessesRemaining: Math.max(0, 5 - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      characterList: PIXEL_CHARACTERS.map((c) => ({ id: c.id, name: `${c.name} (${c.franchise})` })),
      answer: state.finished ? target : null,
    };
  },

  toResult(challenge: PixelGuessChallenge, state: PixelGuessState): GameResult {
    const target = PIXEL_CHARACTERS.find((c) => c.id === challenge.id);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { character: target?.name },
    };
  },
};
