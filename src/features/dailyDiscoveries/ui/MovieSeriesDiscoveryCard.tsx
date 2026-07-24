"use client";

import { Heart, Film, Tv, Bookmark, Star, Sparkles, BookOpen, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MovieSeries, UserDiscoveryState } from "../types";

interface Props {
  media: MovieSeries;
  state?: UserDiscoveryState;
  onToggleFavorite: () => void;
  onToggleWatchlist: () => void;
}

export function MovieSeriesDiscoveryCard({ media, state, onToggleFavorite, onToggleWatchlist }: Props) {
  const isFav = !!state?.isFavorite;
  const isWatchlist = !!state?.inWatchlist;

  const isMovie = media.type === "movie";

  return (
    <div className="rounded-2xl border-2 border-[var(--color-movies)]/40 gd-surface p-4 space-y-4 shadow-xl gd-bounce-in">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-movies)]/20 px-3 py-1 text-xs font-extrabold text-[var(--color-movies)]">
          {isMovie ? <Film size={16} /> : <Tv size={16} />} {isMovie ? "Filme do Dia" : "Série do Dia"}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant={isWatchlist ? "primary" : "secondary"}
            size="sm"
            onClick={onToggleWatchlist}
            className={`gap-1 font-bold ${isWatchlist ? "bg-amber-500 hover:bg-amber-600 text-black border-none" : ""}`}
          >
            <Bookmark size={15} fill={isWatchlist ? "currentColor" : "none"} />
            {isWatchlist ? "Na Lista" : "Quero Assistir"}
          </Button>
          <Button
            variant={isFav ? "primary" : "secondary"}
            size="sm"
            onClick={onToggleFavorite}
            className={`gap-1 font-bold ${isFav ? "bg-rose-500 hover:bg-rose-600 text-white border-none" : ""}`}
          >
            <Heart size={15} fill={isFav ? "currentColor" : "none"} />
            {isFav ? "Salvo" : "Favoritar"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border gd-border gd-surface-2 p-4 text-left space-y-3 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-movies)] uppercase tracking-wider">
              {media.year} · {media.durationOrSeasons} {media.ratingAge && `· ${media.ratingAge}`}
            </span>
            <span className="text-[10px] font-extrabold bg-white/10 px-2 py-0.5 rounded-full gd-text">
              {media.genres.join(" / ")}
            </span>
          </div>
          <h3 className="text-2xl font-black gd-text">{media.title}</h3>
          <p className="text-xs font-semibold gd-muted flex items-center gap-1">
            <Clapperboard size={13} /> {isMovie ? "Direção" : "Criação"}: {media.directorOrCreator} ({media.studio})
          </p>
        </div>

        <div className="rounded-xl bg-black/20 p-3 text-xs leading-relaxed gd-text">
          <p className="font-bold text-[10px] uppercase tracking-wider gd-muted mb-1">Sinopse</p>
          &quot;{media.synopsis}&quot;
        </div>

        <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 text-xs text-sky-200/90 leading-relaxed space-y-1">
          <p className="font-bold uppercase text-[10px] tracking-wider text-sky-400 flex items-center gap-1">
            <Star size={13} /> Por que assistir?
          </p>
          <p>{media.whyToWatch}</p>
        </div>

        {media.productionTrivia && (
          <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-xs text-purple-200/90 leading-relaxed space-y-1">
            <p className="font-bold uppercase text-[10px] tracking-wider text-purple-400 flex items-center gap-1">
              <Sparkles size={13} /> Curiosidade de Produção
            </p>
            <p>{media.productionTrivia}</p>
          </div>
        )}

        {media.culturalImpact && (
          <div className="text-xs gd-muted border-t border-white/5 pt-2 flex items-start gap-1.5">
            <BookOpen size={14} className="shrink-0 text-[var(--color-movies)] mt-0.5" />
            <span><strong className="gd-text">Impacto Cultural:</strong> {media.culturalImpact}</span>
          </div>
        )}
      </div>

      {state?.userGuess && (
        <div className="rounded-xl bg-black/20 p-3 text-xs text-center gd-muted font-medium">
          Seu palpite foi: <span className="font-bold gd-text">&quot;{state.userGuess}&quot;</span> {state.isCorrect ? "✅ (Correto!)" : "💡 (Revelado)"}
        </div>
      )}
    </div>
  );
}
