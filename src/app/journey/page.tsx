import Link from "next/link";
import { Info } from "lucide-react";
import { GAME_CATALOG, isPlayable } from "@/games/core/registry";
import { MOCK_JOURNEY } from "@/lib/mock";
import { summarizeJourney } from "@/lib/journey";
import { JourneyCard } from "@/components/JourneyCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export default function JourneyPage() {
  const summary = summarizeJourney(MOCK_JOURNEY);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold gd-text">Jornada Diária</h1>
        <p className="text-sm gd-muted">Jogue os 5 desafios na ordem que quiser.</p>
      </header>

      <div className="rounded-[var(--radius-card)] border gd-border gd-surface p-4">
        <ProgressBar
          value={summary.progress}
          label={`Progresso — ${summary.completed}/${summary.total}`}
        />
        <div className="mt-3 flex items-center gap-2 text-xs gd-muted">
          <Info size={14} aria-hidden />
          <span>
            Conclua ao menos 3 jogos para manter seu streak.
            {summary.countsForStreak ? " ✅ Streak garantido hoje!" : ""}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {GAME_CATALOG.map((meta) => {
          const data = MOCK_JOURNEY.find((j) => j.gameId === meta.id)!;
          return <JourneyCard key={meta.id} meta={meta} data={data} playable={isPlayable(meta.id)} />;
        })}
      </div>

      <Link href="/journey/result">
        <Button variant="secondary" className="w-full">
          Ver resultado do dia
        </Button>
      </Link>
    </div>
  );
}
