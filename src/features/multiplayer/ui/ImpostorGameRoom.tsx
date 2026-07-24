"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Copy,
  Check,
  Play,
  Eye,
  EyeOff,
  Send,
  Vote,
  Trophy,
  RotateCcw,
  Sparkles,
  Shield,
  UserX,
  Brain,
  Paintbrush,
} from "lucide-react";
import type { ImpostorRoom, MultiplayerPlayer, GameMode } from "../types";
import {
  subscribeToRoom,
  startNewRound,
  submitPlayerHint,
  submitPlayerVote,
  submitHerdAnswer,
  setRoomGameMode,
  updateRoomCanvasData,
  submitDrawChatGuess,
} from "../services/roomService";
import { CanvasDrawer } from "./CanvasDrawer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Props {
  initialRoom: ImpostorRoom;
  currentPlayer: MultiplayerPlayer;
  onLeave: () => void;
}

export function ImpostorGameRoom({ initialRoom, currentPlayer, onLeave }: Props) {
  const [room, setRoom] = useState<ImpostorRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [hintInput, setHintInput] = useState("");
  const [herdInput, setHerdInput] = useState("");
  const [drawChatInput, setDrawChatInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToRoom(initialRoom.id, (updated) => {
      if (updated) setRoom(updated);
    });
    return () => unsubscribe();
  }, [initialRoom.id]);

  const isHost = currentPlayer.id === room.hostId;
  const isImpostor = currentPlayer.id === room.impostorId;
  const isHerdMode = room.gameMode === "herd";
  const isDrawMode = room.gameMode === "draw";
  const isDrawer = currentPlayer.id === room.drawerId;

  const myHint = room.hints.find((h) => h.playerId === currentPlayer.id);
  const myHerdAns = (room.herdAnswers ?? []).find((a) => a.playerId === currentPlayer.id);
  const myVote = room.votes.find((v) => v.voterId === currentPlayer.id);

  function copyCode() {
    if (typeof navigator !== "undefined") {
      void navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleToggleMode(mode: GameMode) {
    if (!isHost || busy) return;
    setBusy(true);
    await setRoomGameMode(room.id, mode);
    setBusy(false);
  }

  async function handleStartRound() {
    if (!isHost || busy) return;
    setBusy(true);
    await startNewRound(room.id);
    setBusy(false);
    setShowSecret(false);
    setHintInput("");
    setHerdInput("");
    setDrawChatInput("");
    setSelectedVoteId("");
  }

  async function handleSendHint() {
    if (!hintInput.trim() || busy) return;
    setBusy(true);
    await submitPlayerHint(room.id, {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      hintText: hintInput.trim(),
    });
    setHintInput("");
    setBusy(false);
  }

  async function handleSendHerdAnswer() {
    if (!herdInput.trim() || busy) return;
    setBusy(true);
    await submitHerdAnswer(room.id, {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      answerText: herdInput.trim(),
    });
    setHerdInput("");
    setBusy(false);
  }

  async function handleSendDrawGuess() {
    if (!drawChatInput.trim() || busy) return;
    setBusy(true);
    await submitDrawChatGuess(room.id, {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      text: drawChatInput.trim(),
    });
    setDrawChatInput("");
    setBusy(false);
  }

  async function handleSendVote() {
    if (!selectedVoteId || busy) return;
    setBusy(true);
    await submitPlayerVote(room.id, {
      voterId: currentPlayer.id,
      targetPlayerId: selectedVoteId,
    });
    setBusy(false);
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header da Sala */}
      <header className="flex items-center justify-between rounded-2xl gd-glass p-4 border gd-border shadow-md">
        <div>
          <span className="block text-[10px] uppercase font-black tracking-wider text-purple-400">
            {isDrawMode ? "🎨 Desenho e Adivinhação" : isHerdMode ? "🧠 Mente Coletiva" : "🕵️‍♂️ Impostor Geek"}
          </span>
          <h1 className="text-2xl font-black gd-text tracking-widest flex items-center gap-2">
            {room.id}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={copyCode} className="font-bold">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {copied ? "Copiado!" : "Código"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLeave} className="text-xs font-bold text-rose-400">
            Sair
          </Button>
        </div>
      </header>

      {/* TELA DE LOBBY */}
      {room.status === "lobby" && (
        <Card className="p-6 text-center space-y-6 border-purple-500/30">
          <div className="space-y-2">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-lg">
              {isDrawMode ? <Paintbrush size={32} /> : isHerdMode ? <Brain size={32} /> : <Users size={32} />}
            </div>
            <h2 className="text-2xl font-black gd-text">Aguardando Amigos</h2>
            <p className="text-xs gd-muted">
              Compartilhe o código <strong className="text-purple-300 font-bold">{room.id}</strong> para jogarem juntos!
            </p>
          </div>

          {/* Seleção do Modo de Jogo */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Modo de Jogo Escolhido
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={!isHost}
                onClick={() => handleToggleMode("impostor")}
                className={`p-2.5 rounded-xl border text-left font-bold text-[11px] transition-all ${
                  room.gameMode === "impostor"
                    ? "border-purple-500 bg-purple-500/20 text-white shadow-md"
                    : "gd-border gd-surface gd-muted opacity-70"
                }`}
              >
                <div className="flex items-center gap-1 mb-1 font-black text-purple-300">
                  <UserX size={13} /> Impostor
                </div>
                Descubra o impostor!
              </button>
              <button
                disabled={!isHost}
                onClick={() => handleToggleMode("herd")}
                className={`p-2.5 rounded-xl border text-left font-bold text-[11px] transition-all ${
                  room.gameMode === "herd"
                    ? "border-purple-500 bg-purple-500/20 text-white shadow-md"
                    : "gd-border gd-surface gd-muted opacity-70"
                }`}
              >
                <div className="flex items-center gap-1 mb-1 font-black text-purple-300">
                  <Brain size={13} /> Mente Coletiva
                </div>
                Vote na maioria!
              </button>
              <button
                disabled={!isHost}
                onClick={() => handleToggleMode("draw")}
                className={`p-2.5 rounded-xl border text-left font-bold text-[11px] transition-all ${
                  room.gameMode === "draw"
                    ? "border-purple-500 bg-purple-500/20 text-white shadow-md"
                    : "gd-border gd-surface gd-muted opacity-70"
                }`}
              >
                <div className="flex items-center gap-1 mb-1 font-black text-purple-300">
                  <Paintbrush size={13} /> Desenho
                </div>
                Desenhe e adivinhe!
              </button>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Jogadores Conectados ({room.players.length})
            </span>
            <div className="space-y-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border gd-border gd-surface p-3 font-bold text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="gd-text">{p.name}</span>
                  </div>
                  {p.isHost && (
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-300 border border-purple-500/30">
                      LÍDER
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <Button
              onClick={handleStartRound}
              disabled={busy || room.players.length < 1}
              size="lg"
              className="w-full font-bold shadow-lg"
            >
              <Play size={18} /> Iniciar Rodada ({room.gameMode === "draw" ? "Desenho" : room.gameMode === "herd" ? "Mente Coletiva" : "Impostor"})
            </Button>
          ) : (
            <p className="text-xs font-bold text-purple-300 animate-pulse">
              Aguardando o líder iniciar a partida…
            </p>
          )}
        </Card>
      )}

      {/* TELA DA RODADA DE DESENHO E ADIVINHAÇÃO */}
      {isDrawMode && room.status === "hints" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 p-4 text-center shadow-xl">
            {isDrawer ? (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                  🎨 VOCÊ É O DESENHISTA!
                </span>
                <h3 className="text-2xl font-black text-white tracking-widest">
                  &quot;{room.drawWord}&quot;
                </h3>
                <p className="text-xs text-purple-300/80">Desenhe na lousa abaixo para os amigos adivinharem!</p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                  👀 ADIVINHE O DESENHO!
                </span>
                <h3 className="text-lg font-black text-purple-200">
                  Desenhista: {room.players.find((p) => p.id === room.drawerId)?.name}
                </h3>
                <p className="text-xs text-purple-300/80">Assista ao vivo e envie seu palpite no chat!</p>
              </div>
            )}
          </div>

          {/* Lousa do Desenho */}
          <CanvasDrawer
            isDrawer={isDrawer}
            canvasData={room.canvasData}
            onCanvasChange={(dataUrl) => void updateRoomCanvasData(room.id, dataUrl)}
          />

          {/* Chat de Adivinhação */}
          {!isDrawer && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={drawChatInput}
                  onChange={(e) => setDrawChatInput(e.target.value)}
                  placeholder="Digite seu palpite..."
                  className="flex-1 rounded-xl border gd-border gd-surface px-3.5 py-2.5 text-sm font-bold gd-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button onClick={handleSendDrawGuess} disabled={!drawChatInput.trim() || busy}>
                  <Send size={16} />
                </Button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border gd-border gd-surface p-3 text-xs font-bold">
                {(room.chatMessages ?? []).length === 0 ? (
                  <p className="text-center text-xs gd-muted py-2">Nenhum palpite enviado ainda...</p>
                ) : (
                  (room.chatMessages ?? [])
                    .slice()
                    .reverse()
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-center justify-between rounded-lg p-2 ${
                          msg.isCorrect
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/5 text-purple-200"
                        }`}
                      >
                        <span>
                          <strong>{msg.playerName}:</strong> {msg.text}
                        </span>
                        {msg.isCorrect && <span className="font-black text-emerald-400">🎉 ACERTOU! (+500 pts)</span>}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TELA DA RODADA DE MENTE COLETIVA */}
      {isHerdMode && room.status === "hints" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/60 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 p-6 text-center shadow-xl">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-purple-300 border border-white/10">
              Categoria: {room.category}
            </span>
            <div className="my-5">
              <Brain size={40} className="mx-auto text-purple-400 mb-2 animate-bounce" />
              <h3 className="text-xl font-black text-white leading-relaxed">
                &quot;{room.herdQuestion}&quot;
              </h3>
              <p className="mt-2 text-xs text-purple-300/90 font-semibold">
                Escreva a resposta que você acha que a MAIORIA da sala vai digitar!
              </p>
            </div>
          </div>

          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-extrabold gd-text flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Sua Resposta Secreta
            </h3>
            {myHerdAns ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm font-bold text-emerald-300">
                ✓ Resposta enviada: &quot;{myHerdAns.answerText}&quot; (Aguardando outros jogadores…)
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={herdInput}
                  onChange={(e) => setHerdInput(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="flex-1 rounded-xl border gd-border gd-surface px-3.5 py-2.5 text-sm font-bold gd-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button onClick={handleSendHerdAnswer} disabled={!herdInput.trim() || busy}>
                  <Send size={16} />
                </Button>
              </div>
            )}
          </Card>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Respostas Enviadas ({room.herdAnswers?.length ?? 0}/{room.players.length})
            </span>
            <div className="grid grid-cols-2 gap-2">
              {room.players.map((p) => {
                const hasAns = (room.herdAnswers ?? []).some((a) => a.playerId === p.id);
                return (
                  <div key={p.id} className="flex items-center gap-2 rounded-xl border gd-border gd-surface p-2.5 text-xs font-bold">
                    <span>{p.avatar}</span>
                    <span className="gd-text flex-1 truncate">{p.name}</span>
                    {hasAns ? <Check size={14} className="text-emerald-400" /> : <span className="text-purple-400 animate-pulse">…</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TELA DE DICAS DE IMPOSTOR GEEK */}
      {!isHerdMode && !isDrawMode && room.status === "hints" && (
        <div className="space-y-4">
          <div
            className={`relative overflow-hidden rounded-2xl border p-6 text-center shadow-xl transition-all ${
              isImpostor
                ? "border-rose-500/60 bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-900"
                : "border-purple-500/60 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-purple-300 border border-white/10">
                Categoria: {room.category}
              </span>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                {showSecret ? "Esconder" : "Revelar Papel"}
              </button>
            </div>

            <div className="my-6">
              {showSecret ? (
                isImpostor ? (
                  <div className="space-y-1 gd-bounce-in">
                    <UserX size={40} className="mx-auto text-rose-400 mb-2" />
                    <h3 className="text-3xl font-black text-rose-400 tracking-wider">
                      VOCÊ É O IMPOSTOR!
                    </h3>
                    <p className="text-xs text-rose-200/80">
                      Engane os outros jogadores e finga saber a palavra!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 gd-bounce-in">
                    <Shield size={40} className="mx-auto text-purple-400 mb-2" />
                    <span className="text-xs uppercase font-bold text-purple-300">Palavra Secreta</span>
                    <h3 className="text-3xl font-black text-white tracking-widest drop-shadow">
                      {room.secretWord}
                    </h3>
                  </div>
                )
              ) : (
                <div className="py-4 text-xs font-bold text-purple-300">
                  🔒 Clique em &quot;Revelar Papel&quot; para ver sua função secreta.
                </div>
              )}
            </div>
          </div>

          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-extrabold gd-text flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Escreva sua Dica da Rodada
            </h3>
            {myHint ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm font-bold text-emerald-300">
                ✓ Dica enviada: &quot;{myHint.hintText}&quot; (Aguardando outros jogadores…)
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hintInput}
                  onChange={(e) => setHintInput(e.target.value)}
                  placeholder="Escreva 1 dica sutil sobre o tema…"
                  className="flex-1 rounded-xl border gd-border gd-surface px-3.5 py-2.5 text-sm font-medium gd-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button onClick={handleSendHint} disabled={!hintInput.trim() || busy}>
                  <Send size={16} />
                </Button>
              </div>
            )}
          </Card>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Dicas dos Jogadores ({room.hints.length}/{room.players.length})
            </span>
            <div className="space-y-2">
              {room.hints.map((h) => (
                <div
                  key={h.playerId}
                  className="flex items-center justify-between rounded-xl border gd-border gd-surface p-3 text-sm font-bold"
                >
                  <span className="gd-text">{h.playerName}</span>
                  <span className="text-purple-300 italic">&quot;{h.hintText}&quot;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TELA DE VOTAÇÃO (APENAS IMPOSTOR GEEK) */}
      {!isHerdMode && !isDrawMode && room.status === "voting" && (
        <Card className="p-6 space-y-6 text-center border-purple-500/40">
          <div className="space-y-1">
            <Vote size={32} className="mx-auto text-purple-400 mb-1" />
            <h2 className="text-2xl font-black gd-text">Hora de Votar!</h2>
            <p className="text-xs gd-muted">Quem você acha que é o Impostor da rodada?</p>
          </div>

          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Dicas dadas nesta rodada:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {room.hints.map((h) => (
                <div key={h.playerId} className="rounded-xl border gd-border gd-surface p-2.5">
                  <span className="block text-[10px] gd-muted">{h.playerName}</span>
                  <span className="text-purple-300 italic">&quot;{h.hintText}&quot;</span>
                </div>
              ))}
            </div>
          </div>

          {myVote ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-300">
              ✓ Voto registrado! Aguardando o restante da sala…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                {room.players.map((p) => {
                  if (p.id === currentPlayer.id) return null;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedVoteId(p.id)}
                      className={`w-full flex items-center justify-between rounded-xl border p-3.5 font-bold text-sm transition-all ${
                        selectedVoteId === p.id
                          ? "border-rose-500 bg-rose-500/20 text-white shadow-lg scale-[1.02]"
                          : "gd-border gd-surface gd-text hover:border-purple-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.avatar}</span>
                        <span>{p.name}</span>
                      </div>
                      {selectedVoteId === p.id && <UserX size={18} className="text-rose-400" />}
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={handleSendVote}
                disabled={!selectedVoteId || busy}
                size="lg"
                className="w-full font-bold shadow-md bg-rose-600 hover:bg-rose-500"
              >
                Confirmar Voto no Impostor
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* TELA DE RESULTADO FINAL DA RODADA */}
      {room.status === "result" && (
        <Card className="gd-bounce-in p-6 space-y-6 text-center border-2 border-purple-500/50 shadow-2xl">
          <div className="space-y-2">
            <Trophy size={48} className="mx-auto text-amber-400 animate-bounce" />
            <h2 className="text-3xl font-black gd-text">
              {isDrawMode
                ? "🎨 Fim da Rodada de Desenho!"
                : isHerdMode
                ? "🧠 Resposta do Rebanho!"
                : room.winner === "players"
                ? "🎉 Jogadores Venceram!"
                : "🕵️‍♂️ Impostor Venceu!"}
            </h2>
            <p className="text-xs gd-muted">
              {isDrawMode
                ? `A palavra desenhada era: "${room.drawWord}"`
                : isHerdMode
                ? `A maioria respondeu: "${(room.majorityAnswers ?? []).join(" / ")}"`
                : room.winner === "players"
                ? "O grupo identificou o impostor com sucesso!"
                : "O impostor conseguiu enganar a sala completa!"}
            </p>
          </div>

          {/* Ranking Atualizado da Sala */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Placar Geral da Sala
            </span>
            <div className="space-y-1.5">
              {room.players
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border gd-border gd-surface p-3 font-bold text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-purple-400 font-black">#{idx + 1}</span>
                      <span>{p.avatar} {p.name}</span>
                    </div>
                    <span className="text-amber-400 font-black">{p.score} pts</span>
                  </div>
                ))}
            </div>
          </div>

          {isHost && (
            <Button onClick={handleStartRound} disabled={busy} size="lg" className="w-full font-bold shadow-lg">
              <RotateCcw size={18} /> Próxima Rodada ({isDrawMode ? "Desenho" : isHerdMode ? "Mente Coletiva" : "Impostor"})
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
