"use server";

/**
 * Server Actions do País Misterioso — o SERVIDOR é a autoridade.
 *
 * Segurança (ver PRODUCT_AND_TECH_PLAN.md §16):
 * - A resposta correta é derivada aqui e NUNCA é enviada crua ao cliente.
 * - O cliente manda apenas seu estado serializado (sem a resposta) + o palpite.
 * - Payloads são validados com Zod antes de qualquer efeito.
 *
 * Nota de protótipo: sem banco, o desafio é rederivado do `dateKey` (seed) a
 * cada chamada. Em produção, o desafio é materializado em
 * dailyChallenges/{dateKey}/games/{gameId} e a geração/país fica só no servidor.
 *
 * Persistência: no modo diário, ao vencer, grava o resultado OFICIAL de forma
 * idempotente (primeira pontuação vale). Replays e modo infinito não gravam.
 */

import { mysteryCountry, type MysteryCountryState } from "@/games/mysteryCountry";
import { scoreToStars, type StarRating } from "@/lib/stars";
import { submitMysteryGuessSchema } from "@/lib/validation";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { countDailyCompleted, recordOfficialResult } from "@/server/repo/firestore";

export interface MysterySubmitResult {
  ok: boolean;
  error?: string;
  public?: ReturnType<typeof mysteryCountry.toPublic>;
  state?: MysteryCountryState;
  score?: number;
  stars?: number | null;
  finished?: boolean;
  /** true se este envio gravou o resultado oficial (1ª vez). */
  recordedOfficial?: boolean;
}

/** Aplica um palpite no servidor e devolve a visão pública atualizada. */
export async function submitMysteryGuess(input: unknown): Promise<MysterySubmitResult> {
  const parsed = submitMysteryGuessSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Entrada inválida." };
  }

  const { dateKey, state, countryId, mode, idToken } = parsed.data;

  // token = dateKey → seed determinístico (mesmo desafio para todos naquele dia).
  const challenge = mysteryCountry.generateChallenge(`${dateKey}:mystery-country`);

  let guess;
  try {
    guess = mysteryCountry.parseGuess({ countryId });
  } catch {
    return { ok: false, error: "País inválido." };
  }

  const outcome = mysteryCountry.applyGuess(challenge, state as MysteryCountryState, guess);
  const score = mysteryCountry.score(challenge, outcome.state);
  const stars: StarRating | null = outcome.solved ? scoreToStars(score) : null;

  let recordedOfficial = false;
  if (mode === "daily" && outcome.finished && outcome.solved && idToken && isFirebaseAdminConfigured) {
    try {
      const uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
      const already = await countDailyCompleted(uid, dateKey);
      const res = await recordOfficialResult({
        uid,
        dateKey,
        gameId: "mystery-country",
        score,
        stars: stars ?? 1,
        gamesCompletedToday: already + 1,
      });
      recordedOfficial = res.created;
    } catch {
      // Persistência é best-effort: não quebra a jogabilidade.
    }
  }

  return {
    ok: true,
    public: mysteryCountry.toPublic(challenge, outcome.state),
    state: outcome.state,
    score,
    stars,
    finished: outcome.finished,
    recordedOfficial,
  };
}
