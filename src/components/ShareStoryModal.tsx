"use client";

import { useState, useRef } from "react";
import { toPng, toBlob } from "html-to-image";
import { X, Download, Share2, Sparkles, Trophy, Flame, Check, Star, Gamepad2, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GAME_CATALOG } from "@/games/core/registry";
import type { TodayResult } from "@/lib/firebase/AuthProvider";

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  streak: number;
  dateLabel: string;
  todayResults: TodayResult[];
}

export function ShareStoryModal({
  isOpen,
  onClose,
  username,
  streak,
  dateLabel,
  todayResults,
}: ShareStoryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resultByGame = new Map(todayResults.map((r) => [r.gameId, r]));
  const totalScore = todayResults.reduce((acc, r) => acc + r.score, 0);
  const completedCount = todayResults.length;

  async function handleDownloadImage() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `geekdaily-story-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem para o Story:", err);
    } finally {
      setDownloading(false);
    }
  }

  async function handleNativeShare() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const blob = await toBlob(cardRef.current, { pixelRatio: 2 });
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], "geekdaily-story.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Meu resultado no GeekDaily",
            text: `Confira meu resultado de hoje no GeekDaily! Fiz ${totalScore} pontos! 🚀`,
            files: [file],
          });
          setDownloading(false);
          return;
        }
      }
      // Fallback para download se o navegador não suportar compartilhamento de arquivos
      await handleDownloadImage();
    } catch (err) {
      console.error("Erro ao compartilhar imagem:", err);
      await handleDownloadImage();
    } finally {
      setDownloading(false);
    }
  }

  function handleCopyText() {
    const text = `🎮 GeekDaily (${dateLabel})\n🏆 ${totalScore} / 1000 pts · ${completedCount}/5 Jogos Concluídos\n🔥 Streak: ${streak} dias\n\nJogue você também: https://atividades-diarias-55f5d.web.app`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-3xl border gd-border bg-[var(--color-bg)] p-5 shadow-2xl space-y-4 my-auto">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={20} />
            <h2 className="text-base font-black gd-text">Card de Instagram Stories</h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-gray-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTAINER DO CARD VISUAL DE STORIES (PROPORÇÃO 9:16) */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="relative w-[310px] h-[550px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 flex flex-col justify-between shadow-2xl text-white select-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 75%), radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 60%)",
            }}
          >
            {/* Header com Marca & Data */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg">
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">GeekDaily</h3>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{dateLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/40">
                <Flame size={14} className="text-amber-400" />
                <span>{streak}d Streak</span>
              </div>
            </div>

            {/* Nome do Jogador */}
            <div className="my-1 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Desafio Diário Concluído</span>
              <h4 className="text-xl font-black text-white drop-shadow-md">{username}</h4>
            </div>

            {/* Placar Principal */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 text-center backdrop-blur-sm shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="text-yellow-400 animate-bounce" size={24} />
                <span className="text-3xl font-black text-white tracking-tight">{totalScore}</span>
                <span className="text-xs font-bold text-gray-400">/ 1000 pts</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-400">
                {completedCount}/5 Desafios Jogados Hoje
              </p>
            </div>

            {/* Lista dos 5 Jogos em Estilo Badge */}
            <div className="space-y-1.5 my-1">
              {GAME_CATALOG.map((meta) => {
                const res = resultByGame.get(meta.id);
                const isDone = Boolean(res);
                const stars = res ? res.stars : null;

                return (
                  <div
                    key={meta.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 border text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-500/15 border-emerald-500/40 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <Check size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-gray-500 shrink-0" />
                      )}
                      <span className="truncate max-w-[150px]">{meta.name}</span>
                    </div>

                    {isDone ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-amber-300 font-extrabold">{res?.score} pts</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: stars ?? 1 }).map((_, i) => (
                            <Star key={i} size={10} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-normal">Pendente</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer do Card com Link Teaser */}
            <div className="pt-2 border-t border-white/10 text-center">
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Jogue também no navegador</p>
              <p className="text-xs font-extrabold text-white">atividades-diarias-55f5d.web.app</p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2 pt-1">
          <Button
            onClick={handleNativeShare}
            disabled={downloading}
            size="lg"
            className="w-full font-bold shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
          >
            <Share2 size={18} />
            {downloading ? "Gerando Story…" : "Compartilhar Imagem no Stories"}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={handleDownloadImage}
              disabled={downloading}
              className="font-bold text-xs"
            >
              <Download size={15} /> Baixar PNG
            </Button>
            <Button
              variant="secondary"
              onClick={handleCopyText}
              className="font-bold text-xs"
            >
              {copied ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
              {copied ? "Copiado!" : "Copiar Texto"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
