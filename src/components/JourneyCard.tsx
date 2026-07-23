import Link from "next/link";
import { CheckCircle2, Circle, Clock, Lock } from "lucide-react";
import type { GameMeta } from "@/games/core/types";
import type { JourneyCardData } from "@/lib/mock";
import { GameIcon } from "./GameIcon";
import { StarRating } from "./ui/StarRating";

const STATUS_META = {
  "not-started": { label: "Não iniciado", Icon: Circle, color: "gd-muted" },
  "in-progress": { label: "Em andamento", Icon: Clock, color: "text-[var(--color-warning)]" },
  completed: { label: "Concluído", Icon: CheckCircle2, color: "text-[var(--color-success)]" },
} as const;

const THEME_BG: Record<string, string> = {
  geo: "bg-[var(--color-geo)]",
  pokemon: "bg-[var(--color-pokemon)]",
  anime: "bg-[var(--color-anime)]",
  movies: "bg-[var(--color-movies)]",
  geek: "bg-[var(--color-geek)]",
};

interface JourneyCardProps {
  meta: GameMeta;
  data: JourneyCardData;
  playable: boolean;
}

export function JourneyCard({ meta, data, playable }: JourneyCardProps) {
  const status = STATUS_META[data.status];
  const href = playable ? `/play/${meta.id}` : "#";

  const inner = (
    <div className="gd-surface flex items-center gap-3 rounded-[var(--radius-card)] border gd-border p-3.5 transition-transform active:scale-[0.99]">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-black/80 ${
          THEME_BG[meta.theme] ?? "gd-surface-2"
        }`}
      >
        <GameIcon name={meta.icon} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold gd-text">{meta.name}</h3>
          {!playable && (
            <span className="inline-flex items-center gap-1 rounded-full gd-surface-2 px-2 py-0.5 text-[10px] gd-muted">
              <Lock size={10} aria-hidden /> em breve
            </span>
          )}
        </div>
        <p className="truncate text-xs gd-muted">{meta.description}</p>
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 ${status.color}`}>
            <status.Icon size={13} aria-hidden /> {status.label}
          </span>
          {data.score !== null && <span className="gd-muted">· {data.score} pts</span>}
        </div>
      </div>

      <div className="shrink-0">
        <StarRating value={data.stars} size={15} />
      </div>
    </div>
  );

  if (!playable) return <div className="opacity-70">{inner}</div>;
  return (
    <Link href={href} aria-label={`Jogar ${meta.name}`}>
      {inner}
    </Link>
  );
}
