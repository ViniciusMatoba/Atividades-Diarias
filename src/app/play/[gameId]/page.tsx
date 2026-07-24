import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Hammer } from "lucide-react";
import { getGameMeta, isPlayable } from "@/games/core/registry";
import type { GameId } from "@/games/core/types";
import { mysteryCountry } from "@/games/mysteryCountry";
import { COUNTRIES } from "@/games/mysteryCountry/data/countries";
import { whoCameFirst } from "@/games/whoCameFirst";
import { geekConnections } from "@/games/geekConnections";
import { getDailyKey } from "@/lib/dailyKey";
import { MysteryCountryGame } from "@/games/mysteryCountry/ui/MysteryCountryGame";
import { WhoCameFirstGame } from "@/games/whoCameFirst/ui/WhoCameFirstGame";
import { GeekConnectionsGame } from "@/games/geekConnections/ui/GeekConnectionsGame";

const KNOWN_IDS: GameId[] = [
  "mystery-country",
  "world-pin",
  "poke-guess",
  "geek-connections",
  "who-came-first",
];

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { gameId } = await params;
  const { mode: modeParam } = await searchParams;
  if (!KNOWN_IDS.includes(gameId as GameId)) notFound();
  const id = gameId as GameId;
  const meta = getGameMeta(id);
  if (!meta) notFound();
  const mode = modeParam === "infinite" ? "infinite" : "daily";

  return (
    <div className="space-y-4">
      <Link href="/journey" className="inline-flex items-center gap-1 text-sm gd-muted">
        <ArrowLeft size={16} aria-hidden /> Voltar
      </Link>

      {id === "mystery-country" ? (
        <MysteryCountryReference mode={mode} />
      ) : id === "who-came-first" ? (
        <WhoCameFirstReference mode={mode} />
      ) : id === "geek-connections" ? (
        <GeekConnectionsReference mode={mode} />
      ) : (
        <ComingSoon name={meta.name} playable={isPlayable(id)} />
      )}
    </div>
  );
}

/** Monta o desafio do dia no SERVIDOR e envia só a visão pública ao cliente. */
function MysteryCountryReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = mysteryCountry.generateChallenge(`${dateKey}:mystery-country`);
  const state = mysteryCountry.initialState(challenge);
  const initialPublic = mysteryCountry.toPublic(challenge, state); // answer = null

  const countries = [...COUNTRIES]
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <MysteryCountryGame
      dateKey={dateKey}
      countries={countries}
      initialPublic={initialPublic}
      initialState={state}
      mode={mode}
    />
  );
}

function WhoCameFirstReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = whoCameFirst.generateChallenge(`${dateKey}:who-came-first`);
  const state = whoCameFirst.initialState(challenge);
  const initialPublic = whoCameFirst.toPublic(challenge, state); // sem anos/resposta

  return <WhoCameFirstGame dateKey={dateKey} initialPublic={initialPublic} mode={mode} />;
}

function GeekConnectionsReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = geekConnections.generateChallenge(`${dateKey}:geek-connections`);
  const state = geekConnections.initialState(challenge);
  const initialPublic = geekConnections.toPublic(challenge, state);

  return (
    <GeekConnectionsGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />
  );
}

function ComingSoon({ name, playable }: { name: string; playable: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Hammer size={32} className="gd-muted" aria-hidden />
      <h1 className="text-xl font-bold gd-text">{name}</h1>
      <p className="max-w-xs text-sm gd-muted">
        {playable
          ? "Este jogo já tem lógica, mas a interface ainda está em construção."
          : "Este jogo faz parte do MVP e será implementado seguindo o mesmo contrato do País Misterioso."}
      </p>
    </div>
  );
}
