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
  const cls = match ? "bg-[var(--color-success)] text-black/80" : "gd-surface-2 gd-text";
  return (
    <div className={`flex flex-col items-center rounded-md px-1.5 py-1 text-center ${cls}`}>
      <span className="text-[9px] uppercase opacity-70">{label}</span>
      <span className="flex items-center gap-0.5 text-[11px] font-semibold leading-tight">
        {value}
        {dir && <Arrow dir={dir} />}
      </span>
    </div>
  );
}

function GuessRow({ row }: { row: PokeGuessRow }) {
  return (
    <div className={`rounded-xl border p-2 ${row.correct ? "border-[var(--color-success)]" : "gd-border gd-surface"}`}>
      <p className="mb-1.5 flex items-center gap-1 text-sm font-semibold gd-text">
        {row.correct ? (
          <Check size={14} className="text-[var(--color-success)]" aria-hidden />
        ) : (
          <X size={14} className="gd-muted" aria-hidden />
        )}
        {row.name}
      </p>
      <div className="grid grid-cols-6 gap-1">
        <Chip label="Tipo1" value={row.type1.value} match={row.type1.match} />
        <Chip label="Tipo2" value={row.type2.value ?? "—"} match={row.type2.match} />
        <Chip label="Cor" value={row.color.value} match={row.color.match} />
        <Chip label="Estág." value={String(row.stage.value)} dir={row.stage.dir} match={row.stage.dir === "eq"} />
        <Chip label="Alt." value={`${row.height.value}m`} dir={row.height.dir} match={row.height.dir === "eq"} />
        <Chip label="Peso" value={`${row.weight.value}`} dir={row.weight.dir} match={row.weight.dir === "eq"} />
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
      <header className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-pokemon)] text-black/80">
          <Sparkles aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold gd-text">PokéGuess</h1>
          <p className="text-xs gd-muted">1ª geração · {pub.guessesRemaining} tentativa(s)</p>
        </div>
      </header>

      {pub.rows.length > 0 && (
        <div className="space-y-2">
          {pub.rows.map((row) => (
            <GuessRow key={row.id} row={row} />
          ))}
          <p className="text-center text-[10px] gd-muted">
            Setas indicam se a resposta tem valor maior (↑) ou menor (↓); verde = atributo igual.
          </p>
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {!pub.finished ? (
        <div className="space-y-2">
          <label htmlFor="poke-select" className="block text-sm font-medium gd-text">
            Seu palpite
          </label>
          <select
            id="poke-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-11 w-full rounded-xl border gd-border gd-surface-2 px-3 text-sm gd-text outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <option value="">Escolha um Pokémon…</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button onClick={onGuess} disabled={!selected || busy} size="lg" className="w-full">
            {busy ? "Enviando…" : "Palpitar"}
          </Button>
        </div>
      ) : (
        <Card className="gd-pop space-y-3 text-center">
          <p className="text-lg font-bold gd-text">{pub.solved ? "Você acertou!" : "Não foi dessa vez"}</p>
          {pub.answer && (
            <p className="text-sm gd-muted">
              Resposta: <span className="font-semibold gd-text">{pub.answer.name}</span>
            </p>
          )}
          <div className="flex flex-col items-center gap-1">
            <StarRating value={scoreToStars(finalScore)} size={24} />
            <p className="text-sm gd-muted">{finalScore} pontos</p>
          </div>
          <Button variant="secondary" onClick={reset} className="w-full">
            <RotateCcw size={16} aria-hidden /> Jogar de novo (não conta oficial)
          </Button>
        </Card>
      )}
    </div>
  );
}
