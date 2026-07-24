"use client";

import { Shield, Zap, Heart, Activity } from "lucide-react";
import { getPokemonArtworkUrl, type Pokemon } from "@/games/pokeGuess/data/pokemon";

interface PokedexCardProps {
  pokemon: Pokemon;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  Planta: "var(--color-type-planta)",
  Fogo: "var(--color-type-fogo)",
  Água: "var(--color-type-agua)",
  Elétrico: "var(--color-type-eletrico)",
  Gelo: "var(--color-type-gelo)",
  Lutador: "var(--color-type-lutador)",
  Venenoso: "var(--color-type-venenoso)",
  Terrestre: "var(--color-type-terrestre)",
  Voador: "var(--color-type-voador)",
  Psíquico: "var(--color-type-psiquico)",
  Inseto: "var(--color-type-inseto)",
  Pedra: "var(--color-type-pedra)",
  Fantasma: "var(--color-type-fantasma)",
  Dragão: "var(--color-type-dragao)",
  Normal: "var(--color-type-normal)",
};

export function TypeBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-[10px] opacity-40">—</span>;
  const bg = TYPE_COLORS[type] || "var(--color-surface-2)";
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
      style={{ backgroundColor: bg }}
    >
      {type}
    </span>
  );
}

export function StatBar({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const pct = Math.min(100, Math.round((value / 150) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-semibold gd-muted">
          {icon} {label}
        </span>
        <span className="font-bold gd-text">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full gd-surface-2">
        <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function PokedexCard({ pokemon, className = "" }: PokedexCardProps) {
  return (
    <div className={`rounded-2xl border gd-border gd-surface-2 p-4 text-left space-y-3 shadow-md ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0 rounded-xl bg-gradient-to-b from-amber-500/20 to-indigo-500/20 p-2 flex items-center justify-center border gd-border shadow-inner">
          <img
            src={getPokemonArtworkUrl(pokemon.pokedexId)}
            alt={pokemon.name}
            className="max-h-full max-w-full object-contain drop-shadow-md"
          />
        </div>
        <div>
          <span className="text-xs font-bold text-[var(--color-pokemon)]">
            #{String(pokemon.pokedexId).padStart(3, "0")} · {pokemon.generation}ª Geração
          </span>
          <h3 className="text-xl font-black gd-text">{pokemon.name}</h3>
          <div className="mt-1 flex gap-1.5">
            <TypeBadge type={pokemon.type1} />
            {pokemon.type2 && <TypeBadge type={pokemon.type2} />}
          </div>
          <div className="mt-1 text-[11px] font-semibold gd-muted">
            Alt: {pokemon.heightM}m · Peso: {pokemon.weightKg}kg
          </div>
        </div>
      </div>

      {pokemon.description && (
        <div className="rounded-xl bg-black/20 p-3 text-xs italic gd-muted leading-relaxed">
          &quot;{pokemon.description}&quot;
        </div>
      )}

      {pokemon.stats && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-bold uppercase tracking-wider gd-muted">Atributos de Combate</p>
          <div className="grid grid-cols-2 gap-2">
            <StatBar label="HP" value={pokemon.stats.hp} icon={<Heart size={12} />} color="#ff7675" />
            <StatBar label="Ataque" value={pokemon.stats.atk} icon={<Zap size={12} />} color="#fdcb6e" />
            <StatBar label="Defesa" value={pokemon.stats.def} icon={<Shield size={12} />} color="#74b9ff" />
            <StatBar label="Velocidade" value={pokemon.stats.spd} icon={<Activity size={12} />} color="#55efc4" />
          </div>
        </div>
      )}
    </div>
  );
}
