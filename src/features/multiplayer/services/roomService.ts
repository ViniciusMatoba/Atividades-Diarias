import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import {
  IMPOSTOR_WORDS_CATALOG,
  HERD_PROMPTS_CATALOG,
  DRAW_WORDS_CATALOG,
  type ImpostorRoom,
  type MultiplayerPlayer,
  type PlayerHint,
  type PlayerVote,
  type PlayerHerdAnswer,
  type ChatMessage,
  type GameMode,
} from "../types";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GEEK-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function subscribeToRoom(roomId: string, onUpdate: (room: ImpostorRoom | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      const ref = doc(db, "multiplayerRooms", roomId.toUpperCase());
      return onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            onUpdate(snap.data() as ImpostorRoom);
          } else {
            onUpdate(null);
          }
        },
        () => {
          onUpdate(getRoomFromLocalStorage(roomId));
        },
      );
    } catch {
      // fallback
    }
  }

  // Fallback para localStorage + BroadcastChannel
  const updateLocal = () => onUpdate(getRoomFromLocalStorage(roomId));
  updateLocal();

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    bc = new BroadcastChannel(`impostor_room_${roomId.toUpperCase()}`);
    bc.onmessage = () => updateLocal();
  }

  const interval = setInterval(updateLocal, 1000);

  return () => {
    clearInterval(interval);
    if (bc) bc.close();
  };
}

function getRoomFromLocalStorage(roomId: string): ImpostorRoom | null {
  try {
    const raw = localStorage.getItem(`impostor_room:${roomId.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRoomToLocalStorage(room: ImpostorRoom) {
  try {
    localStorage.setItem(`impostor_room:${room.id}`, JSON.stringify(room));
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel(`impostor_room_${room.id}`);
      bc.postMessage("update");
      bc.close();
    }
  } catch {
    // quota
  }
}

export async function createRoom(hostPlayer: MultiplayerPlayer, gameMode: GameMode = "impostor"): Promise<ImpostorRoom> {
  const roomId = generateRoomCode();
  const room: ImpostorRoom = {
    id: roomId,
    createdAt: Date.now(),
    hostId: hostPlayer.id,
    gameMode,
    status: "lobby",
    category: "",
    secretWord: "",
    impostorId: "",
    players: [hostPlayer],
    hints: [],
    votes: [],
    herdAnswers: [],
  };

  saveRoomToLocalStorage(room);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await setDoc(doc(db, "multiplayerRooms", roomId), room);
    } catch {
      // fallback
    }
  }

  return room;
}

export async function joinRoom(roomId: string, player: MultiplayerPlayer): Promise<ImpostorRoom | null> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);

  if (!room && isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await doc(db, "multiplayerRooms", code);
    } catch {
      // fallback
    }
  }

  if (!room) return null;

  const existingIdx = room.players.findIndex((p) => p.id === player.id);
  const updatedPlayers = [...room.players];
  if (existingIdx >= 0) {
    updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx]!, ...player };
  } else {
    updatedPlayers.push(player);
  }

  const updatedRoom: ImpostorRoom = { ...room, players: updatedPlayers };
  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), { players: updatedPlayers });
    } catch {
      // fallback
    }
  }

  return updatedRoom;
}

export async function setRoomGameMode(roomId: string, gameMode: GameMode): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room) return;

  const updatedRoom = { ...room, gameMode };
  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), { gameMode });
    } catch {
      // fallback
    }
  }
}

export async function updateRoomCanvasData(roomId: string, canvasData: string): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room) return;

  const updatedRoom = { ...room, canvasData };
  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), { canvasData });
    } catch {
      // fallback
    }
  }
}

export async function submitDrawChatGuess(roomId: string, message: { playerId: string; playerName: string; text: string }): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room || !room.drawWord) return;

  const normGuess = message.text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normTarget = room.drawWord.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const isCorrect = normGuess === normTarget;
  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    playerId: message.playerId,
    playerName: message.playerName,
    text: message.text,
    isCorrect,
    timestamp: Date.now(),
  };

  const currentMsgs = room.chatMessages ?? [];
  const updatedMsgs = [...currentMsgs, newMsg];
  let correctGuessers = room.correctGuessers ?? [];
  let updatedPlayers = room.players;
  let newStatus = room.status;

  if (isCorrect && !correctGuessers.includes(message.playerId)) {
    correctGuessers = [...correctGuessers, message.playerId];
    
    // Premia +500 pts para quem acertou e +200 pts para quem desenhou
    updatedPlayers = room.players.map((p) => {
      if (p.id === message.playerId) return { ...p, score: p.score + 500 };
      if (p.id === room.drawerId) return { ...p, score: p.score + 200 };
      return p;
    });

    // Se todos os adivinhadores acertaram, finaliza a rodada
    const totalGuessers = room.players.length - 1;
    if (correctGuessers.length >= totalGuessers) {
      newStatus = "result";
    }
  }

  const updatedRoom: ImpostorRoom = {
    ...room,
    chatMessages: updatedMsgs,
    correctGuessers,
    players: updatedPlayers,
    status: newStatus,
    winner: newStatus === "result" ? "draw_finished" : undefined,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        chatMessages: updatedMsgs,
        correctGuessers,
        players: updatedPlayers,
        status: newStatus,
        winner: newStatus === "result" ? "draw_finished" : undefined,
      });
    } catch {
      // fallback
    }
  }
}

export async function startNewRound(roomId: string): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room || room.players.length === 0) return;

  if (room.gameMode === "draw") {
    const drawWord = DRAW_WORDS_CATALOG[Math.floor(Math.random() * DRAW_WORDS_CATALOG.length)]!;
    // Alterna o desenhista para o próximo jogador
    const currentDrawerIdx = room.players.findIndex((p) => p.id === room.drawerId);
    const nextDrawer = room.players[(currentDrawerIdx + 1) % room.players.length]!;

    const updatedRoom: ImpostorRoom = {
      ...room,
      status: "hints",
      drawerId: nextDrawer.id,
      drawWord,
      canvasData: "",
      chatMessages: [],
      correctGuessers: [],
      winner: undefined,
    };
    saveRoomToLocalStorage(updatedRoom);

    if (isFirebaseClientConfigured) {
      try {
        const db = getDb();
        await updateDoc(doc(db, "multiplayerRooms", code), {
          status: "hints",
          drawerId: nextDrawer.id,
          drawWord,
          canvasData: "",
          chatMessages: [],
          correctGuessers: [],
          winner: undefined,
        });
      } catch {
        // fallback
      }
    }
    return;
  }

  if (room.gameMode === "herd") {
    const prompt = HERD_PROMPTS_CATALOG[Math.floor(Math.random() * HERD_PROMPTS_CATALOG.length)]!;
    const updatedRoom: ImpostorRoom = {
      ...room,
      status: "hints",
      category: prompt.category,
      herdQuestion: prompt.question,
      herdAnswers: [],
      majorityAnswers: [],
      winner: undefined,
    };
    saveRoomToLocalStorage(updatedRoom);

    if (isFirebaseClientConfigured) {
      try {
        const db = getDb();
        await updateDoc(doc(db, "multiplayerRooms", code), {
          status: "hints",
          category: prompt.category,
          herdQuestion: prompt.question,
          herdAnswers: [],
          majorityAnswers: [],
          winner: undefined,
        });
      } catch {
        // fallback
      }
    }
    return;
  }

  const item = IMPOSTOR_WORDS_CATALOG[Math.floor(Math.random() * IMPOSTOR_WORDS_CATALOG.length)]!;
  const impostor = room.players[Math.floor(Math.random() * room.players.length)]!;

  const updatedRoom: ImpostorRoom = {
    ...room,
    status: "hints",
    category: item.category,
    secretWord: item.word,
    impostorId: impostor.id,
    hints: [],
    votes: [],
    impostorFinalGuess: undefined,
    winner: undefined,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        status: "hints",
        category: item.category,
        secretWord: item.word,
        impostorId: impostor.id,
        hints: [],
        votes: [],
        impostorFinalGuess: undefined,
        winner: undefined,
      });
    } catch {
      // fallback
    }
  }
}

export async function submitHerdAnswer(roomId: string, answer: PlayerHerdAnswer): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room) return;

  const currentAnswers = room.herdAnswers ?? [];
  const updatedAnswers = [...currentAnswers.filter((a) => a.playerId !== answer.playerId), answer];
  const allSubmitted = updatedAnswers.length >= room.players.length;

  let newStatus = room.status;
  const majorityAnswers: string[] = [];
  let updatedPlayers = room.players;

  if (allSubmitted) {
    newStatus = "result";
    // Calcula a resposta da maioria
    const counts = new Map<string, { count: number; rawText: string }>();
    for (const a of updatedAnswers) {
      const norm = a.answerText.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const existing = counts.get(norm);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(norm, { count: 1, rawText: a.answerText.trim() });
      }
    }

    let maxCount = 0;
    counts.forEach((val) => {
      if (val.count > maxCount) maxCount = val.count;
    });

    const winnersNorm = new Set<string>();
    counts.forEach((val, normKey) => {
      if (val.count === maxCount) {
        winnersNorm.add(normKey);
        majorityAnswers.push(val.rawText);
      }
    });

    // Premia +300 pts para quem respondeu igual a maioria
    updatedPlayers = room.players.map((p) => {
      const playerAns = updatedAnswers.find((a) => a.playerId === p.id);
      if (playerAns) {
        const norm = playerAns.answerText.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (winnersNorm.has(norm)) {
          return { ...p, score: p.score + 300 };
        }
      }
      return p;
    });
  }

  const updatedRoom: ImpostorRoom = {
    ...room,
    herdAnswers: updatedAnswers,
    status: newStatus,
    majorityAnswers,
    players: updatedPlayers,
    winner: allSubmitted ? "herd_winners" : undefined,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        herdAnswers: updatedAnswers,
        status: newStatus,
        majorityAnswers,
        players: updatedPlayers,
        winner: allSubmitted ? "herd_winners" : undefined,
      });
    } catch {
      // fallback
    }
  }
}

export async function submitPlayerHint(roomId: string, hint: PlayerHint): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room) return;

  const updatedHints = [...room.hints.filter((h) => h.playerId !== hint.playerId), hint];
  const allHintsSubmitted = updatedHints.length >= room.players.length;
  const newStatus = allHintsSubmitted ? "voting" : "hints";

  const updatedRoom: ImpostorRoom = {
    ...room,
    hints: updatedHints,
    status: newStatus,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        hints: updatedHints,
        status: newStatus,
      });
    } catch {
      // fallback
    }
  }
}

export async function submitPlayerVote(roomId: string, vote: PlayerVote): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room) return;

  const updatedVotes = [...room.votes.filter((v) => v.voterId !== vote.voterId), vote];
  const allVoted = updatedVotes.length >= room.players.length;

  let winner = room.winner;
  let newStatus = room.status;

  if (allVoted) {
    newStatus = "result";
    // Contabiliza os votos
    const voteCounts = new Map<string, number>();
    for (const v of updatedVotes) {
      voteCounts.set(v.targetPlayerId, (voteCounts.get(v.targetPlayerId) ?? 0) + 1);
    }

    let maxVotes = 0;
    let mostVotedId = "";
    voteCounts.forEach((count, pid) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = pid;
      }
    });

    if (mostVotedId === room.impostorId) {
      winner = "players";
    } else {
      winner = "impostor";
    }

    // Atualiza pontuações dos jogadores
    const updatedPlayers = room.players.map((p) => {
      if (winner === "impostor" && p.id === room.impostorId) {
        return { ...p, score: p.score + 500 };
      }
      if (winner === "players" && p.id !== room.impostorId) {
        return { ...p, score: p.score + 300 };
      }
      return p;
    });

    room.players = updatedPlayers;
  }

  const updatedRoom: ImpostorRoom = {
    ...room,
    votes: updatedVotes,
    status: newStatus,
    winner,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        votes: updatedVotes,
        status: newStatus,
        winner,
        players: room.players,
      });
    } catch {
      // fallback
    }
  }
}
