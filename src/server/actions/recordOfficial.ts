import { scoreToStars } from "@/lib/stars";

export async function tryRecordOfficialResult(
  idToken: string,
  dateKey: string,
  gameId: string,
  score: number,
): Promise<boolean> {
  if (typeof window !== "undefined") return false;
  try {
    const adminPath = "@/lib/firebase/admin";
    const firestorePath = "@/server/repo/firestore";
    const { getAdminAuth, isFirebaseAdminConfigured } = await import(/* webpackIgnore: true */ adminPath);
    const { countDailyCompleted, recordOfficialResult } = await import(/* webpackIgnore: true */ firestorePath);
    if (!isFirebaseAdminConfigured) return false;

    const uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
    const already = await countDailyCompleted(uid, dateKey);
    const stars = scoreToStars(score);
    const res = await recordOfficialResult({
      uid,
      dateKey,
      gameId,
      score,
      stars,
      gamesCompletedToday: already + 1,
    });
    return res.created;
  } catch {
    return false;
  }
}
