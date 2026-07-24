"use client";

import { useRef, useState } from "react";
import { MapPin, RotateCcw } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { WorldPinPublic, WorldPinState } from "@/games/worldPin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { scoreToStars } from "@/lib/stars";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/auth";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";

interface Props {
  dateKey: string;
  initialPublic: WorldPinPublic;
  initialState: WorldPinState;
  mode: "daily" | "infinite";
}

// Contornos MUITO aproximados (protótipo, sem tiles/imagens protegidas).
// Projeção equirretangular: x = lon + 180, y = 90 - lat (viewBox 360x180).
const CONTINENTS: { name: string; points: string; cx: number; cy: number }[] = [
  { name: "América do Norte", points: "15,25 60,15 120,20 130,45 95,70 75,72 70,60 40,45 20,40", cx: 70, cy: 40 },
  { name: "América do Sul", points: "100,80 118,78 145,85 140,110 120,145 112,140 105,110 100,95", cx: 118, cy: 108 },
  { name: "Europa", points: "170,54 205,50 222,32 195,20 175,35", cx: 194, cy: 38 },
  { name: "África", points: "165,55 195,52 215,60 230,80 222,110 205,127 190,120 185,90 168,78", cx: 197, cy: 90 },
  { name: "Ásia", points: "222,30 300,18 358,28 340,55 325,80 285,82 255,70 230,55", cx: 285, cy: 48 },
  { name: "Oceania", points: "293,103 334,110 325,130 297,127", cx: 312, cy: 118 },
];

function toSvg(lat: number, lon: number): { x: number; y: number } {
  return { x: lon + 180, y: 90 - lat };
}

export function WorldPinGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const svgRef = useRef<SVGSVGElement>(null);
  const [pub, setPub] = useState(initialPublic);
  const [pending, setPending] = useState<{ lat: number; lon: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onMapClick(e: React.MouseEvent<SVGSVGElement>) {
    if (pub.submitted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 360;
    const svgY = ((e.clientY - rect.top) / rect.height) * 180;
    const lon = Math.max(-180, Math.min(180, svgX - 180));
    const lat = Math.max(-90, Math.min(90, 90 - svgY));
    setPending({ lat: Math.round(lat), lon: Math.round(lon) });
  }

  async function confirm() {
    if (!pending || busy) return;
    setBusy(true);
    setError(null);
    const idToken = isFirebaseClientConfigured ? await getIdToken() : null;
    const res = await submitGuess({
      gameId: "world-pin",
      dateKey,
      state: initialState,
      guess: pending,
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public) {
      setError(res.error ?? "Erro ao enviar.");
      return;
    }
    setPub(res.public as WorldPinPublic);
    if (res.recordedOfficial) void refresh();
  }

  function reset() {
    setPub(initialPublic);
    setPending(null);
    setError(null);
  }

  const guessPin = pub.result ? toSvg(pub.result.guess.lat, pub.result.guess.lon) : pending ? toSvg(pending.lat, pending.lon) : null;
  const answerPin = pub.result ? toSvg(pub.result.answer.lat, pub.result.answer.lon) : null;

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-geo)] text-black/80">
          <MapPin aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold gd-text">Pin do Mundo</h1>
          <p className="text-xs gd-muted">
            Onde fica <span className="font-semibold gd-text">{pub.countryName}</span>? Toque no mapa.
          </p>
        </div>
      </header>

      <svg
        ref={svgRef}
        viewBox="0 0 360 180"
        onClick={onMapClick}
        className={`w-full rounded-xl border gd-border ${pub.submitted ? "" : "cursor-crosshair"}`}
        style={{ background: "var(--surface-2)", aspectRatio: "2 / 1" }}
        role="img"
        aria-label="Mapa-múndi para marcar a localização"
      >
        {/* graticule */}
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={180} stroke="var(--border)" strokeWidth={0.3} />
        ))}
        {[30, 60, 90, 120, 150].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={360} y2={y} stroke="var(--border)" strokeWidth={0.3} />
        ))}
        {/* continentes aproximados */}
        {CONTINENTS.map((c) => (
          <g key={c.name}>
            <polygon points={c.points} fill="var(--color-geo)" opacity={0.28} />
            <text x={c.cx} y={c.cy} textAnchor="middle" fontSize={5} fill="var(--muted)">
              {c.name}
            </text>
          </g>
        ))}
        {/* linha entre palpite e alvo */}
        {guessPin && answerPin && (
          <line x1={guessPin.x} y1={guessPin.y} x2={answerPin.x} y2={answerPin.y} stroke="var(--color-warning)" strokeWidth={0.8} strokeDasharray="2 2" />
        )}
        {/* pino do palpite */}
        {guessPin && <circle cx={guessPin.x} cy={guessPin.y} r={2.5} fill="var(--color-primary)" stroke="white" strokeWidth={0.6} />}
        {/* pino do alvo (após enviar) */}
        {answerPin && <circle cx={answerPin.x} cy={answerPin.y} r={2.5} fill="var(--color-success)" stroke="white" strokeWidth={0.6} />}
      </svg>

      {error && (
        <p className="text-center text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {!pub.submitted ? (
        <Button onClick={confirm} disabled={!pending || busy} size="lg" className="w-full">
          {busy ? "Enviando…" : pending ? "Confirmar local" : "Toque no mapa primeiro"}
        </Button>
      ) : (
        pub.result && (
          <Card className="gd-pop space-y-2 text-center">
            <p className="text-lg font-bold gd-text">{pub.result.bullseye ? "Na mosca! 🎯" : "Enviado!"}</p>
            <p className="text-sm gd-muted">
              {pub.result.answer.name} — você errou por{" "}
              <span className="font-semibold gd-text">{pub.result.distanceKm.toLocaleString("pt-BR")} km</span>
            </p>
            <div className="flex flex-col items-center gap-1">
              <StarRating value={scoreToStars(pub.result.score)} size={24} />
              <p className="text-sm gd-muted">{pub.result.score} pontos</p>
            </div>
            <Button variant="secondary" onClick={reset} className="w-full">
              <RotateCcw size={16} aria-hidden /> Jogar de novo (não conta oficial)
            </Button>
          </Card>
        )
      )}
    </div>
  );
}
