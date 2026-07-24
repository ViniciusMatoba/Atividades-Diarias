"use client";

import { useState, useEffect } from "react";
import { Sparkles, Layers } from "lucide-react";
import { getDailyKey } from "@/lib/dailyKey";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState } from "@/components/ui/States";

import { getDailyDiscoveries } from "@/features/dailyDiscoveries/services/dailySelection";
import {
  getUserDiscoveryStates,
  revealDiscovery,
  toggleFavorite,
  toggleWatchlist,
  getAllFavorites,
  getAllWatchlist,
  getAllRevealedHistory,
} from "@/features/dailyDiscoveries/services/userDiscoveries";
import type { DailyDiscovery, UserDiscoveryState } from "@/features/dailyDiscoveries/types";

import { DiscoveryTeaserCard } from "@/features/dailyDiscoveries/ui/DiscoveryTeaserCard";
import { PokemonDiscoveryCard } from "@/features/dailyDiscoveries/ui/PokemonDiscoveryCard";
import { CountryDiscoveryCard } from "@/features/dailyDiscoveries/ui/CountryDiscoveryCard";
import { MovieSeriesDiscoveryCard } from "@/features/dailyDiscoveries/ui/MovieSeriesDiscoveryCard";
import { CollectionSection } from "@/features/dailyDiscoveries/ui/CollectionSection";
import { HistoryCalendar } from "@/features/dailyDiscoveries/ui/HistoryCalendar";
import { ShareDiscoveryButton } from "@/features/dailyDiscoveries/ui/ShareDiscoveryButton";

export default function DiscoveriesPage() {
  const todayKey = getDailyKey();
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  const [discoveries, setDiscoveries] = useState<DailyDiscovery[]>([]);
  const [userStates, setUserStates] = useState<Record<string, UserDiscoveryState>>({});
  const [allSaved, setAllSaved] = useState<UserDiscoveryState[]>([]);
  const [loading, setLoading] = useState(true);

  function loadData(dateKey: string) {
    setLoading(true);
    const disc = getDailyDiscoveries(dateKey);
    const states = getUserDiscoveryStates(dateKey);

    setDiscoveries(disc);
    setUserStates(states);

    // Carrega coleção completa (favoritos, watchlist e histórico)
    const favs = getAllFavorites();
    const watch = getAllWatchlist();
    const hist = getAllRevealedHistory();

    const mergedMap = new Map<string, UserDiscoveryState>();
    [...hist, ...favs, ...watch].forEach((s) => mergedMap.set(s.discoveryId, s));
    setAllSaved(Array.from(mergedMap.values()));

    setLoading(false);
  }

  useEffect(() => {
    loadData(selectedDateKey);
  }, [selectedDateKey]);

  function handleReveal(discovery: DailyDiscovery, userGuess?: string, isCorrect?: boolean) {
    const updated = revealDiscovery(discovery.id, discovery.dateKey, discovery.type, discovery.contentId, userGuess, isCorrect);
    setUserStates((prev) => ({ ...prev, [discovery.id]: updated }));
    loadData(selectedDateKey);
  }

  function handleFavorite(discovery: DailyDiscovery) {
    const updated = toggleFavorite(discovery.id, discovery.dateKey, discovery.type, discovery.contentId);
    setUserStates((prev) => ({ ...prev, [discovery.id]: updated }));
    loadData(selectedDateKey);
  }

  function handleWatchlist(discovery: DailyDiscovery) {
    const updated = toggleWatchlist(discovery.id, discovery.dateKey, discovery.type, discovery.contentId);
    setUserStates((prev) => ({ ...prev, [discovery.id]: updated }));
    loadData(selectedDateKey);
  }

  if (loading) return <LoadingState label="Carregando Descobertas do Dia…" />;

  const revealedCount = discoveries.filter((d) => userStates[d.id]?.revealedAt).length;

  return (
    <div className="space-y-5 pb-10">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-md">
            <Sparkles size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight gd-text">Descobertas do Dia</h1>
            <p className="text-xs gd-muted">Descubra · Salve · Colecione</p>
          </div>
        </div>

        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Reveladas</span>
          <span className="text-sm font-black text-[var(--color-primary)]">
            {revealedCount}/{discoveries.length}
          </span>
        </div>
      </header>

      {/* Seletor de Histórico por Data */}
      <HistoryCalendar currentDateKey={selectedDateKey} todayKey={todayKey} onSelectDate={setSelectedDateKey} />

      {/* Card de Progresso */}
      <Card className="gd-pop space-y-2 bg-gradient-to-r from-[var(--color-primary)]/10 to-purple-500/10 border border-[var(--color-primary)]/30">
        <div className="flex items-center justify-between text-xs font-extrabold gd-text">
          <span className="flex items-center gap-1.5">
            <Layers size={15} className="text-[var(--color-primary)]" />
            Progresso de {selectedDateKey}
          </span>
          <span>{revealedCount} de {discoveries.length} conteúdos revelados</span>
        </div>
        <ProgressBar value={revealedCount / discoveries.length} label="" />
      </Card>

      {/* Lista das 3 Descobertas Diárias */}
      <div className="space-y-4">
        {discoveries.map((discovery) => {
          const state = userStates[discovery.id];
          const isRevealed = !!state?.revealedAt;

          if (!isRevealed) {
            return (
              <DiscoveryTeaserCard
                key={discovery.id}
                discovery={discovery}
                onReveal={(guess, isCorrect) => handleReveal(discovery, guess, isCorrect)}
              />
            );
          }

          if (discovery.type === "pokemon") {
            return (
              <PokemonDiscoveryCard
                key={discovery.id}
                pokemon={discovery.content}
                state={state}
                onToggleFavorite={() => handleFavorite(discovery)}
              />
            );
          }

          if (discovery.type === "country") {
            return (
              <CountryDiscoveryCard
                key={discovery.id}
                country={discovery.content}
                state={state}
                onToggleFavorite={() => handleFavorite(discovery)}
              />
            );
          }

          return (
            <MovieSeriesDiscoveryCard
              key={discovery.id}
              media={discovery.content}
              state={state}
              onToggleFavorite={() => handleFavorite(discovery)}
              onToggleWatchlist={() => handleWatchlist(discovery)}
            />
          );
        })}
      </div>

      {/* Botão de Compartilhar */}
      <ShareDiscoveryButton dateKey={selectedDateKey} discoveries={discoveries} userStates={userStates} />

      {/* Minha Coleção */}
      <CollectionSection allSavedStates={allSaved} />
    </div>
  );
}
