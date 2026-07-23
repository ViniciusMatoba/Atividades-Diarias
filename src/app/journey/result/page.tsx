import Link from "next/link";
import { GAME_CATALOG } from "@/games/core/registry";
import { MOCK_JOURNEY } from "@/lib/mock";
import { summarizeJourney } from "@/lib/journey";
import { scoreToStars } from "@/lib/stars";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { GameIcon } from "@/components/GameIcon";

export default function DailyResultPage() {
  const summary = summarizeJourney(MOCK_JOURNEY);
  const overallStars = scoreToStars(Math.round(summary.dayScore / summary.total));

  return (
    <div className="space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold gd-text">Resultado do dia</h1>
        <p className="text-sm gd-muted">Pontuação oficial da jornada de hoje</p>
      </header>

      <Card className="gd-pop text-center">
        <p className="text-sm gd-muted">Total</p>
        <p className="text-4xl font-extrabold gd-text">
          {summary.dayScore}
          <span className="text-lg font-medium gd-muted"> / {summary.maxScore}</span>
        </p>
        <div className="mt-2 flex justify-center">
          <StarRating value={overallStars} size={26} />
        </div>
        {summary.countsForStreak && (
          <p className="mt-2 text-sm text-[var(--color-success)]">Streak mantido! 🔥</p>
        )}
      </Card>

      <ul className="space-y-2">
        {GAME_CATALOG.map((meta) => {
          const data = MOCK_JOURNEY.find((j) => j.gameId === meta.id)!;
          return (
            <li
              key={meta.id}
              className="flex items-center gap-3 rounded-xl border gd-border gd-surface p-3"
            >
              <GameIcon name={meta.icon} size={18} className="gd-muted" />
              <span className="flex-1 truncate text-sm gd-text">{meta.name}</span>
              {data.status === "completed" ? (
                <>
                  <span className="text-sm gd-muted">{data.score} pts</span>
                  <StarRating value={data.stars} size={14} />
                </>
              ) : (
                <span className="text-xs gd-muted">pendente</span>
              )}
            </li>
          );
        })}
      </ul>

      <Link href="/journey">
        <Button className="w-full">Voltar à jornada</Button>
      </Link>
    </div>
  );
}
