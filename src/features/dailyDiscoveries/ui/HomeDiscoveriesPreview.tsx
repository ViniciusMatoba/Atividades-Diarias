"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { DailyDiscovery, UserDiscoveryState } from "../types";

interface Props {
  discoveries: DailyDiscovery[];
  userStates: Record<string, UserDiscoveryState>;
}

export function HomeDiscoveriesPreview({ discoveries, userStates }: Props) {
  const revealedCount = discoveries.filter((d) => userStates[d.id]?.revealedAt).length;

  return (
    <Card className="gd-pop border-2 border-[var(--color-primary)]/30 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
            <Sparkles size={18} aria-hidden />
          </div>
          <div>
            <h2 className="font-extrabold text-base tracking-tight gd-text">Descobertas de hoje</h2>
            <p className="text-xs gd-muted">{revealedCount} de {discoveries.length} reveladas</p>
          </div>
        </div>
        <Link
          href="/discoveries"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
        >
          Ver todas <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      <ProgressBar value={revealedCount / discoveries.length} label="" />

      <div className="grid grid-cols-3 gap-2 pt-1">
        {discoveries.map((d) => {
          const isRevealed = !!userStates[d.id]?.revealedAt;
          const displayTitle = "name" in d.content ? d.content.name : d.content.title;
          return (
            <Link
              key={d.id}
              href="/discoveries"
              className={`flex flex-col items-center justify-between rounded-xl border p-2.5 text-center transition-all ${
                isRevealed
                  ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10"
                  : "gd-border gd-surface-2 hover:border-[var(--color-primary)]/40"
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {isRevealed ? (
                  <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                ) : (
                  <Circle size={13} className="gd-muted" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider gd-muted">
                  {d.type === "pokemon" ? "Pokémon" : d.type === "country" ? "País" : "Filme/Série"}
                </span>
              </div>
              <p className="text-xs font-bold gd-text line-clamp-1">
                {isRevealed ? displayTitle : "🔒 Pista disponível"}
              </p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
