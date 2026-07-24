"use client";

import { useState } from "react";
import { Shuffle, Check, X, RotateCcw, Sparkles, KeyRound } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { WordScramblePublic, WordScrambleState } from "@/games/wordScramble";
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
  initialPublic: WordScramblePublic;
  initialState: WordScrambleState;
  mode: "daily" | "infinite";
}

export function WordScrambleGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const { pub, state, updateGame, resetGame } = usePersistedGameState<WordScramblePublic, WordScrambleState>(
    dateKey,
    "word-scramble",
    initialPublic,
    initialState,
  );
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guessedIds = new Set(pub.guesses.map((g) => g.id));
  const options = pub.wordList
    .filter((w) => !guessedIds.has(w.name))
    .map((w) => ({ id: w.name, label: w.name }));

  const attempts = pub.guesses.length;
  const finalScore = pub.solved ? Math.round(1000 * (1 - (attempts - 1) / 5)) : 0;

  async function onGuess() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const res = await submitGuess({
      gameId: "word-scramble",
      dateKey,
      state,
      guess: { word: selected },
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar palpite.");
      return;
    }
    updateGame(res.public as WordScramblePublic, res.state as WordScrambleState);
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
      <header className="flex items-center justify-between rounded-2xl gd-glass p-3.5 border gd-border shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500 text-white font-black shadow-md">
            <Shuffle size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">Anagrama Geek</h1>
            <p className="text-xs gd-muted">Desembaralhe as letras da palavra secreta</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Tentativas</span>
          <span className="text-base font-black text-indigo-400">{pub.guessesRemaining}</span>
        </div>
      </header>

      {/* Card das Letras Embaralhadas */}
      <div className="relative rounded-2xl border gd-border bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 p-6 text-center shadow-xl">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
          Palavra Embaralhada ({pub.length} Letras)
        </span>

        {/* Tiles das Letras */}
        <div className="my-4 flex flex-wrap items-center justify-center gap-2">
          {pub.scrambled.split("").map((letter, i) => (
            <div
              key={i}
              className="flex size-11 items-center justify-center rounded-xl border border-indigo-400/40 bg-indigo-600/20 text-xl font-black text-white shadow-lg transition-transform hover:scale-105"
            >
              {letter}
            </div>
          ))}
        </div>

        {pub.revealedPrefix.length > 0 && (
          <div className="mb-2 text-xs font-extrabold text-amber-300">
            💡 Dica Extra: Começa com &quot;{pub.revealedPrefix}&quot;…
          </div>
        )}

        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-300">
          <Sparkles size={14} /> Categoria: {pub.category} · Dica: {pub.hint}
        </div>
      </div>

      {pub.guesses.length > 0 && (
        <div className="space-y-1.5">
          {pub.guesses.map((g) => (
            <div
              key={g.id}
              className={`flex items-center justify-between rounded-xl border p-2.5 text-sm font-bold ${
                g.correct ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-white" : "gd-border gd-surface gd-muted"
              }`}
            >
              <span>{g.name}</span>
              {g.correct ? <Check size={16} className="text-emerald-400" /> : <X size={16} className="gd-muted" />}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-center text-sm font-bold text-[var(--color-danger)]">{error}</p>}

      {!pub.finished ? (
        <div className="space-y-2.5">
          <AutocompleteInput
            options={options}
            value={selected}
            onChange={setSelected}
            placeholder="Digite a palavra correta..."
            disabled={busy}
          />
          <Button onClick={onGuess} disabled={!selected || busy} size="lg" className="w-full font-bold shadow-md">
            {busy ? "Enviando…" : "Confirmar Palavra"}
          </Button>
        </div>
      ) : (
        pub.answer && (
          <Card className="gd-bounce-in space-y-4 border-2 border-indigo-500/50 p-5 text-center shadow-xl">
            <div className="flex flex-col items-center gap-1">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 flex items-center gap-1">
                <KeyRound size={14} /> {pub.solved ? "🎉 Palavra Desembaralhada!" : "🎮 Fim de Jogo"}
              </span>
              <h2 className="text-3xl font-black gd-text tracking-widest">{pub.answer.word}</h2>
              <p className="text-xs gd-muted">Categoria: {pub.answer.category}</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 pt-2">
              <StarRating value={scoreToStars(finalScore)} size={28} />
              <p className="text-sm font-extrabold gd-text">{finalScore} pontos obtidos</p>
            </div>

            <Button variant="secondary" onClick={reset} className="w-full font-bold">
              <RotateCcw size={18} /> Jogar de novo (modo treino)
            </Button>
          </Card>
        )
      )}
    </div>
  );
}
