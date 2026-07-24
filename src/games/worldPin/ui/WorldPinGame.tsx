"use client";

import { useRef, useState } from "react";
import { MapPin, RotateCcw, Navigation, BookOpen } from "lucide-react";
import { submitGuess } from "@/server/actions/game";
import type { WorldPinPublic, WorldPinState } from "@/games/worldPin";
import { getPinFlagUrl } from "@/games/worldPin/data/pinCountries";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { scoreToStars } from "@/lib/stars";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/auth";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import { usePersistedGameState } from "@/lib/usePersistedGameState";

interface Props {
  dateKey: string;
  initialPublic: WorldPinPublic;
  initialState: WorldPinState;
  mode: "daily" | "infinite";
}

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

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ["Norte", "Nordeste", "Leste", "Sudeste", "Sul", "Sudoeste", "Oeste", "Noroeste"];
  const index = Math.round(brng / 45) % 8;
  return directions[index] || "Norte";
}

export function WorldPinGame({ dateKey, initialPublic, initialState, mode }: Props) {
  const { refresh } = useAuthCtx();
  const svgRef = useRef<SVGSVGElement>(null);
  const { pub, state, updateGame, resetGame } = usePersistedGameState(dateKey, "world-pin", initialPublic, initialState);
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
      state,
      guess: pending,
      mode,
      ...(idToken ? { idToken } : {}),
    });
    setBusy(false);
    if (!res.ok || !res.public || !res.state) {
      setError(res.error ?? "Erro ao enviar palpite.");
      return;
    }
    updateGame(res.public as WorldPinPublic, res.state as WorldPinState);
    if (res.recordedOfficial) void refresh();
  }

  function reset() {
    resetGame();
    setPending(null);
    setError(null);
  }

  const guessPin = pub.result ? toSvg(pub.result.guess.lat, pub.result.guess.lon) : pending ? toSvg(pending.lat, pending.lon) : null;
  const answerPin = pub.result ? toSvg(pub.result.answer.lat, pub.result.answer.lon) : null;
  const bearingDirection = pub.result && !pub.result.bullseye ? calculateBearing(pub.result.guess.lat, pub.result.guess.lon, pub.result.answer.lat, pub.result.answer.lon) : null;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl gd-glass p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-geo)] text-black/90 shadow-md">
            <MapPin size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gd-text">Pin do Mundo</h1>
            <p className="text-xs gd-muted">
              Onde fica <span className="font-extrabold text-[var(--color-geo)]">{pub.countryName}</span>?
            </p>
          </div>
        </div>
        <div className="rounded-xl border gd-border gd-surface-2 px-3 py-1.5 text-center">
          <span className="block text-[10px] uppercase font-bold gd-muted">Modo</span>
          <span className="text-xs font-bold text-[var(--color-geo)]">{mode === "daily" ? "Diário" : "Treino"}</span>
        </div>
      </header>

      <div className="relative rounded-2xl border gd-border overflow-hidden bg-slate-950 shadow-inner">
        <svg
          ref={svgRef}
          viewBox="0 0 360 180"
          onClick={onMapClick}
          className={`w-full ${pub.submitted ? "" : "cursor-crosshair"}`}
          style={{ aspectRatio: "2 / 1" }}
          role="img"
          aria-label="Mapa-múndi para marcar a localização"
        >
          {/* graticule */}
          {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={180} stroke="rgba(255,255,255,0.06)" strokeWidth={0.4} />
          ))}
          {[30, 60, 90, 120, 150].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={360} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.4} />
          ))}
          {/* linha do equador */}
          <line x1={0} y1={90} x2={360} y2={90} stroke="rgba(0,184,148,0.2)" strokeWidth={0.6} strokeDasharray="3 3" />

          {/* continentes aproximados */}
          {CONTINENTS.map((c) => (
            <g key={c.name}>
              <polygon points={c.points} fill="var(--color-geo)" opacity={0.3} className="transition-all hover:opacity-40" />
              <text x={c.cx} y={c.cy} textAnchor="middle" fontSize={5} fill="var(--muted)" fontWeight="bold" opacity={0.7}>
                {c.name}
              </text>
            </g>
          ))}

          {/* linha conectora entre palpite e alvo */}
          {guessPin && answerPin && (
            <line
              x1={guessPin.x}
              y1={guessPin.y}
              x2={answerPin.x}
              y2={answerPin.y}
              stroke="var(--color-warning)"
              strokeWidth={1}
              strokeDasharray="3 3"
              className="animate-pulse"
            />
          )}

          {/* pino do palpite */}
          {guessPin && (
            <g>
              <circle cx={guessPin.x} cy={guessPin.y} r={4} fill="var(--color-primary)" opacity={0.3} className="animate-ping" />
              <circle cx={guessPin.x} cy={guessPin.y} r={3} fill="var(--color-primary)" stroke="white" strokeWidth={0.8} />
            </g>
          )}

          {/* pino do alvo (ao enviar) */}
          {answerPin && (
            <g>
              <circle cx={answerPin.x} cy={answerPin.y} r={5} fill="var(--color-success)" opacity={0.4} className="animate-pulse" />
              <circle cx={answerPin.x} cy={answerPin.y} r={3} fill="var(--color-success)" stroke="white" strokeWidth={0.8} />
            </g>
          )}
        </svg>
      </div>

      {error && (
        <p className="text-center text-sm font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {!pub.submitted ? (
        <Button onClick={confirm} disabled={!pending || busy} size="lg" className="w-full font-bold shadow-md">
          {busy ? "Enviando pino…" : pending ? "Confirmar marcação no mapa" : "Toque no mapa para posicionar o pino"}
        </Button>
      ) : (
        pub.result && (
          <Card className="gd-bounce-in space-y-4 border-2 border-[var(--color-geo)]/50 p-5 text-center shadow-xl">
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-[var(--color-geo)]/20 px-3 py-1 text-xs font-bold text-[var(--color-geo)]">
                {pub.result.bullseye ? "🎯 Precisão Cirúrgica!" : "📍 Pino Posicionado"}
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight gd-text">
                {pub.result.bullseye ? "Na Mosca!" : `Distância: ${pub.result.distanceKm.toLocaleString("pt-BR")} km`}
              </h2>
              {bearingDirection && (
                <p className="flex items-center gap-1 text-xs font-semibold text-[var(--color-warning)]">
                  <Navigation size={13} /> O país alvo fica na direção <span className="font-bold">{bearingDirection}</span>
                </p>
              )}
            </div>

            <div className="rounded-2xl border gd-border gd-surface-2 p-4 text-left space-y-3">
              <div className="flex items-center gap-4">
                {pub.result.answer.code && (
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl border gd-border shadow-md">
                    <img
                      src={getPinFlagUrl(pub.result.answer.code)}
                      alt={`Bandeira de ${pub.result.answer.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-[var(--color-geo)] uppercase tracking-wider">
                    Geografia & Fatos
                  </span>
                  <h3 className="text-xl font-black gd-text">{pub.result.answer.name}</h3>
                </div>
              </div>

              {pub.result.answer.curiosity && (
                <div className="rounded-xl bg-black/20 p-3 space-y-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-[var(--color-geo)]">
                    <BookOpen size={13} /> Fato da Região
                  </span>
                  <p className="text-xs leading-relaxed gd-text font-medium">{pub.result.answer.curiosity}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 pt-2">
              <StarRating value={scoreToStars(pub.result.score)} size={28} />
              <p className="text-sm font-extrabold gd-text">{pub.result.score} pontos obtidos</p>
            </div>

            <Button variant="secondary" onClick={reset} className="w-full font-bold">
              <RotateCcw size={18} aria-hidden /> Jogar de novo (modo treino)
            </Button>
          </Card>
        )
      )}
    </div>
  );
}

