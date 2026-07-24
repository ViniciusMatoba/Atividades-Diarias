"use client";

import Link from "next/link";
import { Flame, Trophy, Infinity as InfinityIcon, ArrowRight, LogIn } from "lucide-react";
import { GAME_CATALOG, isPlayable } from "@/games/core/registry";
import { getDailyKey } from "@/lib/dailyKey";
import { DAILY_GAME_COUNT, MAX_DAILY_SCORE } from "@/lib/scoring";
import { effectiveCurrentStreak } from "@/lib/streak";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import type { JourneyCardData } from "@/lib/mock";
import { JourneyCard } from "@/components/JourneyCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState } from "@/components/ui/States";
import { HomeDiscoveriesPreview } from "@/features/dailyDiscoveries/ui/HomeDiscoveriesPreview";
import { getDailyDiscoveries } from "@/features/dailyDiscoveries/services/dailySelection";
import { getUserDiscoveryStates } from "@/features/dailyDiscoveries/services/userDiscoveries";

function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(
      new Date(),
    ),
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomePage() {
  const { user, profile, todayResults, loading } = useAuthCtx();

  if (loading) return <LoadingState label="Carregando seu dia…" />;

  const dateKey = getDailyKey();
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const resultByGame = new Map(todayResults.map((r) => [r.gameId, r]));
  const cards: JourneyCardData[] = GAME_CATALOG.map((meta) => {
    const r = resultByGame.get(meta.id);
    return r
      ? { gameId: meta.id, status: "completed", score: r.score, stars: r.stars }
      : { gameId: meta.id, status: "not-started", score: null, stars: null };
  });

  const completed = todayResults.length;
  const dayScore = todayResults.reduce((acc, r) => acc + r.score, 0);
  const streak = profile
    ? effectiveCurrentStreak(
        { current: profile.currentStreak, longest: profile.longestStreak, lastCompletedKey: profile.lastCompletedKey },
        dateKey,
      )
    : 0;
  const displayName = profile?.username ?? user?.displayName ?? "Visitante";

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm gd-muted">{greeting()},</p>
          <h1 className="text-2xl font-bold gd-text">{displayName}</h1>
          <p className="text-xs gd-muted capitalize">Desafio de {dateLabel}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full gd-surface-2 px-3 py-1.5">
          <Flame className="text-[var(--color-pink)]" size={18} aria-hidden />
          <span className="font-bold gd-text">{streak}</span>
        </div>
      </header>

      {!user && (
        <Link
          href="/login"
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-primary)] bg-[var(--color-primary)]/10 p-4"
        >
          <div className="flex items-center gap-3">
            <LogIn className="text-[var(--color-primary)]" size={22} aria-hidden />
            <div>
              <p className="font-semibold gd-text">Entre para salvar seu progresso</p>
              <p className="text-xs gd-muted">Pontuação, streak e conquistas ficam guardados.</p>
            </div>
          </div>
          <ArrowRight size={18} className="gd-muted" aria-hidden />
        </Link>
      )}

      <Card className="gd-pop bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-strong)] text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm/5 opacity-90">Pontuação de hoje</p>
            <p className="text-3xl font-extrabold">
              {dayScore}
              <span className="text-base font-medium opacity-70"> / {MAX_DAILY_SCORE}</span>
            </p>
          </div>
          <Trophy size={40} className="opacity-80" aria-hidden />
        </div>
        <div className="mt-3">
          <ProgressBar value={completed / DAILY_GAME_COUNT} label={`${completed}/${DAILY_GAME_COUNT} jogos`} />
        </div>
      </Card>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold gd-text">Jornada de hoje</h2>
          <Link href="/journey" className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)]">
            Ver tudo <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        <div className="space-y-2.5">
          {GAME_CATALOG.map((meta, i) => (
            <JourneyCard key={meta.id} meta={meta} data={cards[i]!} playable={isPlayable(meta.id)} />
          ))}
        </div>
      </section>

      {/* Seção Descobertas de hoje */}
      <HomeDiscoveriesPreview
        discoveries={getDailyDiscoveries(dateKey)}
        userStates={getUserDiscoveryStates(dateKey)}
      />

      <Link
        href="/infinite"
        className="flex items-center justify-between rounded-[var(--radius-card)] border gd-border gd-surface p-4"
      >
        <div className="flex items-center gap-3">
          <InfinityIcon className="text-[var(--color-accent)]" size={24} aria-hidden />
          <div>
            <p className="font-semibold gd-text">Modo Infinito</p>
            <p className="text-xs gd-muted">Rodadas avulsas — não afeta a pontuação oficial.</p>
          </div>
        </div>
        <ArrowRight size={18} className="gd-muted" aria-hidden />
      </Link>

      <p className="pb-2 text-center text-xs gd-muted">Chave do dia: {dateKey} · fuso America/Sao_Paulo</p>
    </div>
  );
}
