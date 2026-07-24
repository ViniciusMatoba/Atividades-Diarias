"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ArrowDownUp, Check, X, RotateCcw, Calendar, Film, Gamepad2, Tv, Sparkles, BookOpen } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { WhoCameFirstPublic, WhoCameFirstState } from "@/games/whoCameFirst";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { scoreToStars } from "@/lib/stars";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/auth";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";

interface Props {
  dateKey: string;
  initialPublic: WhoCameFirstPublic;
  mode: "daily" | "infinite";
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  console: <Gamepad2 size={16} className="text-purple-400" />,
  game: <Gamepad2 size={16} className="text-emerald-400" />,
  movie: <Film size={16} className="text-sky-400" />,
  anime: <Tv size={16} className="text-pink-400" />,
};

import { usePersistedGameState } from "@/lib/usePersistedGameState";

export function WhoCameFirstGame({ dateKey, initialPublic, mode }: Props) {
  const { refresh } = useAuthCtx();
  const initialState = { order: initialPublic.items.map((i) => i.id), submitted: false, solved: false };
  const { pub, state, updateGame, resetGame } = usePersistedGameState(dateKey, "who-came-first", initialPublic, initialState);
  
  const itemMap = useMemo(
    () => new Map(initialPublic.items.map((i) => [i.id, i])),
    [initialPublic.items],
  );
  
  const [order, setOrder] = useState<string[]>(() => {
    return (state as WhoCameFirstState)?.order ?? initialPublic.items.map((i) => i.id);
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalScore = useMemo(() => {
    if (!pub.reveal) return 0;
    const correct = pub.reveal.correct.map((c) => c.id);
    let inv = 0;
    const idx = new Map(correct.map((id, i) => [id, i]));
    const po = pub.reveal.playerOrder;
    for (let i = 0; i < po.length; i++)
      for (let j = i + 1; j < po.length; j++)
        if ((idx.get(po[i]!) ?? 0) > (idx.get(po[j]!) ?? 0)) inv++;
    const pairs = (po.length * (po.length - 1)) / 2;
    return Math.round(1000 * (1 - inv / pairs));
  }, [pub.reveal]);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    setOrder((prev) => {
      const a = [...prev];
      const tmp = a[i]!;
      a[i] = a[j]!;
      a[j] = tmp;
      return a;
    });
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const newState = { order, submitted: true, solved: false } satisfies WhoCameFirstState;
    const res = await submitGuess({
      gameId: "who-came-first",
      dateKey,
      state: newState,
      guess: { order },
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar.");
      return;
    }
    updateGame(res.public as WhoCameFirstPublic, res.state as WhoCameFirstState);
    if (res.recordedOfficial) void refresh();
  }

  function handleReset() {
    resetGame();
    setOrder(initialPublic.items.map((i) => i.id));
    setError(null);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-movies)] text-black/90 shadow-md">
            <ArrowDownUp size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">Quem Veio Primeiro?</h1>
            <p className="text-xs gd-muted">Ordene do mais antigo (topo) ao mais recente</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Itens</span>
          <span className="text-sm font-extrabold text-[var(--color-movies)]">{order.length}</span>
        </div>
      </header>

      {!pub.submitted ? (
        <>
          <ol className="space-y-2.5">
            {order.map((id, i) => {
              const item = itemMap.get(id);
              return (
                <li
                  key={id}
                  className="gd-pop flex items-center gap-3.5 rounded-2xl border gd-border gd-surface p-3.5 shadow-sm transition-all hover:border-[var(--color-movies)]/50"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-movies)]/20 text-xs font-black text-[var(--color-movies)]">
                    #{i + 1}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-bold gd-text">{item?.label}</p>
                    {item?.category && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase gd-muted">
                        {CATEGORY_ICONS[item.category] ?? <Sparkles size={12} />} {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Mover ${item?.label} para cima`}
                      className="rounded-lg gd-surface-2 p-1.5 gd-text transition-all hover:bg-[var(--color-movies)] hover:text-black disabled:opacity-30"
                    >
                      <ChevronUp size={16} aria-hidden />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === order.length - 1}
                      aria-label={`Mover ${item?.label} para baixo`}
                      className="rounded-lg gd-surface-2 p-1.5 gd-text transition-all hover:bg-[var(--color-movies)] hover:text-black disabled:opacity-30"
                    >
                      <ChevronDown size={16} aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          {error && (
            <p className="text-center text-sm font-semibold text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
          <Button onClick={submit} disabled={busy} size="lg" className="w-full font-bold shadow-md">
            {busy ? "Validando ordem cronológica…" : "Confirmar Ordem Cronológica"}
          </Button>
        </>
      ) : (
        <Card className="gd-bounce-in space-y-4 border-2 border-[var(--color-movies)]/50 p-5 shadow-xl">
          <div className="text-center space-y-2">
            <span className="rounded-full bg-[var(--color-movies)]/20 px-3 py-1 text-xs font-bold text-[var(--color-movies)]">
              {pub.solved ? "⏳ Ordem Cronológica Perfeita!" : "🎬 Ordem Enviada"}
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight gd-text">
              {pub.solved ? "Precisão Histórica!" : "Linha do Tempo Revelada"}
            </h2>
            <div className="mt-1 flex flex-col items-center gap-1">
              <StarRating value={scoreToStars(finalScore)} size={28} />
              <p className="text-sm font-extrabold gd-text">{finalScore} pontos obtidos</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-movies)]">
              Linha do Tempo Histórica (Mais Antigo → Mais Recente)
            </p>
            <ol className="space-y-3">
              {pub.reveal?.correct.map((c, i) => {
                const playerRight = pub.reveal?.playerOrder[i] === c.id;
                return (
                  <li
                    key={c.id}
                    className="rounded-2xl border gd-border gd-surface-2 p-3.5 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-movies)] text-xs font-black text-black">
                          {i + 1}
                        </span>
                        <h4 className="text-sm font-bold gd-text">{c.label}</h4>
                      </div>
                      <span className="flex items-center gap-1 rounded-lg bg-black/30 px-2.5 py-1 text-xs font-extrabold text-[var(--color-movies)]">
                        <Calendar size={13} /> {c.year}
                      </span>
                    </div>

                    {c.creator && (
                      <p className="text-xs font-semibold gd-muted">Criador/Estúdio: {c.creator}</p>
                    )}

                    {c.curiosity && (
                      <div className="rounded-xl bg-black/20 p-2.5 text-xs leading-relaxed gd-text font-medium flex items-start gap-1.5">
                        <BookOpen size={14} className="shrink-0 text-[var(--color-movies)] mt-0.5" />
                        <span>{c.curiosity}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] font-bold pt-1 border-t gd-border">
                      {playerRight ? (
                        <span className="flex items-center gap-1 text-[var(--color-success)]">
                          <Check size={14} /> Posição correta no seu palpite
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[var(--color-danger)]">
                          <X size={14} /> Posição incorreta no seu palpite
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <Button variant="secondary" onClick={handleReset} className="w-full font-bold">
            <RotateCcw size={18} aria-hidden /> Jogar de novo (modo treino)
          </Button>
        </Card>
      )}
    </div>
  );
}

