"use client";

import { useState } from "react";
import { UserCheck, Check, X, RotateCcw, Sparkles, Shield, Calendar, Sparkle } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { GeekCharacterPublic, GeekCharacterState } from "@/games/geekCharacter";
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
  initialPublic: GeekCharacterPublic;
  initialState: GeekCharacterState;
  mode: "daily" | "infinite";
}

export function GeekCharacterGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const { pub, state, updateGame, resetGame } = usePersistedGameState<GeekCharacterPublic, GeekCharacterState>(
    dateKey,
    "geek-character",
    initialPublic,
    initialState,
  );
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guessedIds = new Set(pub.guesses.map((g) => g.id));
  const options = pub.characterList
    .filter((c) => !guessedIds.has(c.id))
    .map((c) => ({ id: c.id, label: c.name }));

  const attempts = pub.guesses.length;
  const finalScore = pub.solved ? Math.round(1000 * (1 - (attempts - 1) / 5)) : 0;

  async function onGuess() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const res = await submitGuess({
      gameId: "geek-character",
      dateKey,
      state,
      guess: { characterId: selected },
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar palpite.");
      return;
    }
    updateGame(res.public as GeekCharacterPublic, res.state as GeekCharacterState);
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
          <div className="flex size-11 items-center justify-center rounded-xl bg-violet-600 text-white font-black shadow-md">
            <UserCheck size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">Quem é o Personagem?</h1>
            <p className="text-xs gd-muted">Adivinhe o ícone da cultura pop pelas pistas</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Tentativas</span>
          <span className="text-base font-black text-violet-400">{pub.guessesRemaining}</span>
        </div>
      </header>

      {/* Card das Pistas e Atributos */}
      <div className="relative rounded-2xl border gd-border bg-gradient-to-br from-slate-950 via-violet-950/40 to-slate-900 p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-lg">
          <UserCheck size={32} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-bold my-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 flex items-center justify-center gap-1.5 text-violet-200">
            <Shield size={14} className="text-violet-400" /> {pub.franchise}
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 flex items-center justify-center gap-1.5 text-violet-200">
            <Sparkle size={14} className="text-violet-400" /> {pub.role}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-violet-300">
          <Sparkles size={14} /> Dica: {pub.hint} (<Calendar size={12} className="inline ml-1" /> Década de {pub.decade})
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
            placeholder="Digite o nome do personagem…"
            disabled={busy}
          />
          <Button onClick={onGuess} disabled={!selected || busy} size="lg" className="w-full font-bold shadow-md">
            {busy ? "Enviando…" : "Confirmar Personagem"}
          </Button>
        </div>
      ) : (
        pub.answer && (
          <Card className="gd-bounce-in space-y-4 border-2 border-violet-500/50 p-5 text-center shadow-xl">
            <div className="flex flex-col items-center gap-1">
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-400">
                {pub.solved ? "🎉 Personagem Revelado!" : "🎮 Fim de Jogo"}
              </span>
              <h2 className="text-3xl font-black gd-text">{pub.answer.name}</h2>
              <p className="text-xs gd-muted">{pub.answer.franchise} · {pub.answer.role}</p>
              <p className="text-xs text-violet-300 font-bold mt-1">Item: {pub.answer.signatureItem}</p>
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
