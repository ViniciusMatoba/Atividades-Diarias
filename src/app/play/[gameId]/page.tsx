import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Hammer } from "lucide-react";
import { getGameMeta, isPlayable } from "@/games/core/registry";
import type { GameId } from "@/games/core/types";
import { mysteryCountry } from "@/games/mysteryCountry";
import { COUNTRIES } from "@/games/mysteryCountry/data/countries";
import { whoCameFirst } from "@/games/whoCameFirst";
import { geekConnections } from "@/games/geekConnections";
import { pokeGuess } from "@/games/pokeGuess";
import { worldPin } from "@/games/worldPin";
import { getDailyKey } from "@/lib/dailyKey";
import { MysteryCountryGame } from "@/games/mysteryCountry/ui/MysteryCountryGame";
import { WhoCameFirstGame } from "@/games/whoCameFirst/ui/WhoCameFirstGame";
import { GeekConnectionsGame } from "@/games/geekConnections/ui/GeekConnectionsGame";
import { PokeGuessGame } from "@/games/pokeGuess/ui/PokeGuessGame";
import { WorldPinGame } from "@/games/worldPin/ui/WorldPinGame";

import { wordScramble } from "@/games/wordScramble";
import { WordScrambleGame } from "@/games/wordScramble/ui/WordScrambleGame";
import { pixelGuess } from "@/games/pixelGuess";
import { PixelGuessGame } from "@/games/pixelGuess/ui/PixelGuessGame";
import { emojiMovie } from "@/games/emojiMovie";
import { EmojiMovieGame } from "@/games/emojiMovie/ui/EmojiMovieGame";
import { flagMaster } from "@/games/flagMaster";
import { FlagMasterGame } from "@/games/flagMaster/ui/FlagMasterGame";
import { geekCharacter } from "@/games/geekCharacter";
import { GeekCharacterGame } from "@/games/geekCharacter/ui/GeekCharacterGame";

const KNOWN_IDS: GameId[] = [
  "mystery-country",
  "world-pin",
  "poke-guess",
  "geek-connections",
  "who-came-first",
  "word-scramble",
  "pixel-guess",
  "emoji-movie",
  "flag-master",
  "geek-character",
];

export function generateStaticParams() {
  return KNOWN_IDS.map((gameId) => ({ gameId }));
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  if (!KNOWN_IDS.includes(gameId as GameId)) notFound();
  const id = gameId as GameId;
  const meta = getGameMeta(id);
  if (!meta) notFound();
  const mode = "daily";

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
      ) : id === "poke-guess" ? (
        <PokeGuessReference mode={mode} />
      ) : id === "world-pin" ? (
        <WorldPinReference mode={mode} />
      ) : id === "word-scramble" ? (
        <WordScrambleReference mode={mode} />
      ) : id === "pixel-guess" ? (
        <PixelGuessReference mode={mode} />
      ) : id === "emoji-movie" ? (
        <EmojiMovieReference mode={mode} />
      ) : id === "flag-master" ? (
        <FlagMasterReference mode={mode} />
      ) : id === "geek-character" ? (
        <GeekCharacterReference mode={mode} />
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

function PokeGuessReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = pokeGuess.generateChallenge(`${dateKey}:poke-guess`);
  const state = pokeGuess.initialState(challenge);
  const initialPublic = pokeGuess.toPublic(challenge, state);

  return <PokeGuessGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />;
}

function WorldPinReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = worldPin.generateChallenge(`${dateKey}:world-pin`);
  const state = worldPin.initialState(challenge);
  const initialPublic = worldPin.toPublic(challenge, state);

  return <WorldPinGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />;
}

function WordScrambleReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = wordScramble.generateChallenge(`${dateKey}:word-scramble`);
  const state = wordScramble.initialState(challenge);
  const initialPublic = wordScramble.toPublic(challenge, state);

  return <WordScrambleGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />;
}

function PixelGuessReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = pixelGuess.generateChallenge(`${dateKey}:pixel-guess`);
  const state = pixelGuess.initialState(challenge);
  const initialPublic = pixelGuess.toPublic(challenge, state);

  return <PixelGuessGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />;
}

function EmojiMovieReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = emojiMovie.generateChallenge(`${dateKey}:emoji-movie`);
  const state = emojiMovie.initialState(challenge);
  const initialPublic = emojiMovie.toPublic(challenge, state);

  return <EmojiMovieGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />;
}

function FlagMasterReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = flagMaster.generateChallenge(`${dateKey}:flag-master`);
  const state = flagMaster.initialState(challenge);
  const initialPublic = flagMaster.toPublic(challenge, state);

  return <FlagMasterGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />;
}

function GeekCharacterReference({ mode }: { mode: "daily" | "infinite" }) {
  const dateKey = getDailyKey();
  const challenge = geekCharacter.generateChallenge(`${dateKey}:geek-character`);
  const state = geekCharacter.initialState(challenge);
  const initialPublic = geekCharacter.toPublic(challenge, state);

  return <GeekCharacterGame dateKey={dateKey} initialPublic={initialPublic} initialState={state} mode={mode} />;
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
