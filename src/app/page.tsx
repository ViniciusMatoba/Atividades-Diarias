import Link from "next/link";
import { Flame, Trophy, Infinity as InfinityIcon, ArrowRight } from "lucide-react";
import { GAME_CATALOG, isPlayable } from "@/games/core/registry";
import { MOCK_JOURNEY, MOCK_USER } from "@/lib/mock";
import { summarizeJourney } from "@/lib/journey";
import { getDailyKey } from "@/lib/dailyKey";
import { JourneyCard } from "@/components/JourneyCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
  const summary = summarizeJourney(MOCK_JOURNEY);
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm gd-muted">{greeting()},</p>
          <h1 className="text-2xl font-bold gd-text">{MOCK_USER.username}</h1>
          <p className="text-xs gd-muted capitalize">Desafio de {dateLabel}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full gd-surface-2 px-3 py-1.5">
          <Flame className="text-[var(--color-pink)]" size={18} aria-hidden />
          <span className="font-bold gd-text">{MOCK_USER.currentStreak}</span>
        </div>
      </header>

      <Card className="gd-pop bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-strong)] text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm/5 opacity-90">Pontuação de hoje</p>
            <p className="text-3xl font-extrabold">
              {summary.dayScore}
              <span className="text-base font-medium opacity-70"> / {summary.maxScore}</span>
            </p>
          </div>
          <Trophy size={40} className="opacity-80" aria-hidden />
        </div>
        <div className="mt-3">
          <ProgressBar value={summary.progress} label={`${summary.completed}/${summary.total} jogos`} />
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
          {GAME_CATALOG.map((meta) => {
            const data = MOCK_JOURNEY.find((j) => j.gameId === meta.id)!;
            return <JourneyCard key={meta.id} meta={meta} data={data} playable={isPlayable(meta.id)} />;
          })}
        </div>
      </section>

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

      <p className="pb-2 text-center text-xs gd-muted">
        Chave do dia: {getDailyKey()} · fuso America/Sao_Paulo
      </p>
    </div>
  );
}
