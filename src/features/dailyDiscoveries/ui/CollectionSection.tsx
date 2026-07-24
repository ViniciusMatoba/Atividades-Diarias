"use client";

import { useState } from "react";
import { Heart, Bookmark, FolderHeart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { UserDiscoveryState } from "../types";

interface Props {
  allSavedStates: UserDiscoveryState[];
}

type FilterTab = "all" | "pokemon" | "country" | "movies" | "favorites" | "watchlist";

export function CollectionSection({ allSavedStates }: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const revealedStates = allSavedStates.filter((s) => s.revealedAt || s.isFavorite || s.inWatchlist);

  const filtered = revealedStates.filter((s) => {
    if (activeTab === "pokemon") return s.type === "pokemon";
    if (activeTab === "country") return s.type === "country";
    if (activeTab === "movies") return s.type === "movie" || s.type === "series";
    if (activeTab === "favorites") return s.isFavorite;
    if (activeTab === "watchlist") return s.inWatchlist;
    return true;
  });

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderHeart className="text-[var(--color-primary)]" size={22} />
          <div>
            <h2 className="text-lg font-black tracking-tight gd-text">Minha Coleção</h2>
            <p className="text-xs gd-muted">{revealedStates.length} itens descobertos e salvos</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-3 py-1.5 transition-all whitespace-nowrap ${
            activeTab === "all" ? "bg-[var(--color-primary)] text-white" : "gd-surface-2 gd-muted hover:gd-text"
          }`}
        >
          Todos ({revealedStates.length})
        </button>
        <button
          onClick={() => setActiveTab("pokemon")}
          className={`rounded-full px-3 py-1.5 transition-all whitespace-nowrap ${
            activeTab === "pokemon" ? "bg-[var(--color-pokemon)] text-black" : "gd-surface-2 gd-muted hover:gd-text"
          }`}
        >
          ⚡ Pokémon
        </button>
        <button
          onClick={() => setActiveTab("country")}
          className={`rounded-full px-3 py-1.5 transition-all whitespace-nowrap ${
            activeTab === "country" ? "bg-[var(--color-geo)] text-black" : "gd-surface-2 gd-muted hover:gd-text"
          }`}
        >
          🌍 Países
        </button>
        <button
          onClick={() => setActiveTab("movies")}
          className={`rounded-full px-3 py-1.5 transition-all whitespace-nowrap ${
            activeTab === "movies" ? "bg-[var(--color-movies)] text-white" : "gd-surface-2 gd-muted hover:gd-text"
          }`}
        >
          🎬 Filmes/Séries
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`rounded-full px-3 py-1.5 transition-all whitespace-nowrap ${
            activeTab === "favorites" ? "bg-rose-500 text-white" : "gd-surface-2 gd-muted hover:gd-text"
          }`}
        >
          ❤️ Favoritos ({allSavedStates.filter((s) => s.isFavorite).length})
        </button>
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`rounded-full px-3 py-1.5 transition-all whitespace-nowrap ${
            activeTab === "watchlist" ? "bg-amber-400 text-black" : "gd-surface-2 gd-muted hover:gd-text"
          }`}
        >
          🔖 Quero Assistir ({allSavedStates.filter((s) => s.inWatchlist).length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center p-6 space-y-2 text-xs gd-muted">
          <p className="font-semibold">Nenhum item encontrado nesta categoria da coleção.</p>
          <p>Revele descobertas diárias ou marque favoritos para preencher sua coleção!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map((item) => (
            <div key={item.discoveryId} className="rounded-xl border gd-border gd-surface p-3 space-y-2 shadow-sm text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  {item.type === "pokemon" ? "⚡ Pokémon" : item.type === "country" ? "🌍 País" : "🎬 Mídia"}
                </span>
                <div className="flex gap-1">
                  {item.isFavorite && <Heart size={13} className="text-rose-500 fill-rose-500" />}
                  {item.inWatchlist && <Bookmark size={13} className="text-amber-400 fill-amber-400" />}
                </div>
              </div>
              <p className="text-sm font-extrabold gd-text truncate">{item.contentId}</p>
              <p className="text-[10px] gd-muted">Data: {item.dateKey}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
