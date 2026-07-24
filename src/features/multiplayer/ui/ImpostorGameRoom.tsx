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
} from "lucide-react";
import type { ImpostorRoom, MultiplayerPlayer } from "../types";
import {
  subscribeToRoom,
  startNewRound,
  submitPlayerHint,
  submitPlayerVote,
} from "../services/roomService";
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
  const myHint = room.hints.find((h) => h.playerId === currentPlayer.id);
  const myVote = room.votes.find((v) => v.voterId === currentPlayer.id);

  function copyCode() {
    if (typeof navigator !== "undefined") {
      void navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleStartRound() {
    if (!isHost || busy) return;
    setBusy(true);
    await startNewRound(room.id);
    setBusy(false);
    setShowSecret(false);
    setHintInput("");
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
            Sala de Amigos
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
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-black gd-text">Aguardando Amigos</h2>
            <p className="text-xs gd-muted">
              Compartilhe o código <strong className="text-purple-300 font-bold">{room.id}</strong> para jogarem juntos!
            </p>
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
              <Play size={18} /> Iniciar Rodada
            </Button>
          ) : (
            <p className="text-xs font-bold text-purple-300 animate-pulse">
              Aguardando o líder iniciar a partida…
            </p>
          )}
        </Card>
      )}

      {/* TELA DE DICAS (FASE 1 DA RODADA) */}
      {room.status === "hints" && (
        <div className="space-y-4">
          {/* Card do Papel Secreto */}
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

          {/* Envio de Dica */}
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

          {/* Lista de Dicas Recebidas */}
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

      {/* TELA DE VOTAÇÃO (FASE 2 DA RODADA) */}
      {room.status === "voting" && (
        <Card className="p-6 space-y-6 text-center border-purple-500/40">
          <div className="space-y-1">
            <Vote size={32} className="mx-auto text-purple-400 mb-1" />
            <h2 className="text-2xl font-black gd-text">Hora de Votar!</h2>
            <p className="text-xs gd-muted">Quem você acha que é o Impostor da rodada?</p>
          </div>

          {/* Dicas da rodada para releitura */}
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

          {/* Opções de Voto */}
          {myVote ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-300">
              ✓ Voto registrado! Aguardando o restante da sala…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                {room.players.map((p) => {
                  if (p.id === currentPlayer.id) return null; // Não pode votar em si mesmo
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
              {room.winner === "players" ? "🎉 Jogadores Venceram!" : "🕵️‍♂️ Impostor Venceu!"}
            </h2>
            <p className="text-xs gd-muted">
              {room.winner === "players"
                ? "O grupo identificou o impostor com sucesso!"
                : "O impostor conseguiu enganar a sala completa!"}
            </p>
          </div>

          <div className="rounded-2xl border gd-border bg-black/40 p-4 space-y-2 text-center">
            <span className="text-xs uppercase font-bold text-purple-300">Revelação da Rodada</span>
            <p className="text-sm font-bold gd-text">
              Palavra Secreta: <strong className="text-purple-300 font-extrabold">{room.secretWord}</strong>
            </p>
            <p className="text-sm font-bold text-rose-400">
              Impostor Secreto: {room.players.find((p) => p.id === room.impostorId)?.name}
            </p>
          </div>

          {/* Ranking Atualizado da Sala */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Placar da Sala
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
              <RotateCcw size={18} /> Jogar Próxima Rodada
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
