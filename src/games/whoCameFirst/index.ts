import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { hashSeed, makeRng } from "@/games/core/seed";
import { ITEMS, getItem } from "./data/items";
import { scoreWhoCameFirst, WHO_CAME_FIRST_CONFIG } from "./scoring";

// ---- Tipos ----

export interface WhoCameFirstChallenge {
  itemIds: string[]; // itens selecionados do dia
  presented: string[]; // ordem embaralhada mostrada ao jogador
}

export interface WhoCameFirstState {
  order: string[]; // ordenação atual/enviada
  submitted: boolean;
  solved: boolean;
}

export interface WhoCameFirstPublic {
  items: { id: string; label: string; category?: string }[];
  submitted: boolean;
  solved: boolean;
  /** Revelado só após enviar: ordem correta com anos + a ordem do jogador. */
  reveal: {
    correct: { id: string; label: string; year: number; creator?: string; curiosity?: string }[];
    playerOrder: string[];
  } | null;
}

export interface WhoCameFirstGuess {
  order: string[];
}

// ---- Helpers ----

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

function yearMap(itemIds: readonly string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const id of itemIds) {
    const item = getItem(id);
    if (item) m.set(id, item.year);
  }
  return m;
}

const guessSchema = z.object({ order: z.array(z.string().min(1)) });
const stateSchema = z.object({
  order: z.array(z.string().min(1)),
  submitted: z.boolean(),
  solved: z.boolean(),
});

// ---- Módulo ----

export const whoCameFirst: GameModule<
  WhoCameFirstChallenge,
  WhoCameFirstPublic,
  WhoCameFirstState,
  WhoCameFirstGuess
> = {
  meta: {
    id: "who-came-first",
    name: "Quem Veio Primeiro?",
    description: "Ordene os itens do mais antigo ao mais recente.",
    icon: "ArrowDownUp",
    theme: "movies",
    order: 5,
  },

  generateChallenge(seed: string): WhoCameFirstChallenge {
    const rng = makeRng(hashSeed(seed));
    const selected = shuffle(ITEMS, rng)
      .slice(0, WHO_CAME_FIRST_CONFIG.itemCount)
      .map((i) => i.id);
    let presented = shuffle(selected, rng);
    // Evita apresentar já na ordem cronológica correta.
    const correct = [...selected].sort((a, b) => (getItem(a)?.year ?? 0) - (getItem(b)?.year ?? 0));
    if (presented.every((id, idx) => id === correct[idx]) && presented.length > 1) {
      presented = [...presented].reverse();
    }
    return { itemIds: selected, presented };
  },

  initialState(challenge: WhoCameFirstChallenge): WhoCameFirstState {
    return { order: [...challenge.presented], submitted: false, solved: false };
  },

  parseState(raw: unknown): WhoCameFirstState {
    return stateSchema.parse(raw);
  },

  parseGuess(raw: unknown): WhoCameFirstGuess {
    return guessSchema.parse(raw);
  },

  applyGuess(
    challenge: WhoCameFirstChallenge,
    state: WhoCameFirstState,
    guess: WhoCameFirstGuess,
  ): GuessOutcome<WhoCameFirstState> {
    if (state.submitted) {
      return {
        state,
        feedback: { correct: state.solved, message: "Partida já encerrada." },
        finished: true,
        solved: state.solved,
      };
    }

    // O palpite deve ser uma permutação exata dos itens do desafio.
    const expected = [...challenge.itemIds].sort();
    const got = [...guess.order].sort();
    const isPermutation =
      expected.length === got.length && expected.every((id, i) => id === got[i]);
    if (!isPermutation) {
      throw new Error("Ordenação inválida: itens não correspondem ao desafio.");
    }

    const years = yearMap(challenge.itemIds);
    const solved =
      scoreWhoCameFirst(guess.order, years) === 1000; // ordem perfeita
    const next: WhoCameFirstState = { order: [...guess.order], submitted: true, solved };
    return {
      state: next,
      feedback: {
        correct: solved,
        message: solved ? "Ordem perfeita! 🎉" : "Enviado! Veja a ordem correta.",
      },
      finished: true,
      solved,
    };
  },

  score(challenge: WhoCameFirstChallenge, state: WhoCameFirstState): number {
    if (!state.submitted) return 0;
    return scoreWhoCameFirst(state.order, yearMap(challenge.itemIds));
  },

  toPublic(challenge: WhoCameFirstChallenge, state: WhoCameFirstState): WhoCameFirstPublic {
    const items = challenge.presented.map((id) => ({
      id,
      label: getItem(id)?.label ?? id,
      category: getItem(id)?.category,
    }));
    const reveal = state.submitted
      ? {
          correct: [...challenge.itemIds]
            .sort((a, b) => (getItem(a)?.year ?? 0) - (getItem(b)?.year ?? 0))
            .map((id) => {
              const item = getItem(id);
              return {
                id,
                label: item?.label ?? id,
                year: item?.year ?? 0,
                creator: item?.creator,
                curiosity: item?.curiosity,
              };
            }),
          playerOrder: state.order,
        }
      : null;
    return { items, submitted: state.submitted, solved: state.solved, reveal };
  },

  toResult(challenge: WhoCameFirstChallenge, state: WhoCameFirstState): GameResult {
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.submitted ? 1 : 0,
      summary: { order: state.order },
    };
  },
};
