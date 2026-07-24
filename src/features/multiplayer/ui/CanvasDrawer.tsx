"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Trash2, Eraser } from "lucide-react";

interface Props {
  isDrawer: boolean;
  canvasData?: string;
  onCanvasChange?: (dataUrl: string) => void;
}

const COLORS = [
  "#ffffff", // Branco
  "#ef4444", // Vermelho
  "#f97316", // Laranja
  "#eab308", // Amarelo
  "#10b981", // Verde
  "#3b82f6", // Azul
  "#a855f7", // Roxo
  "#ec4899", // Rosa
  "#000000", // Preto
];

const LINE_WIDTHS = [3, 6, 12];

export function CanvasDrawer({ isDrawer, canvasData, onCanvasChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(6);
  const [isEraser, setIsEraser] = useState(false);

  // Redimensiona o canvas e limpa o fundo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configura fundo preto/escuro padrão
    if (canvas.width !== 360 || canvas.height !== 260) {
      canvas.width = 360;
      canvas.height = 260;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Atualiza o canvas quando os dados remotos mudam para os espectadores
  useEffect(() => {
    if (isDrawer || !canvasData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = canvasData;
  }, [canvasData, isDrawer]);

  const emitChange = useCallback(() => {
    if (!isDrawer || !onCanvasChange || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onCanvasChange(dataUrl);
  }, [isDrawer, onCanvasChange]);

  function startDrawing(x: number, y: number) {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? "#0f172a" : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function draw(x: number, y: number) {
    if (!isDrawer || !isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (!isDrawer || !isDrawing) return;
    setIsDrawing(false);
    emitChange();
  }

  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }

  function clearCanvas() {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    emitChange();
  }

  return (
    <div className="space-y-3">
      {/* Quadro de Desenho */}
      <div className="relative mx-auto size-full max-w-[360px] overflow-hidden rounded-2xl border-2 border-purple-500/50 shadow-2xl touch-none bg-slate-900">
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => {
            const { x, y } = getCanvasCoords(e);
            startDrawing(x, y);
          }}
          onMouseMove={(e) => {
            const { x, y } = getCanvasCoords(e);
            draw(x, y);
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            const { x, y } = getCanvasCoords(e);
            startDrawing(x, y);
          }}
          onTouchMove={(e) => {
            const { x, y } = getCanvasCoords(e);
            draw(x, y);
          }}
          onTouchEnd={stopDrawing}
          className={`h-[260px] w-full ${isDrawer ? "cursor-crosshair" : "cursor-default"}`}
        />
      </div>

      {/* Ferramentas de Desenho (Apenas para o Desenhista) */}
      {isDrawer && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl gd-surface border gd-border p-3">
          {/* Paleta de Cores */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                style={{ backgroundColor: c }}
                className={`size-6 rounded-full border border-white/20 transition-transform ${
                  color === c && !isEraser ? "scale-125 ring-2 ring-purple-400" : "hover:scale-110"
                }`}
              />
            ))}
          </div>

          {/* Espessura e Borracha */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border gd-border">
              {LINE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setLineWidth(w)}
                  className={`size-6 rounded-lg text-[10px] font-black flex items-center justify-center ${
                    lineWidth === w ? "bg-purple-500 text-white" : "gd-muted"
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                isEraser ? "bg-rose-500 text-white border-rose-400" : "gd-surface border gd-border gd-muted"
              }`}
            >
              <Eraser size={16} />
            </button>

            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl border gd-surface border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
