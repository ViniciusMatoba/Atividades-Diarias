import Link from "next/link";
import { Infinity as InfinityIcon, Lock } from "lucide-react";
import { GAME_CATALOG, isPlayable } from "@/games/core/registry";
import { GameIcon } from "@/components/GameIcon";

const THEME_BG: Record<string, string> = {
  geo: "bg-[var(--color-geo)]",
  pokemon: "bg-[var(--color-pokemon)]",
  anime: "bg-[var(--color-anime)]",
  movies: "bg-[var(--color-movies)]",
  geek: "bg-[var(--color-geek)]",
};

export default function InfinitePage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <InfinityIcon className="text-[var(--color-accent)]" size={28} aria-hidden />
        <div>
          <h1 className="text-2xl font-bold gd-text">Modo Infinito</h1>
          <p className="text-sm gd-muted">Rodadas avulsas — não afeta a pontuação oficial.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2.5">
        {GAME_CATALOG.map((meta) => {
          const playable = isPlayable(meta.id);
          const inner = (
            <div className="gd-surface flex h-full flex-col gap-2 rounded-[var(--radius-card)] border gd-border p-4">
              <div
                className={`flex size-11 items-center justify-center rounded-xl text-black/80 ${
                  THEME_BG[meta.theme] ?? "gd-surface-2"
                }`}
              >
                <GameIcon name={meta.icon} />
              </div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-semibold gd-text">{meta.name}</h3>
                {!playable && <Lock size={12} className="gd-muted" aria-hidden />}
              </div>
              <p className="text-xs gd-muted">{playable ? "Jogar agora" : "Em breve"}</p>
            </div>
          );
          return playable ? (
            <Link key={meta.id} href={`/play/${meta.id}?mode=infinite`} aria-label={`Jogar ${meta.name}`}>
              {inner}
            </Link>
          ) : (
            <div key={meta.id} className="opacity-60">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
