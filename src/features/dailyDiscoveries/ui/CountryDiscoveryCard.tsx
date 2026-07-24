"use client";

import { Heart, MapPin, Globe, BookOpen, Users, MessageSquare } from "lucide-react";
import { getFlagUrl, type Country } from "@/games/mysteryCountry/data/countries";
import { Button } from "@/components/ui/Button";
import type { UserDiscoveryState } from "../types";

interface Props {
  country: Country;
  state?: UserDiscoveryState;
  onToggleFavorite: () => void;
}

export function CountryDiscoveryCard({ country, state, onToggleFavorite }: Props) {
  const isFav = !!state?.isFavorite;

  return (
    <div className="rounded-2xl border-2 border-[var(--color-geo)]/40 gd-surface p-4 space-y-4 shadow-xl gd-bounce-in">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-geo)]/20 px-3 py-1 text-xs font-extrabold text-[var(--color-geo)]">
          <Globe size={16} /> País do Dia Descoberto
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

      <div className="rounded-2xl border gd-border gd-surface-2 p-4 text-left space-y-3 shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={getFlagUrl(country.code)}
            alt={`Bandeira de ${country.name}`}
            className="h-16 w-24 rounded-lg object-cover shadow-md border gd-border"
          />
          <div>
            <span className="text-xs font-bold text-[var(--color-geo)] uppercase tracking-wider">
              {country.continent}
            </span>
            <h3 className="text-xl font-black gd-text">{country.name}</h3>
            <p className="text-xs font-bold gd-muted flex items-center gap-1 mt-0.5">
              <MapPin size={13} /> Capital: {country.capital}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="rounded-xl bg-black/20 p-2.5 space-y-0.5">
            <span className="flex items-center gap-1 font-bold gd-muted text-[10px] uppercase">
              <Users size={12} /> Faixa Populacional
            </span>
            <p className="font-extrabold gd-text">{country.populationBucket}</p>
          </div>
          <div className="rounded-xl bg-black/20 p-2.5 space-y-0.5">
            <span className="flex items-center gap-1 font-bold gd-muted text-[10px] uppercase">
              <MessageSquare size={12} /> Idioma Oficial
            </span>
            <p className="font-extrabold gd-text">{country.languages.join(", ")}</p>
          </div>
        </div>

        {country.neighbors.length > 0 && (
          <div className="text-xs gd-muted border-t border-white/5 pt-2">
            <span className="font-bold">Fronteiras: </span>
            {country.neighbors.join(", ")}
          </div>
        )}

        {country.curiosity && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-200/90 leading-relaxed space-y-1">
            <p className="font-bold uppercase text-[10px] tracking-wider text-amber-400 flex items-center gap-1">
              <BookOpen size={13} /> Ficha Cultural & Curiosidade
            </p>
            <p>{country.curiosity}</p>
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
