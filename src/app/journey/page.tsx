"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { GAME_CATALOG, isPlayable } from "@/games/core/registry";
import { DAILY_GAME_COUNT } from "@/lib/scoring";
import { journeyCountsForStreak } from "@/lib/streak";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import type { JourneyCardData } from "@/lib/mock";
import { JourneyCard } from "@/components/JourneyCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";

export default function JourneyPage() {
  const { todayResults, loading } = useAuthCtx();
  if (loading) return <LoadingState label="Carregando jornada…" />;

  const resultByGame = new Map(todayResults.map((r) => [r.gameId, r]));
  const cards: JourneyCardData[] = GAME_CATALOG.map((meta) => {
    const r = resultByGame.get(meta.id);
    return r
      ? { gameId: meta.id, status: "completed", score: r.score, stars: r.stars }
      : { gameId: meta.id, status: "not-started", score: null, stars: null };
  });

  const completed = todayResults.length;
  const countsForStreak = journeyCountsForStreak(completed);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold gd-text">Jornada Diária</h1>
        <p className="text-sm gd-muted">Jogue os 5 desafios na ordem que quiser.</p>
      </header>

      <div className="rounded-[var(--radius-card)] border gd-border gd-surface p-4">
        <ProgressBar value={completed / DAILY_GAME_COUNT} label={`Progresso — ${completed}/${DAILY_GAME_COUNT}`} />
        <div className="mt-3 flex items-center gap-2 text-xs gd-muted">
          <Info size={14} aria-hidden />
          <span>
            Conclua ao menos 3 jogos para manter seu streak.
            {countsForStreak ? " ✅ Streak garantido hoje!" : ""}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {GAME_CATALOG.map((meta, i) => (
          <JourneyCard key={meta.id} meta={meta} data={cards[i]!} playable={isPlayable(meta.id)} />
        ))}
      </div>

      <Link href="/journey/result">
        <Button variant="secondary" className="w-full">
          Ver resultado do dia
        </Button>
      </Link>
    </div>
  );
}
