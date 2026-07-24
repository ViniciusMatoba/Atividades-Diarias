"use client";

import Link from "next/link";
import { GAME_CATALOG } from "@/games/core/registry";
import { scoreToStars, type StarRating as StarValue } from "@/lib/stars";
import { DAILY_GAME_COUNT, MAX_DAILY_SCORE } from "@/lib/scoring";
import { journeyCountsForStreak } from "@/lib/streak";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { GameIcon } from "@/components/GameIcon";
import { LoadingState } from "@/components/ui/States";

import { useState } from "react";
import { ShareStoryModal } from "@/components/ShareStoryModal";
import { effectiveCurrentStreak } from "@/lib/streak";
import { getDailyKey } from "@/lib/dailyKey";
import { Instagram } from "lucide-react";

export default function DailyResultPage() {
  const { user, profile, todayResults, loading } = useAuthCtx();
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (loading) return <LoadingState label="Carregando resultado…" />;

  const resultByGame = new Map(todayResults.map((r) => [r.gameId, r]));
  const completed = todayResults.length;
  const dayScore = todayResults.reduce((acc, r) => acc + r.score, 0);
  const countsForStreak = journeyCountsForStreak(completed);
  const overallStars: StarValue = scoreToStars(Math.round(dayScore / DAILY_GAME_COUNT));

  const dateKey = getDailyKey();
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const streak = profile
    ? effectiveCurrentStreak(
        { current: profile.currentStreak, longest: profile.longestStreak, lastCompletedKey: profile.lastCompletedKey },
        dateKey,
      )
    : 0;
  const displayName = profile?.username ?? user?.displayName ?? "Visitante";

  return (
    <div className="space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold gd-text">Resultado do dia</h1>
        <p className="text-sm gd-muted">Pontuação oficial da jornada de hoje</p>
      </header>

      <Card className="gd-pop text-center">
        <p className="text-sm gd-muted">Total</p>
        <p className="text-4xl font-extrabold gd-text">
          {dayScore}
          <span className="text-lg font-medium gd-muted"> / {MAX_DAILY_SCORE}</span>
        </p>
        <div className="mt-2 flex justify-center">
          <StarRating value={overallStars} size={26} />
        </div>
        {countsForStreak ? (
          <p className="mt-2 text-sm text-[var(--color-success)] font-semibold">Streak mantido! 🔥</p>
        ) : (
          <p className="mt-2 text-xs gd-muted">
            Conclua ao menos 3 jogos para manter o streak ({completed}/{DAILY_GAME_COUNT}).
          </p>
        )}

        <div className="mt-4 pt-3 border-t gd-border">
          <Button
            onClick={() => setIsShareOpen(true)}
            className="w-full font-bold shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
          >
            <Instagram size={18} /> Compartilhar no Instagram Stories
          </Button>
        </div>
      </Card>

      <ul className="space-y-2">
        {GAME_CATALOG.map((meta) => {
          const r = resultByGame.get(meta.id);
          return (
            <li
              key={meta.id}
              className="flex items-center gap-3 rounded-xl border gd-border gd-surface p-3"
            >
              <GameIcon name={meta.icon} size={18} className="gd-muted" />
              <span className="flex-1 truncate text-sm gd-text">{meta.name}</span>
              {r ? (
                <>
                  <span className="text-sm gd-muted">{r.score} pts</span>
                  <StarRating value={r.stars} size={14} />
                </>
              ) : (
                <span className="text-xs gd-muted">pendente</span>
              )}
            </li>
          );
        })}
      </ul>

      <Link href="/journey">
        <Button variant="secondary" className="w-full font-bold">Voltar à jornada</Button>
      </Link>

      <ShareStoryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        username={displayName}
        streak={streak}
        dateLabel={dateLabel}
        todayResults={todayResults}
      />
    </div>
  );
}
