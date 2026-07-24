"use client";

import { useState } from "react";
import { HelpCircle, Eye, Sparkles, MapPin, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DailyDiscovery } from "../types";

interface Props {
  discovery: DailyDiscovery;
  onReveal: (guess?: string, isCorrect?: boolean) => void;
}

export function DiscoveryTeaserCard({ discovery, onReveal }: Props) {
  const [guessInput, setGuessInput] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; correct: boolean } | null>(null);

  const getHeaderIcon = () => {
    switch (discovery.type) {
      case "pokemon":
        return <Sparkles className="text-[var(--color-pokemon)]" size={20} />;
      case "country":
        return <MapPin className="text-[var(--color-geo)]" size={20} />;
      case "movie":
        return <Film className="text-[var(--color-movies)]" size={20} />;
      case "series":
        return <Tv className="text-[var(--color-movies)]" size={20} />;
    }
  };

  const getCategoryBadge = () => {
    switch (discovery.type) {
      case "pokemon":
        return "⚡ Pokémon do Dia";
      case "country":
        return "🌍 País do Dia";
      case "movie":
        return "🎬 Filme do Dia";
      case "series":
        return "📺 Série do Dia";
    }
  };

  function handleGuessSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guessInput.trim()) return;

    let targetName = "";
    if (discovery.type === "pokemon") targetName = discovery.content.name;
    else if (discovery.type === "country") targetName = discovery.content.name;
    else targetName = discovery.content.title;

    const isCorrect = targetName.toLowerCase().trim() === guessInput.toLowerCase().trim();
    setFeedback({
      message: isCorrect ? "Você acertou o palpite! 🎉" : `Palpite enviado! O correto era: ${targetName}`,
      correct: isCorrect,
    });

    onReveal(guessInput, isCorrect);
  }

  return (
    <div className="rounded-2xl border gd-border gd-surface p-5 space-y-4 shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-2)] px-3 py-1 text-xs font-bold gd-text">
          {getHeaderIcon()} {getCategoryBadge()}
        </span>
        <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full">
          🔒 Não revelado
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-extrabold gd-text flex items-center gap-2">
          <HelpCircle size={18} className="gd-muted" /> Pistas da Descoberta
        </h3>
        <p className="text-sm gd-muted leading-relaxed rounded-xl bg-black/15 p-3 border border-white/5">
          &quot;{discovery.teaser.clueText}&quot;
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-semibold gd-muted">
        {discovery.type === "pokemon" && (
          <>
            <div className="rounded-xl gd-surface-2 p-2 text-center">Tipo: {discovery.teaser.type1}</div>
            <div className="rounded-xl gd-surface-2 p-2 text-center">Geração: {discovery.teaser.generation}ª</div>
          </>
        )}
        {discovery.type === "country" && (
          <>
            <div className="rounded-xl gd-surface-2 p-2 text-center">Continente: {discovery.teaser.continent}</div>
            <div className="rounded-xl gd-surface-2 p-2 text-center">Capital: {discovery.teaser.scrambledCapital || "..."}</div>
          </>
        )}
        {(discovery.type === "movie" || discovery.type === "series") && (
          <>
            <div className="rounded-xl gd-surface-2 p-2 text-center">Ano: {discovery.teaser.year}</div>
            <div className="rounded-xl gd-surface-2 p-2 text-center">Gênero: {discovery.teaser.genres[0]}</div>
          </>
        )}
      </div>

      {!feedback ? (
        <form onSubmit={handleGuessSubmit} className="space-y-3 pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Dar um palpite opcional..."
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              className="flex-1 h-11 rounded-xl border gd-border gd-surface-2 px-3 text-sm font-semibold gd-text outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <Button type="submit" variant="secondary" size="md" disabled={!guessInput.trim()} className="shrink-0 font-bold">
              Testar
            </Button>
          </div>

          <Button onClick={() => onReveal()} size="lg" className="w-full font-bold shadow-md">
            <Eye size={18} aria-hidden /> Revelar Conteúdo Completo
          </Button>
        </form>
      ) : (
        <div className="space-y-3 pt-1 text-center">
          <p className={`text-sm font-bold ${feedback.correct ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}`}>
            {feedback.message}
          </p>
        </div>
      )}
    </div>
  );
}
