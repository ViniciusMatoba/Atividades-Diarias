"use client";

import { useState } from "react";
import { Globe2, Check, X, RotateCcw, Compass, Users, MessageSquare, MapPin, Map, Sparkles, BookOpen } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { MysteryCountryState, MysteryCountryPublic } from "@/games/mysteryCountry";
import { getFlagUrl } from "@/games/mysteryCountry/data/countries";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
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

const CLUE_ICONS: Record<string, React.ReactNode> = {
  continent: <Compass size={18} className="text-emerald-400" />,
  population: <Users size={18} className="text-sky-400" />,
  languages: <MessageSquare size={18} className="text-indigo-400" />,
  neighbors: <Map size={18} className="text-amber-400" />,
  capital: <MapPin size={18} className="text-rose-400" />,
};

import { usePersistedGameState } from "@/lib/usePersistedGameState";

export function MysteryCountryGame({ dateKey, countries, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const { pub, state, updateGame, resetGame, userSeedId } = usePersistedGameState<MysteryCountryPublic, MysteryCountryState>(
    dateKey,
    "mystery-country",
    initialPublic,
    initialState,
  );
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
    const res = await submitGuess({
      gameId: "mystery-country",
      dateKey,
      state,
      guess: { countryId: selected },
      mode,
      userSeedId,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar palpite.");
      return;
    }
    const pubData = res.public as MysteryCountryPublic;
    updateGame(pubData, res.state as MysteryCountryState);
    setSelected("");
    const lastGuess = pubData.guesses.at(-1);
    setLastMessage(lastGuess?.correct ? "Acertou! 🎉" : "Não é esse. Nova pista liberada!");
    if (res.recordedOfficial) void refresh();
  }

  function handleReset() {
    resetGame();
    setSelected("");
    setError(null);
    setLastMessage(null);
  }

  function scoreForState(): number {
    const extraClues = Math.max(0, pub.revealedClues - 1);
    const wrong = pub.guesses.filter((g) => !g.correct).length;
    return Math.max(0, 1000 - extraClues * 80 - wrong * 60);
  }

  const numericScore = scoreForState();
  const finalStars = pub.finished && pub.solved ? scoreToStars(numericScore) : null;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-geo)] text-black/90 shadow-md">
            <Globe2 size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">País Misterioso</h1>
            <p className="text-xs gd-muted">Pistas geográficas progressivas</p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Pistas</span>
          <span className="text-sm font-extrabold text-[var(--color-geo)]">
            {pub.revealedClues}/{pub.totalClues}
          </span>
        </div>
      </header>

      {/* Pistas */}
      <section className="space-y-2.5" aria-label="Pistas Reveladas">
        {pub.clues.map((clue) => (
          <div
            key={clue.kind}
            className="gd-pop flex items-center justify-between rounded-xl border gd-border gd-surface p-3.5 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              {CLUE_ICONS[clue.kind] ?? <Sparkles size={18} />}
              <span className="text-xs font-bold uppercase tracking-wider gd-muted">{clue.label}</span>
            </div>
            <span className="text-sm font-extrabold gd-text">{clue.value}</span>
          </div>
        ))}
      </section>

      {/* Palpites já feitos */}
      {pub.guesses.length > 0 && (
        <ul className="space-y-1.5" aria-label="Palpites">
          {pub.guesses.map((g) => (
            <li
              key={g.id}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all ${
                g.correct
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "gd-border gd-surface-2 gd-muted"
              }`}
            >
              {g.correct ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
              {g.name}
            </li>
          ))}
        </ul>
      )}

      {lastMessage && !pub.finished && (
        <p className="text-center text-sm font-semibold text-[var(--color-warning)]" role="status">
          {lastMessage}
        </p>
      )}
      {error && (
        <p className="text-center text-sm font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {/* Área de ação */}
      {!pub.finished ? (
        <div className="space-y-3 rounded-2xl border gd-border gd-surface p-4 shadow-md">
          <label className="block text-sm font-bold gd-text">
            Digite o nome do país:
          </label>
          <AutocompleteInput
            options={options.map((c) => ({
              id: c.id,
              label: c.name,
            }))}
            value={selected}
            onChange={(id) => setSelected(id)}
            placeholder="Digite para buscar um país (ex: Brasil, Japão, França...)"
          />
          <Button onClick={onGuess} disabled={!selected || busy} size="lg" className="w-full font-bold shadow-md">
            {busy ? "Validando palpite…" : "Confirmar Palpite"}
          </Button>
        </div>
      ) : (
        <Card className="gd-bounce-in space-y-4 border-2 border-[var(--color-geo)]/50 p-5 text-center shadow-xl">
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-[var(--color-geo)]/20 px-3 py-1 text-xs font-bold text-[var(--color-geo)]">
              {pub.solved ? "🌎 Descoberta Concluída!" : "🗺️ Fim de Jogo"}
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight gd-text">
              {pub.solved ? "Você Encontrou o País!" : "Não foi desta vez!"}
            </h2>
          </div>

          {pub.answer && (
            <div className="rounded-2xl border gd-border gd-surface-2 p-4 text-left space-y-3">
              <div className="flex items-center gap-4">
                {pub.answer.code && (
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl border gd-border shadow-md">
                    <img
                      src={getFlagUrl(pub.answer.code)}
                      alt={`Bandeira de ${pub.answer.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-[var(--color-geo)] uppercase tracking-wider">
                    Ficha Cultural · {pub.answer.continent}
                  </span>
                  <h3 className="text-xl font-black gd-text">{pub.answer.name}</h3>
                  <p className="text-xs font-semibold gd-muted">Capital: {pub.answer.capital}</p>
                </div>
              </div>

              {pub.answer.curiosity && (
                <div className="rounded-xl bg-black/20 p-3 space-y-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-[var(--color-geo)]">
                    <BookOpen size={13} /> Fato Curioso
                  </span>
                  <p className="text-xs leading-relaxed gd-text font-medium">{pub.answer.curiosity}</p>
                </div>
              )}
            </div>
          )}

          {pub.solved && (
            <div className="flex flex-col items-center gap-1.5 pt-2">
              <StarRating value={finalStars} size={28} />
              <p className="text-sm font-extrabold gd-text">{numericScore} pontos obtidos</p>
            </div>
          )}

          <Button variant="secondary" onClick={handleReset} className="w-full font-bold">
            <RotateCcw size={18} aria-hidden /> Jogar de novo (modo treino)
          </Button>
        </Card>
      )}
    </div>
  );
}

