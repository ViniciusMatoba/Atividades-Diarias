"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Plus, LogIn, UserX } from "lucide-react";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import { getOrCreateUserSeedId } from "@/lib/userSeed";
import type { ImpostorRoom, MultiplayerPlayer } from "@/features/multiplayer/types";
import { createRoom, joinRoom } from "@/features/multiplayer/services/roomService";
import { ImpostorGameRoom } from "@/features/multiplayer/ui/ImpostorGameRoom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const AVATARS = ["🧙‍♂️", "🥷", "🦸‍♂️", "🦹‍♂️", "🤖", "🐉", "🦊", "👾", "👑", "⚡"];

export default function FriendsPage() {
  const { user } = useAuthCtx();
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🧙‍♂️");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [activeRoom, setActiveRoom] = useState<ImpostorRoom | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) {
      setPlayerName(user.displayName);
    } else {
      setPlayerName(`Jogador_${Math.floor(Math.random() * 900 + 100)}`);
    }
  }, [user]);

  const currentPlayer: MultiplayerPlayer = {
    id: getOrCreateUserSeedId(user?.uid),
    name: playerName.trim() || "Jogador",
    avatar: selectedAvatar,
    isHost: false,
    score: 0,
  };

  async function handleCreateRoom() {
    if (!playerName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const room = await createRoom({ ...currentPlayer, isHost: true });
      setActiveRoom(room);
    } catch {
      setError("Erro ao criar a sala. Tente novamente.");
    }
    setBusy(false);
  }

  async function handleJoinRoom() {
    if (!roomCodeInput.trim() || !playerName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const room = await joinRoom(roomCodeInput.trim(), currentPlayer);
      if (room) {
        setActiveRoom(room);
      } else {
        setError("Sala não encontrada. Verifique o código digitado.");
      }
    } catch {
      setError("Erro ao entrar na sala.");
    }
    setBusy(false);
  }

  if (activeRoom) {
    return (
      <div className="py-4">
        <ImpostorGameRoom
          initialRoom={activeRoom}
          currentPlayer={currentPlayer}
          onLeave={() => setActiveRoom(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto py-2">
      <header className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold gd-muted">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="text-xl font-black tracking-tight gd-text flex items-center gap-2">
          <Users className="text-purple-400" size={22} /> Jogar com Amigos
        </h1>
      </header>

      {/* Banner Explicativo */}
      <div className="relative overflow-hidden rounded-2xl border gd-border bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <UserX size={28} />
        </div>
        <h2 className="text-2xl font-black text-white">Impostor Geek</h2>
        <p className="mt-1 text-xs text-purple-200/80 leading-relaxed max-w-sm mx-auto">
          Crie uma sala com código para jogar com seus amigos em tempo real! Todos recebem a palavra secreta da rodada, exceto o <strong className="text-rose-400">Impostor</strong>.
        </p>
      </div>

      {/* Perfil no Multiplayer */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-extrabold gd-text">Seu Perfil de Jogador</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold gd-muted mb-1">Seu Apelido na Sala</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full rounded-xl border gd-border gd-surface px-3.5 py-2.5 text-sm font-bold gd-text focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold gd-muted mb-1.5">Escolha seu Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`size-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? "bg-purple-500 text-white scale-110 shadow-md border-2 border-purple-300"
                      : "gd-surface border gd-border hover:bg-purple-500/20"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Ações de Sala (Criar / Entrar) */}
      <div className="space-y-3">
        <Card className="p-5 space-y-3 border-purple-500/40 bg-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500 text-white font-black">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold gd-text">Criar Nova Sala</h3>
              <p className="text-xs gd-muted">Seja o líder e convide sua galera</p>
            </div>
          </div>
          <Button onClick={handleCreateRoom} disabled={!playerName.trim() || busy} size="lg" className="w-full font-bold shadow-md">
            {busy ? "Criando…" : "Criar Sala com Código"}
          </Button>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-800 text-purple-400 font-black border border-purple-500/30">
              <LogIn size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold gd-text">Entrar em uma Sala</h3>
              <p className="text-xs gd-muted">Digite o código recebido do seu amigo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Ex: GEEK-4921"
              maxLength={9}
              className="flex-1 rounded-xl border gd-border gd-surface px-3.5 py-2.5 text-sm font-extrabold tracking-widest uppercase gd-text focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={handleJoinRoom} disabled={!roomCodeInput.trim() || !playerName.trim() || busy} variant="secondary" className="font-bold">
              Entrar
            </Button>
          </div>
        </Card>

        {error && <p className="text-center text-sm font-bold text-[var(--color-danger)]">{error}</p>}
      </div>
    </div>
  );
}
