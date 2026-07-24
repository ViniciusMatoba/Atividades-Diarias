import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";

export interface MovieQuoteItem {
  id: string;
  quote: string;
  movie: string;
  year: number;
  character: string;
  hint: string;
}

export const MOVIE_QUOTES: readonly MovieQuoteItem[] = [
  { id: "star-wars", quote: "Que a Força esteja com você.", movie: "Star Wars: Uma Nova Esperança", year: 1977, character: "Han Solo / Obi-Wan", hint: "Sci-Fi Épico no Espaço" },
  { id: "avengers-endgame", quote: "Eu sou o Homem de Ferro.", movie: "Vingadores: Ultimato", year: 2019, character: "Tony Stark", hint: "Universo Cinematográfico Marvel" },
  { id: "spider-man", quote: "Com grandes poderes vêm grandes responsabilidades.", movie: "Homem-Aranha", year: 2002, character: "Tio Ben", hint: "Herói Aracnídeo de Nova York" },
  { id: "terminator-2", quote: "Hasta la vista, baby.", movie: "O Exterminador do Futuro 2", year: 1991, character: "T-800", hint: "Ciborgue do Futuro de Arnold Schwarzenegger" },
  { id: "lord-of-the-rings", quote: "Você não passará!", movie: "O Senhor dos Anéis: A Sociedade do Anel", year: 2001, character: "Gandalf", hint: "Mago em Khazad-dûm contra o Balrog" },
  { id: "dark-knight", quote: "Por que tão sério?", movie: "Batman: O Cavaleiro das Trevas", year: 2008, character: "Coringa", hint: "Vilão de Gotham interpretado por Heath Ledger" },
  { id: "hunger-games", quote: "Que os jogos comecem e que a sorte esteja sempre a seu favor.", movie: "Jogos Vorazes", year: 2012, character: "Effie Trinket / Katniss", hint: "Distrito 12 e o Capitólio" },
  { id: "jurassic-park", quote: "Bem-vindo ao Jurassic Park.", movie: "Jurassic Park", year: 1993, character: "John Hammond", hint: "Dinos ressuscitados por DNA de âmbar" },
  { id: "lion-king", quote: "Hakuna Matata! É lindo dizer!", movie: "O Rei Leão", year: 1994, character: "Timão e Pumba", hint: "Animação clássica das savanas africanas" },
  { id: "toy-story", quote: "Ao infinito e além!", movie: "Toy Story", year: 1995, character: "Buzz Lightyear", hint: "Brinquedo patrulheiro do espaço" },
];

export interface MovieQuoteChallenge {
  id: string;
}

export interface MovieQuoteState {
  guesses: string[];
  finished: boolean;
  solved: boolean;
}

export interface MovieQuotePublic {
  quote: string;
  year: number;
  hint: string;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  movieList: { id: string; name: string }[];
  answer: MovieQuoteItem | null;
}

export interface MovieQuoteGuess {
  movieId: string;
}

const guessSchema = z.object({ movieId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(6),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const movieQuote: GameModule<MovieQuoteChallenge, MovieQuotePublic, MovieQuoteState, MovieQuoteGuess> = {
  meta: {
    id: "movie-quote",
    name: "CineCitação",
    description: "Adivinhe qual filme ou série disse a frase icônica.",
    icon: "Film",
    theme: "movies",
    order: 6,
  },

  generateChallenge(seed: string): MovieQuoteChallenge {
    return { id: pickDeterministic(MOVIE_QUOTES, seed).id };
  },

  initialState(): MovieQuoteState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): MovieQuoteState {
    return stateSchema.parse(raw);
  },

  parseGuess(raw: unknown): MovieQuoteGuess {
    return guessSchema.parse(raw);
  },

  applyGuess(challenge: MovieQuoteChallenge, state: MovieQuoteState, guess: MovieQuoteGuess): GuessOutcome<MovieQuoteState> {
    if (state.finished) return { state, feedback: { correct: state.solved, message: "Encerrado." }, finished: true, solved: state.solved };
    
    const correct = guess.movieId === challenge.id;
    const guesses = [...state.guesses, guess.movieId];
    const finished = correct || guesses.length >= 6;
    
    const target = MOVIE_QUOTES.find((m) => m.id === challenge.id);
    return {
      state: { guesses, finished, solved: correct },
      feedback: {
        correct,
        message: correct ? `Acertou! Frase de ${target?.movie}.` : finished ? `Fim! Era ${target?.movie}.` : "Incorreto! Tente outro filme.",
      },
      finished,
      solved: correct,
    };
  },

  score(_challenge: MovieQuoteChallenge, state: MovieQuoteState): number {
    if (!state.solved) return 0;
    return Math.round(1000 * (1 - (state.guesses.length - 1) / 6));
  },

  toPublic(challenge: MovieQuoteChallenge, state: MovieQuoteState): MovieQuotePublic {
    const target = MOVIE_QUOTES.find((m) => m.id === challenge.id) ?? MOVIE_QUOTES[0]!;
    return {
      quote: target.quote,
      year: target.year,
      hint: target.hint,
      guesses: state.guesses.map((id) => {
        const item = MOVIE_QUOTES.find((m) => m.id === id);
        return { id, name: item?.movie ?? id, correct: id === challenge.id };
      }),
      guessesRemaining: Math.max(0, 6 - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      movieList: MOVIE_QUOTES.map((m) => ({ id: m.id, name: m.movie })),
      answer: state.finished ? target : null,
    };
  },

  toResult(challenge: MovieQuoteChallenge, state: MovieQuoteState): GameResult {
    const target = MOVIE_QUOTES.find((m) => m.id === challenge.id);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { movie: target?.movie },
    };
  },
};
