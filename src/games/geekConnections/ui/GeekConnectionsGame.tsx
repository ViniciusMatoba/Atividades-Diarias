"use client";

import { useState } from "react";
import { Grid3x3, RotateCcw } from "lucide-react";
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

const GROUP_COLORS = ["var(--color-geek)", "var(--color-pokemon)", "var(--color-movies)", "var(--color-geo)"];

export function GeekConnectionsGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const [pub, setPub] = useState(initialPublic);
  const [state, setState] = useState(initialState);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      return;
    }
    setPub(res.public as GeekConnectionsPublic);
    setState(res.state as GeekConnectionsState);
    setSelected([]);
    setMessage(res.feedback?.message ?? null);
    if (res.recordedOfficial) void refresh();
  }

  function reset() {
    setPub(initialPublic);
    setState(initialState);
    setSelected([]);
    setMessage(null);
  }

  const finalScore = Math.round(
    (pub.solved.length / 4) * 1000 * Math.max(0.4, 1 - pub.mistakes * 0.15),
  );

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-geek)] text-black/80">
          <Grid3x3 aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold gd-text">Geek Connections</h1>
          <p className="text-xs gd-muted">Forme 4 grupos de 4 termos relacionados.</p>
        </div>
      </header>

      {/* Grupos resolvidos */}
      {pub.solved.map((g, i) => (
        <div
          key={g.theme}
          className="rounded-xl p-3 text-black/80"
          style={{ background: GROUP_COLORS[i % GROUP_COLORS.length] }}
        >
          <p className="text-xs font-bold uppercase tracking-wide">{g.theme}</p>
          <p className="text-sm font-semibold">{g.terms.map((t) => t.label).join(" · ")}</p>
        </div>
      ))}

      {!pub.finished ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            {pub.remaining.map((t) => {
              const on = selected.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  aria-pressed={on}
                  className={`min-h-14 rounded-xl border px-2 py-2 text-center text-sm font-medium transition-colors ${
                    on
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "gd-border gd-surface-2 gd-text"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-1.5" aria-label={`${pub.mistakesRemaining} erros restantes`}>
            <span className="text-xs gd-muted">Erros restantes:</span>
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full ${i < pub.mistakesRemaining ? "bg-[var(--color-danger)]" : "gd-surface-2"}`}
              />
            ))}
          </div>

          {message && (
            <p className="text-center text-sm text-[var(--color-warning)]" role="status">
              {message}
            </p>
          )}

          <Button onClick={confirm} disabled={selected.length !== 4 || busy} size="lg" className="w-full">
            {busy ? "Enviando…" : `Confirmar grupo (${selected.length}/4)`}
          </Button>
        </>
      ) : (
        <Card className="gd-pop space-y-3 text-center">
          <p className="text-lg font-bold gd-text">{pub.won ? "Perfeito! 🎉" : "Fim de jogo"}</p>
          <div className="flex flex-col items-center gap-1">
            <StarRating value={scoreToStars(finalScore)} size={24} />
            <p className="text-sm gd-muted">{finalScore} pontos · {pub.solved.length}/4 grupos</p>
          </div>
          <Button variant="secondary" onClick={reset} className="w-full">
            <RotateCcw size={16} aria-hidden /> Jogar de novo (não conta oficial)
          </Button>
        </Card>
      )}
    </div>
  );
}
