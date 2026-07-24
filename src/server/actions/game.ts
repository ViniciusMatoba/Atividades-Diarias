"use server";

/**
 * Server Action GENÉRICA de jogo — funciona para qualquer módulo registrado.
 * O SERVIDOR é a autoridade (ver PRODUCT_AND_TECH_PLAN.md §16):
 * - Rederiva o desafio determinístico a partir de (dateKey, gameId).
 * - Valida estado e palpite via o próprio módulo (Zod dentro de parseState/parseGuess).
 * - A resposta secreta nunca é enviada crua; só a visão pública.
 * - No modo diário, ao vencer, grava o resultado OFICIAL de forma idempotente.
 *
 * Adicionar um novo jogo NÃO exige tocar aqui: basta registrá-lo no `registry`.
 */
import { z } from "zod";
import { getGameModule } from "@/games/core/registry";
import type { GameId } from "@/games/core/types";
import { scoreToStars, type StarRating } from "@/lib/stars";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { countDailyCompleted, recordOfficialResult } from "@/server/repo/firestore";

const inputSchema = z.object({
  gameId: z.string().min(1),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Chave de data inválida."),
  state: z.unknown(),
  guess: z.unknown(),
  mode: z.enum(["daily", "infinite"]).default("daily"),
  idToken: z.string().min(1).optional(),
});

export interface SubmitResult {
  ok: boolean;
  error?: string;
  public?: unknown;
  state?: unknown;
  score?: number;
  stars?: number | null;
  finished?: boolean;
  solved?: boolean;
  recordedOfficial?: boolean;
}

export async function submitGuess(input: unknown): Promise<SubmitResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Entrada inválida." };
  }
  const { gameId, dateKey, mode, idToken } = parsed.data;

  const gameModule = getGameModule(gameId as GameId);
  if (!gameModule) return { ok: false, error: "Jogo indisponível." };

  const challenge = gameModule.generateChallenge(`${dateKey}:${gameId}`);

  let state: unknown;
  let guess: unknown;
  try {
    state = gameModule.parseState(parsed.data.state);
    guess = gameModule.parseGuess(parsed.data.guess);
  } catch {
    return { ok: false, error: "Dados da partida inválidos." };
  }

  const outcome = gameModule.applyGuess(challenge, state, guess);
  const score = gameModule.score(challenge, outcome.state);
  // Uma partida CONCLUÍDA gera resultado oficial, resolvida ou não (a 1ª conta).
  const stars: StarRating | null = outcome.finished ? scoreToStars(score) : null;

  let recordedOfficial = false;
  if (mode === "daily" && outcome.finished && idToken && isFirebaseAdminConfigured) {
    try {
      const uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
      const already = await countDailyCompleted(uid, dateKey);
      const res = await recordOfficialResult({
        uid,
        dateKey,
        gameId,
        score,
        stars: stars ?? scoreToStars(score),
        gamesCompletedToday: already + 1,
      });
      recordedOfficial = res.created;
    } catch {
      // best-effort: não quebra a jogabilidade.
    }
  }

  return {
    ok: true,
    public: gameModule.toPublic(challenge, outcome.state),
    state: outcome.state,
    score,
    stars,
    finished: outcome.finished,
    solved: outcome.solved,
    recordedOfficial,
  };
}
