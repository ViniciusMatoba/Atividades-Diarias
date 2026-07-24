import { scoreToStars, type StarRating } from "./stars";

export interface TodayResult {
  gameId: string;
  score: number;
  stars: StarRating;
}

const GAME_IDS = [
  "mystery-country",
  "world-pin",
  "poke-guess",
  "geek-connections",
  "who-came-first",
  "word-scramble",
  "pixel-guess",
  "emoji-movie",
  "flag-master",
  "soundtrack-trivia",
];

export function getMergedTodayResults(
  dateKey: string,
  firestoreResults: TodayResult[],
): TodayResult[] {
  if (typeof window === "undefined") return firestoreResults;

  const mergedMap = new Map<string, TodayResult>();
  for (const r of firestoreResults) {
    mergedMap.set(r.gameId, r);
  }

  for (const gameId of GAME_IDS) {
    if (mergedMap.has(gameId)) continue;

    try {
      const saved = localStorage.getItem(`geekdaily:v1:state:${dateKey}:${gameId}`);
      if (!saved) continue;

      const parsed = JSON.parse(saved);
      const pub = parsed?.public;
      if (!pub) continue;

      let isFinished = false;
      let score = 0;

      if (gameId === "poke-guess") {
        if (pub.finished) {
          isFinished = true;
          score = pub.solved ? Math.round(1000 * (1 - (pub.rows.length - 1) / 8)) : 0;
        }
      } else if (gameId === "mystery-country") {
        if (pub.finished) {
          isFinished = true;
          const extraClues = Math.max(0, (pub.revealedClues ?? 1) - 1);
          const wrong = pub.guesses?.filter((g: { correct?: boolean }) => !g.correct).length ?? 0;
          score = Math.max(0, 1000 - extraClues * 80 - wrong * 60);
        }
      } else if (gameId === "world-pin") {
        if (pub.finished || (pub.submitted && pub.result)) {
          isFinished = true;
          score = pub.solved ? Math.round(1000 * (1 - ((pub.guesses?.length ?? 1) - 1) / 6)) : 0;
        }
      } else if (gameId === "geek-connections") {
        if (pub.finished || pub.won || pub.solved?.length === 4 || pub.mistakes >= 4) {
          isFinished = true;
          score = Math.round(
            ((pub.solved?.length ?? 0) / 4) * 1000 * Math.max(0.4, 1 - (pub.mistakes ?? 0) * 0.15),
          );
        }
      } else if (gameId === "who-came-first") {
        if (pub.finished || pub.reveal) {
          isFinished = true;
          if (pub.reveal) {
            const correct = pub.reveal.correct.map((c: { id: string }) => c.id);
            let inv = 0;
            const idx = new Map(correct.map((id: string, i: number) => [id, i]));
            const po = pub.reveal.playerOrder;
            for (let i = 0; i < po.length; i++)
              for (let j = i + 1; j < po.length; j++)
                if ((idx.get(po[i]!) ?? 0) > (idx.get(po[j]!) ?? 0)) inv++;
            const pairs = (po.length * (po.length - 1)) / 2;
            score = Math.round(1000 * (1 - inv / pairs));
          }
        }
      } else {
        // movie-quote, pixel-guess, emoji-movie, flag-master, soundtrack-trivia
        if (pub.finished) {
          isFinished = true;
          const attempts = pub.guesses?.length ?? 1;
          score = pub.solved ? Math.round(1000 * (1 - (attempts - 1) / 5)) : 0;
        }
      }

      if (isFinished) {
        mergedMap.set(gameId, {
          gameId,
          score,
          stars: scoreToStars(score),
        });
      }
    } catch {
      // storage
    }
  }

  return Array.from(mergedMap.values());
}
