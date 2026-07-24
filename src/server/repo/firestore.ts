import "server-only";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getWeekKey } from "@/lib/dailyKey";
import { applyDailyCompletion, type StreakState } from "@/lib/streak";
import type { StarRating } from "@/lib/stars";
import { levelFromXp } from "@/lib/xp";

/**
 * Camada de acesso a dados (Firestore, via Admin SDK). Autoridade do servidor.
 *
 * Coleções:
 *   profiles/{uid}
 *   dailyChallenges/{dateKey}/games/{gameId}      (payload público + resposta secreta)
 *   gameSessions/{uid}/plays/{sessionId}
 *   officialResults/{uid_dateKey_gameId}          (id determinístico → idempotência)
 *   dailyScores/{dateKey}/users/{uid}             (agregado p/ ranking diário)
 *   weeklyScores/{weekKey}/users/{uid}            (agregado p/ ranking semanal)
 *   userAchievements/{uid}/unlocked/{achievementId}
 */

export function officialResultId(uid: string, dateKey: string, gameId: string): string {
  return `${uid}_${dateKey}_${gameId}`;
}

export interface ProfileDoc {
  uid: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedKey: string | null;
  totalScore: number;
  gamesCompleted: number;
}

/** Cria o perfil do usuário se ainda não existir (idempotente). */
export async function ensureProfile(uid: string, username: string): Promise<void> {
  if (!isFirebaseAdminConfigured) return;
  const ref = getAdminDb().collection("profiles").doc(uid);
  const snap = await ref.get();
  if (snap.exists) return;
  await ref.set({
    uid,
    username,
    avatar: "default",
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedKey: null,
    totalScore: 0,
    gamesCompleted: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getProfile(uid: string): Promise<ProfileDoc | null> {
  if (!isFirebaseAdminConfigured) return null;
  const snap = await getAdminDb().collection("profiles").doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as ProfileDoc;
}

/** Quantos jogos o usuário já tem resultado oficial em um dia. */
export async function countDailyCompleted(uid: string, dateKey: string): Promise<number> {
  if (!isFirebaseAdminConfigured) return 0;
  const snap = await getAdminDb()
    .collection("officialResults")
    .where("uid", "==", uid)
    .where("dateKey", "==", dateKey)
    .get();
  return snap.size;
}

export interface RecordOfficialInput {
  uid: string;
  dateKey: string;
  gameId: string;
  score: number;
  stars: StarRating;
  /** Total de jogos concluídos no dia após este resultado (p/ streak). */
  gamesCompletedToday: number;
}

export interface RecordOfficialResult {
  created: boolean; // false se já existia (idempotente)
  dailyTotal: number;
}

/**
 * Grava a pontuação oficial de forma idempotente e atualiza agregados.
 * Se o resultado (uid, dia, jogo) já existe, não faz nada (retorna created:false).
 */
export async function recordOfficialResult(
  input: RecordOfficialInput,
): Promise<RecordOfficialResult> {
  if (!isFirebaseAdminConfigured) {
    // Modo dev sem credenciais: não persiste.
    return { created: false, dailyTotal: input.score };
  }

  const db = getAdminDb();
  const weekKey = getWeekKey();
  const resultRef = db.collection("officialResults").doc(officialResultId(input.uid, input.dateKey, input.gameId));
  const dailyRef = db.collection("dailyScores").doc(input.dateKey).collection("users").doc(input.uid);
  const weeklyRef = db.collection("weeklyScores").doc(weekKey).collection("users").doc(input.uid);
  const profileRef = db.collection("profiles").doc(input.uid);

  return db.runTransaction(async (tx) => {
    // Firestore exige TODAS as leituras antes de qualquer escrita.
    const [existing, dailySnap, weeklySnap, profileSnap] = await Promise.all([
      tx.get(resultRef),
      tx.get(dailyRef),
      tx.get(weeklyRef),
      tx.get(profileRef),
    ]);

    if (existing.exists) {
      return { created: false, dailyTotal: (dailySnap.data()?.total as number | undefined) ?? 0 };
    }

    const username = (profileSnap.data()?.username as string | undefined) ?? "Jogador";
    const newDailyTotal = ((dailySnap.data()?.total as number | undefined) ?? 0) + input.score;
    const newWeeklyTotal = ((weeklySnap.data()?.total as number | undefined) ?? 0) + input.score;

    tx.set(resultRef, {
      uid: input.uid,
      dateKey: input.dateKey,
      gameId: input.gameId,
      score: input.score,
      stars: input.stars,
      createdAt: new Date(),
    });
    tx.set(dailyRef, { uid: input.uid, username, total: newDailyTotal, updatedAt: new Date() }, { merge: true });
    tx.set(weeklyRef, { uid: input.uid, username, total: newWeeklyTotal, updatedAt: new Date() }, { merge: true });

    // Streak: só conta quando a jornada do dia atinge o mínimo de jogos.
    const prevStreak: StreakState = {
      current: (profileSnap.data()?.currentStreak as number | undefined) ?? 0,
      longest: (profileSnap.data()?.longestStreak as number | undefined) ?? 0,
      lastCompletedKey: (profileSnap.data()?.lastCompletedKey as string | null | undefined) ?? null,
    };
    const newXp = ((profileSnap.data()?.xp as number | undefined) ?? 0) + input.score;
    const profileUpdate: Record<string, unknown> = {
      totalScore: ((profileSnap.data()?.totalScore as number | undefined) ?? 0) + input.score,
      gamesCompleted: ((profileSnap.data()?.gamesCompleted as number | undefined) ?? 0) + 1,
      xp: newXp,
      level: levelFromXp(newXp).level,
      updatedAt: new Date(),
    };
    if (input.gamesCompletedToday >= 3) {
      const nextStreak = applyDailyCompletion(prevStreak, input.dateKey);
      profileUpdate.currentStreak = nextStreak.current;
      profileUpdate.longestStreak = nextStreak.longest;
      profileUpdate.lastCompletedKey = nextStreak.lastCompletedKey;
    }
    tx.set(profileRef, profileUpdate, { merge: true });

    return { created: true, dailyTotal: newDailyTotal };
  });
}

export interface RankingEntry {
  uid: string;
  username: string;
  total: number;
}

async function readScoreboard(path: string, key: string): Promise<RankingEntry[]> {
  if (!isFirebaseAdminConfigured) return [];
  const db = getAdminDb();
  const snap = await db.collection(path).doc(key).collection("users").orderBy("total", "desc").limit(50).get();
  return snap.docs.map((d) => ({
    uid: d.get("uid") as string,
    username: (d.get("username") as string | undefined) ?? "Jogador",
    total: (d.get("total") as number | undefined) ?? 0,
  }));
}

export function getDailyRanking(dateKey: string): Promise<RankingEntry[]> {
  return readScoreboard("dailyScores", dateKey);
}

export function getWeeklyRanking(weekKey: string): Promise<RankingEntry[]> {
  return readScoreboard("weeklyScores", weekKey);
}
