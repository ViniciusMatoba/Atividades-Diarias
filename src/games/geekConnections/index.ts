import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { hashSeed, makeRng } from "@/games/core/seed";
import { CONNECTION_GROUPS } from "./data/groups";
import { GEEK_CONNECTIONS_CONFIG, scoreGeekConnections } from "./scoring";

// ---- Tipos ----

export interface GeekConnectionsChallenge {
  /** 4 grupos do dia (com ids OPACOS de termo — nunca revelam o agrupamento). */
  groups: { theme: string; termIds: string[] }[];
  termLabels: Record<string, string>;
  presented: string[]; // 16 ids embaralhados
}

export interface GeekConnectionsState {
  solvedGroups: number[]; // índices (em challenge.groups) já formados
  mistakes: number;
  finished: boolean;
  solved: boolean; // ganhou (4 grupos)
}

export interface TermView {
  id: string;
  label: string;
}
export interface SolvedGroupView {
  theme: string;
  terms: TermView[];
}

export interface GeekConnectionsPublic {
  remaining: TermView[]; // termos ainda não agrupados (para seleção)
  solved: SolvedGroupView[]; // grupos já formados
  mistakes: number;
  mistakesRemaining: number;
  finished: boolean;
  won: boolean;
  reveal: SolvedGroupView[] | null; // todos os grupos, ao terminar
}

export interface GeekConnectionsGuess {
  terms: string[];
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

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

const guessSchema = z.object({ terms: z.array(z.string().min(1)).length(GEEK_CONNECTIONS_CONFIG.groupSize) });
const stateSchema = z.object({
  solvedGroups: z.array(z.number().int().min(0).max(3)).max(4),
  mistakes: z.number().int().min(0).max(GEEK_CONNECTIONS_CONFIG.maxMistakes),
  finished: z.boolean(),
  solved: z.boolean(),
});

function termView(challenge: GeekConnectionsChallenge, id: string): TermView {
  return { id, label: challenge.termLabels[id] ?? id };
}

function groupView(challenge: GeekConnectionsChallenge, gi: number): SolvedGroupView {
  const g = challenge.groups[gi]!;
  return { theme: g.theme, terms: g.termIds.map((id) => termView(challenge, id)) };
}

// ---- Módulo ----

export const geekConnections: GameModule<
  GeekConnectionsChallenge,
  GeekConnectionsPublic,
  GeekConnectionsState,
  GeekConnectionsGuess
> = {
  meta: {
    id: "geek-connections",
    name: "Geek Connections",
    description: "Agrupe 16 termos em 4 conexões.",
    icon: "Grid3x3",
    theme: "geek",
    order: 4,
  },

  generateChallenge(seed: string): GeekConnectionsChallenge {
    const rng = makeRng(hashSeed(seed));
    const chosen = shuffle(CONNECTION_GROUPS, rng).slice(0, GEEK_CONNECTIONS_CONFIG.groupCount);

    // Monta 16 entradas (label, grupo) e embaralha; atribui ids opacos t0..t15.
    const entries = shuffle(
      chosen.flatMap((g, gi) => g.terms.map((label) => ({ label, gi }))),
      rng,
    );
    const termLabels: Record<string, string> = {};
    const presented: string[] = [];
    const groupTermIds: string[][] = chosen.map(() => []);
    entries.forEach((e, idx) => {
      const id = `t${idx}`;
      termLabels[id] = e.label;
      presented.push(id);
      groupTermIds[e.gi]!.push(id);
    });

    return {
      groups: chosen.map((g, gi) => ({ theme: g.theme, termIds: groupTermIds[gi]! })),
      termLabels,
      presented,
    };
  },

  initialState(): GeekConnectionsState {
    return { solvedGroups: [], mistakes: 0, finished: false, solved: false };
  },

  parseState(raw: unknown): GeekConnectionsState {
    return stateSchema.parse(raw);
  },

  parseGuess(raw: unknown): GeekConnectionsGuess {
    return guessSchema.parse(raw);
  },

  applyGuess(
    challenge: GeekConnectionsChallenge,
    state: GeekConnectionsState,
    guess: GeekConnectionsGuess,
  ): GuessOutcome<GeekConnectionsState> {
    if (state.finished) {
      return { state, feedback: { correct: state.solved, message: "Partida encerrada." }, finished: true, solved: state.solved };
    }
    // Termos precisam existir e não estar já resolvidos.
    const solvedTermIds = new Set(state.solvedGroups.flatMap((gi) => challenge.groups[gi]!.termIds));
    for (const id of guess.terms) {
      if (!(id in challenge.termLabels)) throw new Error(`Termo inválido: ${id}`);
      if (solvedTermIds.has(id)) throw new Error("Termo já agrupado.");
    }
    if (new Set(guess.terms).size !== guess.terms.length) throw new Error("Termos repetidos.");

    const matchGi = challenge.groups.findIndex(
      (g, gi) => !state.solvedGroups.includes(gi) && sameSet(g.termIds, guess.terms),
    );

    if (matchGi >= 0) {
      const solvedGroups = [...state.solvedGroups, matchGi];
      const won = solvedGroups.length === GEEK_CONNECTIONS_CONFIG.groupCount;
      return {
        state: { ...state, solvedGroups, finished: won, solved: won },
        feedback: { correct: true, message: won ? "Perfeito! Todos os grupos! 🎉" : "Grupo correto!" },
        finished: won,
        solved: won,
      };
    }

    // Erro. "Quase" se acertou 3 de 4 de algum grupo não resolvido.
    const oneAway = challenge.groups.some(
      (g, gi) =>
        !state.solvedGroups.includes(gi) &&
        guess.terms.filter((t) => g.termIds.includes(t)).length === 3,
    );
    const mistakes = state.mistakes + 1;
    const finished = mistakes >= GEEK_CONNECTIONS_CONFIG.maxMistakes;
    return {
      state: { ...state, mistakes, finished, solved: false },
      feedback: {
        correct: false,
        message: finished ? "Fim das tentativas." : oneAway ? "Quase! 3 de 4 certos." : "Não é um grupo.",
        details: { oneAway },
      },
      finished,
      solved: false,
    };
  },

  score(challenge: GeekConnectionsChallenge, state: GeekConnectionsState): number {
    return scoreGeekConnections({ solvedGroups: state.solvedGroups.length, mistakes: state.mistakes });
  },

  toPublic(challenge: GeekConnectionsChallenge, state: GeekConnectionsState): GeekConnectionsPublic {
    const solvedTermIds = new Set(state.solvedGroups.flatMap((gi) => challenge.groups[gi]!.termIds));
    const remaining = challenge.presented
      .filter((id) => !solvedTermIds.has(id))
      .map((id) => termView(challenge, id));
    const solved = state.solvedGroups.map((gi) => groupView(challenge, gi));
    return {
      remaining,
      solved,
      mistakes: state.mistakes,
      mistakesRemaining: GEEK_CONNECTIONS_CONFIG.maxMistakes - state.mistakes,
      finished: state.finished,
      won: state.solved,
      reveal: state.finished ? challenge.groups.map((_, gi) => groupView(challenge, gi)) : null,
    };
  },

  toResult(challenge: GeekConnectionsChallenge, state: GeekConnectionsState): GameResult {
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.solvedGroups.length + state.mistakes,
      summary: { solvedGroups: state.solvedGroups.length, mistakes: state.mistakes },
    };
  },
};
