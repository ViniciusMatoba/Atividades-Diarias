"use client";

import { useState } from "react";
import { Sparkles, ChevronUp, ChevronDown, Check, X, RotateCcw, HelpCircle } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { Direction, PokeGuessPublic, PokeGuessRow, PokeGuessState } from "@/games/pokeGuess";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { scoreToStars } from "@/lib/stars";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/auth";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import { PokedexCard, TypeBadge } from "@/components/PokedexCard";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { getPokemonArtworkUrl } from "@/games/pokeGuess/data/pokemon";
import { usePersistedGameState } from "@/lib/usePersistedGameState";

interface Props {
  dateKey: string;
  initialPublic: PokeGuessPublic;
  initialState: PokeGuessState;
  mode: "daily" | "infinite";
}

function Arrow({ dir }: { dir: Direction }) {
  if (dir === "eq") return <Check size={12} aria-label="igual" />;
  return dir === "up" ? (
    <ChevronUp size={12} aria-label="a resposta é maior" />
  ) : (
    <ChevronDown size={12} aria-label="a resposta é menor" />
  );
}

function Chip({ label, value, match, dir }: { label: string; value: string; match?: boolean; dir?: Direction }) {
  const cls = match ? "bg-[var(--color-success)] text-black/90 font-bold shadow-sm" : "gd-surface-2 gd-text";
  return (
    <div className={`flex flex-col items-center rounded-xl px-1.5 py-1.5 text-center transition-all ${cls}`}>
      <span className="text-[9px] uppercase font-extrabold opacity-75">{label}</span>
      <span className="flex items-center gap-0.5 text-[11px] font-bold leading-tight">
        {value}
        {dir && <Arrow dir={dir} />}
      </span>
    </div>
  );
}

function GuessRow({ row }: { row: PokeGuessRow }) {
  return (
    <div className={`gd-pop rounded-2xl border p-3 transition-all ${row.correct ? "border-[var(--color-success)] bg-[var(--color-success)]/10 shadow-lg" : "gd-border gd-surface"}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-black gd-text">
          {row.correct ? (
            <Check size={18} className="text-[var(--color-success)]" aria-hidden />
          ) : (
            <X size={18} className="gd-muted" aria-hidden />
          )}
          {row.name}
        </p>
        <div className="flex gap-1.5">
          <TypeBadge type={row.type1.value} />
          {row.type2.value && <TypeBadge type={row.type2.value} />}
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        <Chip label="Tipo1" value={row.type1.value} match={row.type1.match} />
        <Chip label="Tipo2" value={row.type2.value ?? "—"} match={row.type2.match} />
        <Chip label="Cor" value={row.color.value} match={row.color.match} />
        <Chip label="Estág." value={String(row.stage.value)} dir={row.stage.dir} match={row.stage.dir === "eq"} />
        <Chip label="Alt." value={`${row.height.value}m`} dir={row.height.dir} match={row.height.dir === "eq"} />
        <Chip label="Peso" value={`${row.weight.value}kg`} dir={row.weight.dir} match={row.weight.dir === "eq"} />
      </div>
    </div>
  );
}

export function PokeGuessGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const { pub, state, updateGame, resetGame, userSeedId } = usePersistedGameState<PokeGuessPublic, PokeGuessState>(
    dateKey,
    "poke-guess",
    initialPublic,
    initialState,
  );
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guessedIds = new Set(pub.rows.map((r) => r.id));
  const options = pub.pokemonList.filter((p) => !guessedIds.has(p.id));

  async function onGuess() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const res = await submitGuess({
      gameId: "poke-guess",
      dateKey,
      state,
      guess: { pokemonId: selected },
      mode,
      userSeedId,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar.");
      return;
    }
    updateGame(res.public as PokeGuessPublic, res.state as PokeGuessState);
    setSelected("");
    if (res.recordedOfficial) void refresh();
  }

  function handleReset() {
    resetGame();
    setSelected("");
    setError(null);
  }

  const finalScore = pub.solved ? Math.round(1000 * (1 - (pub.rows.length - 1) / 8)) : 0;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-4 border gd-border shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-lg">
            <Sparkles size={24} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight gd-text">PokéGuess</h1>
            <p className="text-xs gd-muted">Descubra o Pokémon misterioso de hoje</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3.5 py-1.5 text-center shadow-sm">
          <span className="block text-[10px] uppercase font-extrabold gd-muted">Tentativas</span>
          <span className="text-base font-black text-[var(--color-pokemon)]">{pub.guessesRemaining}</span>
        </div>
      </header>

      {/* Card da Silhueta Misteriosa */}
      <div className="relative overflow-hidden rounded-2xl border gd-border bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/90 p-5 text-center shadow-xl">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-3 flex size-36 items-center justify-center rounded-2xl bg-black/40 border border-white/10 p-3 shadow-inner">
            {pub.answer ? (
              <img
                src={getPokemonArtworkUrl(pub.answer.pokedexId)}
                alt={pub.answer.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-pulse"
              />
            ) : (
              <div className="relative size-full flex items-center justify-center">
                <img
                  src={getPokemonArtworkUrl(25)} // Silhueta ilustrativa inicial
                  alt="Pokémon Misterioso"
                  className="max-h-full max-w-full object-contain filter brightness-0 invert opacity-40 blur-[1px]"
                />
                <HelpCircle size={36} className="absolute text-yellow-400 animate-bounce drop-shadow" />
              </div>
            )}
          </div>
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            {pub.finished ? (pub.solved ? "Pokémon Identificado!" : "Pokémon Revelado") : "Quem é esse Pokémon?"}
          </p>
        </div>
      </div>

      {pub.rows.length > 0 && (
        <div className="space-y-2.5">
          {pub.rows.map((row) => (
            <GuessRow key={row.id} row={row} />
          ))}
          <p className="text-center text-[11px] gd-muted">
            Setas indicam se o Pokémon correto tem atributo maior (↑) ou menor (↓).
          </p>
        </div>
      )}

      {error && (
        <p className="text-center text-sm font-bold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {!pub.finished ? (
        <div className="space-y-3 rounded-2xl border gd-border gd-surface p-4 shadow-md">
          <label className="block text-sm font-bold gd-text">
            Digite o nome do Pokémon:
          </label>
          <AutocompleteInput
            options={options.map((p) => ({
              id: p.id,
              label: p.name,
              sublabel: `#${String(p.pokedexId).padStart(3, "0")} · Gen ${p.generation}`,
            }))}
            value={selected}
            onChange={(id) => setSelected(id)}
            placeholder="Digite para buscar Pokémon (ex: Pikachu, Charizard...)"
          />
          <Button onClick={onGuess} disabled={!selected || busy} size="lg" className="w-full font-bold shadow-md">
            {busy ? "Enviando palpite…" : "Confirmar Palpite"}
          </Button>
        </div>
      ) : (
        <Card className="gd-bounce-in space-y-4 border-2 border-[var(--color-pokemon)]/50 p-5 text-center shadow-xl">
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-[var(--color-pokemon)]/20 px-3 py-1 text-xs font-bold text-[var(--color-pokemon)]">
              {pub.solved ? "🎉 Vitória Sensacional!" : "🎮 Fim de Jogo"}
            </span>
            <h2 className="text-2xl font-black tracking-tight gd-text">
              {pub.solved ? "Você Desvendou o Pokémon!" : "Não foi dessa vez!"}
            </h2>
          </div>

          {pub.answer && <PokedexCard pokemon={pub.answer} />}

          <div className="flex flex-col items-center gap-1.5 pt-2">
            <StarRating value={scoreToStars(finalScore)} size={28} />
            <p className="text-sm font-black gd-text">{finalScore} pontos obtidos</p>
          </div>

          <Button variant="secondary" onClick={handleReset} className="w-full font-bold">
            <RotateCcw size={18} aria-hidden /> Reiniciar (modo treino)
          </Button>
        </Card>
      )}
    </div>
  );
}
