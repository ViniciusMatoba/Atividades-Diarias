"use client";

import { useState } from "react";
import { Sparkles, ChevronUp, ChevronDown, Check, X, RotateCcw } from "lucide-react";
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
  const cls = match ? "bg-[var(--color-success)] text-black/90 font-bold" : "gd-surface-2 gd-text";
  return (
    <div className={`flex flex-col items-center rounded-lg px-1.5 py-1 text-center transition-all ${cls}`}>
      <span className="text-[9px] uppercase opacity-75">{label}</span>
      <span className="flex items-center gap-0.5 text-[11px] font-semibold leading-tight">
        {value}
        {dir && <Arrow dir={dir} />}
      </span>
    </div>
  );
}

function GuessRow({ row }: { row: PokeGuessRow }) {
  return (
    <div className={`gd-pop rounded-xl border p-2.5 transition-all ${row.correct ? "border-[var(--color-success)] bg-[var(--color-success)]/10" : "gd-border gd-surface"}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold gd-text">
          {row.correct ? (
            <Check size={16} className="text-[var(--color-success)]" aria-hidden />
          ) : (
            <X size={16} className="gd-muted" aria-hidden />
          )}
          {row.name}
        </p>
        <div className="flex gap-1">
          <TypeBadge type={row.type1.value} />
          {row.type2.value && <TypeBadge type={row.type2.value} />}
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1">
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
  const [pub, setPub] = useState(initialPublic);
  const [state, setState] = useState(initialState);
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
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar.");
      return;
    }
    setPub(res.public as PokeGuessPublic);
    setState(res.state as PokeGuessState);
    setSelected("");
    if (res.recordedOfficial) void refresh();
  }

  function reset() {
    setPub(initialPublic);
    setState(initialState);
    setSelected("");
    setError(null);
  }

  const finalScore = pub.solved ? Math.round(1000 * (1 - (pub.rows.length - 1) / 8)) : 0;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-pokemon)] text-black/90 shadow-md">
            <Sparkles size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">PokéGuess</h1>
            <p className="text-xs gd-muted">Adivinhe o Pokémon pelos atributos</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Tentativas</span>
          <span className="text-sm font-extrabold text-[var(--color-pokemon)]">{pub.guessesRemaining}</span>
        </div>
      </header>

      {pub.rows.length > 0 && (
        <div className="space-y-2.5">
          {pub.rows.map((row) => (
            <GuessRow key={row.id} row={row} />
          ))}
          <p className="text-center text-[11px] gd-muted">
            Setas indicam se o Pokémon correto tem valor maior (↑) ou menor (↓).
          </p>
        </div>
      )}

      {error && (
        <p className="text-center text-sm font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {!pub.finished ? (
        <div className="space-y-3 rounded-2xl border gd-border gd-surface p-4">
          <label htmlFor="poke-select" className="block text-sm font-bold gd-text">
            Escolha o seu palpite:
          </label>
          <select
            id="poke-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-12 w-full rounded-xl border gd-border gd-surface-2 px-3.5 text-sm font-semibold gd-text outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-pokemon)]"
          >
            <option value="">Selecione um Pokémon ({options.length} disponíveis)…</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                #{String(p.pokedexId).padStart(3, "0")} {p.name} (Gen {p.generation})
              </option>
            ))}
          </select>
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
            <h2 className="text-2xl font-extrabold tracking-tight gd-text">
              {pub.solved ? "Você Desvendou o Pokémon!" : "Não foi dessa vez!"}
            </h2>
          </div>

          {pub.answer && <PokedexCard pokemon={pub.answer} />}

          <div className="flex flex-col items-center gap-1.5 pt-2">
            <StarRating value={scoreToStars(finalScore)} size={28} />
            <p className="text-sm font-extrabold gd-text">{finalScore} pontos obtidos</p>
          </div>

          <Button variant="secondary" onClick={reset} className="w-full font-bold">
            <RotateCcw size={18} aria-hidden /> Jogar de novo (modo treino)
          </Button>
        </Card>
      )}
    </div>
  );
}

