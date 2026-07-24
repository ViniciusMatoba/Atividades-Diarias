"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DailyDiscovery, UserDiscoveryState } from "../types";

interface Props {
  dateKey: string;
  discoveries: DailyDiscovery[];
  userStates: Record<string, UserDiscoveryState>;
}

export function ShareDiscoveryButton({ dateKey, discoveries, userStates }: Props) {
  const [copied, setCopied] = useState(false);

  function generateShareText(): string {
    const pokeState = userStates[`${dateKey}:pokemon`];
    const countryState = userStates[`${dateKey}:country`];
    const mediaDiscovery = discoveries.find((d) => d.type === "movie" || d.type === "series");
    const mediaState = mediaDiscovery ? userStates[mediaDiscovery.id] : undefined;

    const pokeStatus = pokeState?.revealedAt ? (pokeState.isCorrect ? "acertado! ⚡" : "descoberto ⚡") : "bloqueado 🔒";
    const countryStatus = countryState?.revealedAt ? (countryState.isCorrect ? "acertado! 🌍" : "descoberto 🌍") : "bloqueado 🔒";
    const mediaStatus = mediaState?.revealedAt ? (mediaState.inWatchlist ? "salvo na lista! 🎬" : "descoberto 🎬") : "bloqueado 🔒";

    const count = [pokeState?.revealedAt, countryState?.revealedAt, mediaState?.revealedAt].filter(Boolean).length;

    return `Descobertas do Dia (${dateKey})

⚡ Pokémon: ${pokeStatus}
🌍 País: ${countryStatus}
🎬 Filme/Série: ${mediaStatus}

${count} de 3 concluídas!
https://geekdaily.app/discoveries`;
  }

  async function handleShare() {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // Fallback to clipboard if share was cancelled or denied
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <Button variant="secondary" onClick={handleShare} className="w-full font-bold gap-2">
      {copied ? <Check size={18} className="text-[var(--color-success)]" /> : <Share2 size={18} />}
      {copied ? "Texto copiado para área de transferência!" : "Compartilhar Descobertas de Hoje"}
    </Button>
  );
}
