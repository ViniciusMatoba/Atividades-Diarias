"use client";

import { Heart, Sparkles } from "lucide-react";
import { PokedexCard } from "@/components/PokedexCard";
import { Button } from "@/components/ui/Button";
import type { Pokemon } from "@/games/pokeGuess/data/pokemon";
import type { UserDiscoveryState } from "../types";

interface Props {
  pokemon: Pokemon;
  state?: UserDiscoveryState;
  onToggleFavorite: () => void;
}

export function PokemonDiscoveryCard({ pokemon, state, onToggleFavorite }: Props) {
  const isFav = !!state?.isFavorite;

  return (
    <div className="rounded-2xl border-2 border-[var(--color-pokemon)]/40 gd-surface p-4 space-y-4 shadow-xl gd-bounce-in">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-pokemon)]/20 px-3 py-1 text-xs font-extrabold text-[var(--color-pokemon)]">
          <Sparkles size={16} /> Pokémon do Dia Descoberto
        </span>
        <Button
          variant={isFav ? "primary" : "secondary"}
          size="sm"
          onClick={onToggleFavorite}
          className={`gap-1.5 font-bold ${isFav ? "bg-rose-500 hover:bg-rose-600 text-white border-none" : ""}`}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
          {isFav ? "Favoritado" : "Favoritar"}
        </Button>
      </div>

      <PokedexCard pokemon={pokemon} />

      {state?.userGuess && (
        <div className="rounded-xl bg-black/20 p-3 text-xs text-center gd-muted font-medium">
          Seu palpite foi: <span className="font-bold gd-text">&quot;{state.userGuess}&quot;</span> {state.isCorrect ? "✅ (Correto!)" : "💡 (Revelado)"}
        </div>
      )}
    </div>
  );
}
