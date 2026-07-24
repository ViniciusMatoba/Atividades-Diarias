"use client";

import { useState } from "react";
import { Globe2, Check, X, RotateCcw } from "lucide-react";
import { submitMysteryGuess } from "@/server/actions/mysteryCountry";
import type { MysteryCountryState, MysteryCountryPublic } from "@/games/mysteryCountry";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { scoreToStars } from "@/lib/stars";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/auth";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";

interface CountryOption {
  id: string;
  name: string;
}

interface Props {
  dateKey: string;
  countries: CountryOption[];
  initialPublic: MysteryCountryPublic;
  initialState: MysteryCountryState;
  mode: "daily" | "infinite";
}

export function MysteryCountryGame({ dateKey, countries, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const [pub, setPub] = useState(initialPublic);
  const [state, setState] = useState(initialState);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const guessedIds = new Set(pub.guesses.map((g) => g.id));
  const options = countries.filter((c) => !guessedIds.has(c.id));

  async function onGuess() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const res = await submitMysteryGuess({
      dateKey,
      state,
      countryId: selected,
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar palpite.");
      return;
    }
    setPub(res.public);
    setState(res.state);
    setSelected("");
    const lastGuess = res.public.guesses.at(-1);
    setLastMessage(lastGuess?.correct ? "Acertou! 🎉" : "Não é esse. Nova pista liberada!");
    // Se gravou resultado oficial, atualiza o dashboard (home/perfil).
    if (res.recordedOfficial) void refresh();
  }

  function reset() {
    setPub(initialPublic);
    setState(initialState);
    setSelected("");
    setError(null);
    setLastMessage(null);
  }

  const finalScore = pub.finished && pub.solved ? scoreToStars(scoreForState()) : null;
  function scoreForState(): number {
    // pontuação exibida vem do último retorno do servidor via re-render;
    // recomputada de forma segura só para exibir estrelas ao vencer.
    const extraClues = Math.max(0, pub.revealedClues - 1);
    const wrong = pub.guesses.filter((g) => !g.correct).length;
    return Math.max(0, 1000 - extraClues * 80 - wrong * 60);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-geo)] text-black/80">
          <Globe2 aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold gd-text">País Misterioso</h1>
          <p className="text-xs gd-muted">
            {pub.guessesRemaining} tentativa(s) · {pub.revealedClues}/{pub.totalClues} pistas
          </p>
        </div>
      </header>

      {/* Pistas */}
      <section className="space-y-2" aria-label="Pistas">
        {pub.clues.map((clue) => (
          <Card key={clue.kind} className="gd-pop flex items-center justify-between py-3">
            <span className="text-sm gd-muted">{clue.label}</span>
            <span className="text-sm font-semibold gd-text">{clue.value}</span>
          </Card>
        ))}
      </section>

      {/* Palpites já feitos */}
      {pub.guesses.length > 0 && (
        <ul className="space-y-1.5" aria-label="Palpites">
          {pub.guesses.map((g) => (
            <li
              key={g.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                g.correct
                  ? "border-[var(--color-success)] text-[var(--color-success)]"
                  : "gd-border gd-muted"
              }`}
            >
              {g.correct ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />}
              {g.name}
            </li>
          ))}
        </ul>
      )}

      {lastMessage && !pub.finished && (
        <p className="text-center text-sm text-[var(--color-warning)]" role="status">
          {lastMessage}
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {/* Área de ação */}
      {!pub.finished ? (
        <div className="space-y-2">
          <label htmlFor="country-select" className="block text-sm font-medium gd-text">
            Seu palpite
          </label>
          <select
            id="country-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-11 w-full rounded-xl border gd-border gd-surface-2 px-3 text-sm gd-text outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <option value="">Escolha um país…</option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button onClick={onGuess} disabled={!selected || busy} size="lg" className="w-full">
            {busy ? "Enviando…" : "Palpitar"}
          </Button>
        </div>
      ) : (
        <Card className="gd-pop space-y-3 text-center">
          <p className="text-lg font-bold gd-text">
            {pub.solved ? "Você acertou!" : "Não foi dessa vez"}
          </p>
          {pub.answer && (
            <p className="text-sm gd-muted">
              Resposta: <span className="font-semibold gd-text">{pub.answer.name}</span>
            </p>
          )}
          {pub.solved && (
            <div className="flex flex-col items-center gap-1">
              <StarRating value={finalScore} size={26} />
              <p className="text-sm gd-muted">{scoreForState()} pontos</p>
            </div>
          )}
          <Button variant="secondary" onClick={reset} className="w-full">
            <RotateCcw size={16} aria-hidden /> Jogar de novo (não conta oficial)
          </Button>
        </Card>
      )}
    </div>
  );
}
