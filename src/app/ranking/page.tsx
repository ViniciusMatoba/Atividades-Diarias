"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { MOCK_RANKING_DAILY, MOCK_RANKING_WEEKLY, type RankingRow } from "@/lib/mock";

type Tab = "daily" | "weekly";

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const rows: RankingRow[] = tab === "daily" ? MOCK_RANKING_DAILY : MOCK_RANKING_WEEKLY;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold gd-text">Ranking</h1>
        <p className="text-sm gd-muted">
          {tab === "daily"
            ? "Soma da primeira pontuação oficial de hoje."
            : "Soma das pontuações oficiais da semana."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-1 rounded-xl gd-surface-2 p-1" role="tablist">
        {(["daily", "weekly"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-9 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-[var(--color-primary)] text-white" : "gd-muted"
            }`}
          >
            {t === "daily" ? "Diário" : "Semanal"}
          </button>
        ))}
      </div>

      <ol className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.rank}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              r.isCurrentUser
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                : "gd-border gd-surface"
            }`}
          >
            <span className="w-6 text-center font-bold gd-muted">
              {r.rank === 1 ? <Crown className="mx-auto text-[var(--color-warning)]" size={18} aria-hidden /> : r.rank}
            </span>
            <span className="flex-1 truncate font-medium gd-text">
              {r.username}
              {r.isCurrentUser && <span className="ml-1 text-xs gd-muted">(você)</span>}
            </span>
            <span className="font-semibold gd-text">{r.score.toLocaleString("pt-BR")}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
