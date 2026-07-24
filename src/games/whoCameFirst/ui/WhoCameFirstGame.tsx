"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ArrowDownUp, Check, X, RotateCcw } from "lucide-react";
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

export function WhoCameFirstGame({ dateKey, initialPublic, mode }: Props) {
  const { refresh } = useAuthCtx();
  const labelById = useMemo(
    () => new Map(initialPublic.items.map((i) => [i.id, i.label])),
    [initialPublic.items],
  );
  const [order, setOrder] = useState<string[]>(initialPublic.items.map((i) => i.id));
  const [pub, setPub] = useState<WhoCameFirstPublic>(initialPublic);
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
    const res = await submitGuess({
      gameId: "who-came-first",
      dateKey,
      state: { order, submitted: false, solved: false } satisfies WhoCameFirstState,
      guess: { order },
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public) {
      setError(res.error ?? "Erro ao enviar.");
      return;
    }
    setPub(res.public as WhoCameFirstPublic);
    if (res.recordedOfficial) void refresh();
  }

  function reset() {
    setOrder(initialPublic.items.map((i) => i.id));
    setPub(initialPublic);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-movies)] text-black/80">
          <ArrowDownUp aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold gd-text">Quem Veio Primeiro?</h1>
          <p className="text-xs gd-muted">Ordene do mais antigo (topo) ao mais recente.</p>
        </div>
      </header>

      {!pub.submitted ? (
        <>
          <ol className="space-y-2">
            {order.map((id, i) => (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl border gd-border gd-surface p-3"
              >
                <span className="w-5 text-center text-sm font-bold gd-muted">{i + 1}</span>
                <span className="flex-1 text-sm gd-text">{labelById.get(id)}</span>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Mover ${labelById.get(id)} para cima`}
                    className="rounded-md gd-surface-2 p-1 disabled:opacity-30"
                  >
                    <ChevronUp size={16} aria-hidden />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    aria-label={`Mover ${labelById.get(id)} para baixo`}
                    className="rounded-md gd-surface-2 p-1 disabled:opacity-30"
                  >
                    <ChevronDown size={16} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {error && (
            <p className="text-center text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
          <Button onClick={submit} disabled={busy} size="lg" className="w-full">
            {busy ? "Enviando…" : "Confirmar ordem"}
          </Button>
        </>
      ) : (
        <Card className="gd-pop space-y-3">
          <div className="text-center">
            <p className="text-lg font-bold gd-text">{pub.solved ? "Ordem perfeita! 🎉" : "Enviado!"}</p>
            <div className="mt-1 flex flex-col items-center gap-1">
              <StarRating value={scoreToStars(finalScore)} size={24} />
              <p className="text-sm gd-muted">{finalScore} pontos</p>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold gd-muted">Ordem correta</p>
            <ol className="space-y-1.5">
              {pub.reveal?.correct.map((c, i) => {
                const playerRight = pub.reveal?.playerOrder[i] === c.id;
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg border gd-border gd-surface-2 px-3 py-2 text-sm"
                  >
                    <span className="w-5 text-center font-bold gd-muted">{i + 1}</span>
                    <span className="flex-1 gd-text">
                      {c.label} <span className="gd-muted">({c.year})</span>
                    </span>
                    {playerRight ? (
                      <Check size={15} className="text-[var(--color-success)]" aria-label="acertou a posição" />
                    ) : (
                      <X size={15} className="text-[var(--color-danger)]" aria-label="posição errada" />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          <Button variant="secondary" onClick={reset} className="w-full">
            <RotateCcw size={16} aria-hidden /> Jogar de novo (não conta oficial)
          </Button>
        </Card>
      )}
    </div>
  );
}
