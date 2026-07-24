"use client";

import { useState } from "react";
import { Grid3x3, RotateCcw, BookOpen } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { GeekConnectionsPublic, GeekConnectionsState } from "@/games/geekConnections";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { scoreToStars } from "@/lib/stars";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/auth";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";

interface Props {
  dateKey: string;
  initialPublic: GeekConnectionsPublic;
  initialState: GeekConnectionsState;
  mode: "daily" | "infinite";
}

const GROUP_STYLES = [
  { bg: "bg-amber-400 text-slate-950 border-amber-300", badge: "Grupo Amarelo" },
  { bg: "bg-emerald-400 text-slate-950 border-emerald-300", badge: "Grupo Verde" },
  { bg: "bg-sky-400 text-slate-950 border-sky-300", badge: "Grupo Azul" },
  { bg: "bg-purple-400 text-slate-950 border-purple-300", badge: "Grupo Roxo" },
];

export function GeekConnectionsGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const [pub, setPub] = useState(initialPublic);
  const [state, setState] = useState(initialState);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  }

  async function confirm() {
    if (selected.length !== 4 || busy) return;
    setBusy(true);
    setMessage(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const res = await submitGuess({
      gameId: "geek-connections",
      dateKey,
      state,
      guess: { terms: selected },
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setMessage(res.error ?? "Erro ao enviar.");
      triggerShake();
      return;
    }
    const newPub = res.public as GeekConnectionsPublic;
    if (newPub.solved.length === pub.solved.length && !newPub.won) {
      triggerShake();
    }
    setPub(newPub);
    setState(res.state as GeekConnectionsState);
    setSelected([]);
    setMessage(res.feedback?.message ?? null);
    if (res.recordedOfficial) void refresh();
  }

  function triggerShake() {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }

  function reset() {
    setPub(initialPublic);
    setState(initialState);
    setSelected([]);
    setMessage(null);
    setIsShaking(false);
  }

  const finalScore = Math.round(
    (pub.solved.length / 4) * 1000 * Math.max(0.4, 1 - pub.mistakes * 0.15),
  );

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-geek)] text-black/90 shadow-md">
            <Grid3x3 size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">Geek Connections</h1>
            <p className="text-xs gd-muted">Agrupe os 16 termos em 4 categorias</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Resolvidos</span>
          <span className="text-sm font-extrabold text-[var(--color-geek)]">{pub.solved.length}/4</span>
        </div>
      </header>

      {/* Grupos já resolvidos */}
      <div className="space-y-2.5">
        {pub.solved.map((g, i) => {
          const style = GROUP_STYLES[i % GROUP_STYLES.length]!;
          return (
            <div
              key={g.theme}
              className={`gd-pop rounded-2xl border p-4 shadow-md ${style.bg}`}
            >
              <h3 className="text-xs font-black uppercase tracking-wider opacity-85">{g.theme}</h3>
              <p className="mt-0.5 text-sm font-extrabold">{g.terms.map((t) => t.label).join(" · ")}</p>
              {g.explanation && (
                <p className="mt-2 text-xs font-medium opacity-90 border-t border-black/10 pt-1.5 flex items-center gap-1">
                  <BookOpen size={13} /> {g.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!pub.finished ? (
        <>
          <div className={`grid grid-cols-2 gap-2 ${isShaking ? "gd-shake" : ""}`}>
            {pub.remaining.map((t) => {
              const on = selected.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  aria-pressed={on}
                  className={`min-h-14 rounded-2xl border px-3 py-2.5 text-center text-sm font-bold transition-all shadow-sm ${
                    on
                      ? "border-[var(--color-geek)] bg-[var(--color-geek)] text-black scale-[0.98] shadow-md"
                      : "gd-border gd-surface-2 gd-text hover:border-[var(--color-geek)]/50"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1" aria-label={`${pub.mistakesRemaining} erros restantes`}>
            <span className="text-xs font-bold gd-muted uppercase tracking-wider">Chances de erro:</span>
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`size-3 rounded-full transition-all ${
                  i < pub.mistakesRemaining ? "bg-[var(--color-danger)] shadow-sm" : "gd-surface-2 opacity-40"
                }`}
              />
            ))}
          </div>

          {message && (
            <p className="text-center text-sm font-semibold text-[var(--color-warning)]" role="status">
              {message}
            </p>
          )}

          <Button
            onClick={confirm}
            disabled={selected.length !== 4 || busy}
            size="lg"
            className="w-full font-bold shadow-md"
          >
            {busy ? "Validando grupo…" : `Confirmar Grupo (${selected.length}/4)`}
          </Button>
        </>
      ) : (
        <Card className="gd-bounce-in space-y-4 border-2 border-[var(--color-geek)]/50 p-5 shadow-xl">
          <div className="text-center space-y-2">
            <span className="rounded-full bg-[var(--color-geek)]/20 px-3 py-1 text-xs font-bold text-[var(--color-geek)]">
              {pub.won ? "🎉 Conexão Perfeita!" : "🧩 Fim de Jogo"}
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight gd-text">
              {pub.won ? "Você Desvendou Tudo!" : "Grupos Revelados"}
            </h2>
            <div className="mt-1 flex flex-col items-center gap-1">
              <StarRating value={scoreToStars(finalScore)} size={28} />
              <p className="text-sm font-extrabold gd-text">{finalScore} pontos obtidos</p>
            </div>
          </div>

          {pub.reveal && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-geek)] text-left">
                Todas as Conexões do Desafio:
              </p>
              {pub.reveal.map((g, i) => {
                const style = GROUP_STYLES[i % GROUP_STYLES.length]!;
                return (
                  <div key={g.theme} className={`rounded-2xl border p-3.5 text-left space-y-1 ${style.bg}`}>
                    <h4 className="text-xs font-black uppercase tracking-wider opacity-85">{g.theme}</h4>
                    <p className="text-sm font-extrabold">{g.terms.map((t) => t.label).join(" · ")}</p>
                    {g.explanation && (
                      <p className="text-xs font-medium opacity-90 border-t border-black/10 pt-1.5 flex items-center gap-1">
                        <BookOpen size={13} /> {g.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Button variant="secondary" onClick={reset} className="w-full font-bold">
            <RotateCcw size={18} aria-hidden /> Jogar de novo (modo treino)
          </Button>
        </Card>
      )}
    </div>
  );
}

