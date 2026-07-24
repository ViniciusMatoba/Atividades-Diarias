"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Minus, Maximize } from "lucide-react";

// Textura equirretangular real da Terra (NASA Blue Marble, 2:1 — casa com o viewBox 360x180).
const EARTH_TEXTURE_URL = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
// Fronteiras dos países (Natural Earth 110m, GeoJSON) via CDN.
const BORDERS_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
const FULL: ViewBox = { x: 0, y: 0, w: 360, h: 180 };
const MIN_W = 30; // zoom máx (~12x)

// Projeção plate carrée: [lon,lat] -> [x,y] no espaço 360x180.
function project(lon: number, lat: number): [number, number] {
  return [lon + 180, 90 - lat];
}

type Ring = number[][];

function ringToPath(ring: Ring): string {
  let d = "";
  let prevX: number | null = null;
  for (const pt of ring) {
    const lon = pt[0]!;
    const lat = pt[1]!;
    const [x, y] = project(lon, lat);
    // Quebra a linha ao cruzar o antimeridiano (evita riscos horizontais).
    if (prevX === null || Math.abs(x - prevX) > 180) d += `M${x.toFixed(2)} ${y.toFixed(2)}`;
    else d += `L${x.toFixed(2)} ${y.toFixed(2)}`;
    prevX = x;
  }
  return d;
}

interface GeoFeature {
  geometry: { type: string; coordinates: unknown };
}

function buildBorderPath(features: GeoFeature[]): string {
  let d = "";
  for (const f of features) {
    const g = f.geometry;
    if (g.type === "Polygon") {
      for (const ring of g.coordinates as Ring[]) d += ringToPath(ring);
    } else if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates as Ring[][]) for (const ring of poly) d += ringToPath(ring);
    }
  }
  return d;
}

function clampBounds(v: ViewBox): ViewBox {
  const w = Math.min(360, Math.max(MIN_W, v.w));
  const h = w / 2;
  const x = Math.min(360 - w, Math.max(0, v.x));
  const y = Math.min(180 - h, Math.max(0, v.y));
  return { x, y, w, h };
}

function zoomView(v: ViewBox, factor: number, cx: number, cy: number): ViewBox {
  const w = Math.min(360, Math.max(MIN_W, v.w * factor));
  const h = w / 2;
  const rx = (cx - v.x) / v.w;
  const ry = (cy - v.y) / v.h;
  return clampBounds({ x: cx - rx * w, y: cy - ry * h, w, h });
}

interface Props {
  pin: { lat: number; lon: number };
  label: string; // "?" durante o jogo; nome do país ao terminar
}

export function WorldPinMap({ pin, label }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [vb, setVb] = useState<ViewBox>(FULL);
  const [borders, setBorders] = useState<string>("");
  const drag = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(BORDERS_URL)
      .then((r) => r.json())
      .then((gj: { features: GeoFeature[] }) => {
        if (alive && gj?.features) setBorders(buildBorderPath(gj.features));
      })
      .catch(() => {
        /* fronteiras são opcionais; segue só com a imagem */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Zoom pela roda do mouse (listener nativo p/ poder preventDefault).
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = vb.x + ((e.clientX - rect.left) / rect.width) * vb.w;
      const cy = vb.y + ((e.clientY - rect.top) / rect.height) * vb.h;
      setVb((v) => zoomView(v, e.deltaY > 0 ? 1.2 : 0.83, cx, cy));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [vb]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      drag.current = { px: e.clientX, py: e.clientY, vx: vb.x, vy: vb.y };
    },
    [vb],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    const el = svgRef.current;
    if (!d || !el) return;
    const rect = el.getBoundingClientRect();
    setVb((v) => {
      const dx = ((e.clientX - d.px) / rect.width) * v.w;
      const dy = ((e.clientY - d.py) / rect.height) * v.h;
      return clampBounds({ ...v, x: d.vx - dx, y: d.vy - dy });
    });
  }, []);

  const endDrag = useCallback(() => {
    drag.current = null;
  }, []);

  const zoomButton = (factor: number) =>
    setVb((v) => zoomView(v, factor, v.x + v.w / 2, v.y + v.h / 2));

  const pinXY = project(pin.lon, pin.lat);
  const k = vb.w / 360; // fator p/ manter o pino ~constante na tela

  return (
    <div className="relative rounded-2xl border gd-border overflow-hidden bg-slate-950 shadow-2xl">
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="w-full cursor-grab active:cursor-grabbing touch-none select-none"
        style={{ aspectRatio: "2 / 1" }}
        role="img"
        aria-label="Globo terrestre com o país-alvo marcado (arraste para mover, role para dar zoom)"
      >
        <image href={EARTH_TEXTURE_URL} x={0} y={0} width={360} height={180} preserveAspectRatio="none" />
        {borders && (
          <path
            d={borders}
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={0.7}
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        )}
        {/* pino do país-alvo (nome escondido até o fim) */}
        <g pointerEvents="none">
          <circle cx={pinXY[0]} cy={pinXY[1]} r={8 * k} fill="#ef4444" opacity={0.35} className="animate-ping" />
          <circle cx={pinXY[0]} cy={pinXY[1]} r={3.5 * k} fill="#dc2626" stroke="#fff" strokeWidth={1 * k} />
          <text
            x={pinXY[0]}
            y={pinXY[1] - 6 * k}
            textAnchor="middle"
            fill="#fecaca"
            fontSize={5 * k}
            fontWeight="black"
            style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 0.8 * k }}
          >
            {label}
          </text>
        </g>
      </svg>

      {/* controles de zoom */}
      <div className="absolute right-2 top-2 flex flex-col gap-1.5 z-10">
        <button
          onClick={() => zoomButton(0.7)}
          aria-label="Aproximar"
          className="flex size-8 items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur hover:bg-black/90 shadow-md transition-all active:scale-95"
        >
          <Plus size={16} aria-hidden />
        </button>
        <button
          onClick={() => zoomButton(1.4)}
          aria-label="Afastar"
          className="flex size-8 items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur hover:bg-black/90 shadow-md transition-all active:scale-95"
        >
          <Minus size={16} aria-hidden />
        </button>
        <button
          onClick={() => setVb(FULL)}
          aria-label="Ver o mundo inteiro"
          className="flex size-8 items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur hover:bg-black/90 shadow-md transition-all active:scale-95"
        >
          <Maximize size={15} aria-hidden />
        </button>
      </div>

      <div className="absolute bottom-2 left-2 pointer-events-none rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur">
        💡 Arraste para mover · Role para dar zoom
      </div>
    </div>
  );
}
