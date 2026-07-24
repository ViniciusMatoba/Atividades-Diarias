"use client";

import { useState } from "react";
import { MapPin, RotateCcw, BookOpen, Check } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { WorldPinPublic, WorldPinState, WorldPinGuessRow } from "@/games/worldPin";
import { getPinFlagUrl } from "@/games/worldPin/data/pinCountries";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { scoreToStars } from "@/lib/stars";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/auth";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import { usePersistedGameState } from "@/lib/usePersistedGameState";

interface Props {
  dateKey: string;
  initialPublic: WorldPinPublic;
  initialState: WorldPinState;
  mode: "daily" | "infinite";
}

function GuessRow({ row }: { row: WorldPinGuessRow }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${
        row.correct ? "border-[var(--color-success)] bg-[var(--color-success)]/10" : "gd-border gd-surface"
      }`}
    >
      {row.code ? (
        <img
          src={getPinFlagUrl(row.code)}
          alt={`Bandeira de ${row.name}`}
          className="size-7 shrink-0 rounded object-cover"
        />
      ) : null}
      <span className="flex-1 truncate text-sm font-bold gd-text">{row.name}</span>
      {row.correct ? (
        <span className="flex items-center gap-1 text-sm font-bold text-[var(--color-success)]">
          <Check size={16} aria-hidden /> Acertou!
        </span>
      ) : (
        <span className="shrink-0 rounded-lg gd-surface-2 px-2 py-1 text-xs font-bold text-[var(--color-warning)]">
          {row.distanceKm.toLocaleString("pt-BR")} km
        </span>
      )}
    </div>
  );
}

import { WorldPinMap } from "./WorldPinMap";

export function WorldPinGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const { pub, state, updateGame, resetGame } = usePersistedGameState<WorldPinPublic, WorldPinState>(
    dateKey,
    "world-pin",
    initialPublic,
    initialState,
  );
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guessedIds = new Set(pub.guesses.map((g) => g.id));
  const options = pub.countryList
    .filter((c) => !guessedIds.has(c.id))
    .map((c) => ({ id: c.id, label: c.name }));

  const attempts = pub.guesses.length;
  const finalScore = pub.solved ? Math.round(1000 * (1 - (attempts - 1) / 6)) : 0;

  async function onGuess() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const res = await submitGuess({
      gameId: "world-pin",
      dateKey,
      state,
      guess: { countryId: selected },
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar palpite.");
      return;
    }
    updateGame(res.public as WorldPinPublic, res.state as WorldPinState);
    setSelected("");
    if (res.recordedOfficial) void refresh();
  }

  function reset() {
    resetGame();
    setSelected("");
    setError(null);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-geo)] text-black/90 shadow-md">
            <MapPin size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">Pin no Globo</h1>
            <p className="text-xs gd-muted">Que país está marcado pelo pino vermelho?</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Tentativas</span>
          <span className="text-base font-black text-[var(--color-geo)]">{pub.guessesRemaining}</span>
        </div>
      </header>

      {/* Mapa-múndi interativo com zoom, navegação por arraste e fronteiras vetoriais dos países */}
      <WorldPinMap
        pin={pub.pin}
        label={pub.finished && pub.answer ? pub.answer.name : "?"}
      />

      {error && (
        <p className="text-center text-sm font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {/* Palpites anteriores */}
      {pub.guesses.length > 0 && (
        <div className="space-y-2">
          {pub.guesses.map((row) => (
            <GuessRow key={row.id} row={row} />
          ))}
        </div>
      )}

      {!pub.finished ? (
        <div className="space-y-2.5">
          <AutocompleteInput
            options={options}
            value={selected}
            onChange={setSelected}
            placeholder="Digite o nome do país…"
            disabled={busy}
          />
          <Button onClick={onGuess} disabled={!selected || busy} size="lg" className="w-full font-bold shadow-md">
            {busy ? "Enviando…" : "Adivinhar país"}
          </Button>
        </div>
      ) : (
        pub.answer && (
          <Card className="gd-bounce-in space-y-4 border-2 border-[var(--color-geo)]/50 p-5 text-center shadow-xl">
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-[var(--color-geo)]/20 px-3 py-1 text-xs font-bold text-[var(--color-geo)]">
                {pub.solved ? "🎯 Você acertou!" : "📍 País Revelado"}
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight gd-text">
                {pub.solved ? `Em ${attempts} tentativa(s)!` : "Não foi dessa vez"}
              </h2>
            </div>

            <div className="rounded-2xl border gd-border gd-surface-2 p-4 text-left space-y-3">
              <div className="flex items-center gap-4">
                {pub.answer.code && (
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl border gd-border shadow-md">
                    <img
                      src={getPinFlagUrl(pub.answer.code)}
                      alt={`Bandeira de ${pub.answer.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-[var(--color-geo)] uppercase tracking-wider">
                    Geografia &amp; Fatos
                  </span>
                  <h3 className="text-xl font-black gd-text">{pub.answer.name}</h3>
                </div>
              </div>

              {pub.answer.curiosity && (
                <div className="rounded-xl bg-black/20 p-3 space-y-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-[var(--color-geo)]">
                    <BookOpen size={13} /> Fato da Região
                  </span>
                  <p className="text-xs leading-relaxed gd-text font-medium">{pub.answer.curiosity}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 pt-2">
              <StarRating value={scoreToStars(finalScore)} size={28} />
              <p className="text-sm font-extrabold gd-text">{finalScore} pontos obtidos</p>
            </div>

            <Button variant="secondary" onClick={reset} className="w-full font-bold">
              <RotateCcw size={18} aria-hidden /> Jogar de novo (modo treino)
            </Button>
          </Card>
        )
      )}
    </div>
  );
}
